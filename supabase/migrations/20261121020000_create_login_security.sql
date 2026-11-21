-- Login security (issue #23, decision 20.11.2026):
--   * 5 wrong PINs lock the account for 15 minutes
--   * at most 30 new accounts per hour from one IP address
--   * IP addresses are kept only 24 hours (cleanup job in #24)
--
-- Only the server (service role) uses these tables, through the helper
-- functions below. Normal users have no access at all.

-- ---------------------------------------------------------------------------
-- login_failures: wrong-PIN counter and lock per username
-- ---------------------------------------------------------------------------

create table public.login_failures (
  -- Stored in lower case: the hidden login email is case-insensitive, so
  -- "Mari" and "mari" are the same account. The helper functions lower-case
  -- their input.
  username text primary key
    constraint login_failures_username_lower check (username = lower(username)),

  -- Wrong PINs since the last successful login or the last lock.
  failed_count int not null default 0,

  -- Set when the account is locked; the lock is over once this is in the past.
  locked_until timestamptz,

  updated_at timestamptz not null default now()
);

comment on table public.login_failures is
  'Wrong-PIN counter and 15-minute lock per username. Server only.';

-- ---------------------------------------------------------------------------
-- signup_ips: when new accounts were created from which IP address
-- ---------------------------------------------------------------------------

create table public.signup_ips (
  id bigint generated always as identity primary key,
  ip inet not null,
  created_at timestamptz not null default now()
);

comment on table public.signup_ips is
  'IP address of each new account, for the 30-per-hour limit. Kept 24 hours (#24). Server only.';

-- "How many signups from this IP in the last hour".
create index signup_ips_ip_created_at_idx
  on public.signup_ips (ip, created_at);

-- ---------------------------------------------------------------------------
-- Access: RLS on, no policies, so only the service role can use the tables
-- ---------------------------------------------------------------------------

alter table public.login_failures enable row level security;
alter table public.signup_ips enable row level security;

revoke all on public.login_failures, public.signup_ips from anon, authenticated;
grant select, insert, update, delete on public.login_failures, public.signup_ips to service_role;

-- ---------------------------------------------------------------------------
-- Helper functions for the login code (#6)
-- ---------------------------------------------------------------------------

-- Is the account locked? Returns when the lock ends, or null if not locked.
create function public.is_login_locked(p_username text)
returns timestamptz
language sql
stable
security definer
set search_path = ''
as $$
  select locked_until
    from public.login_failures
   where username = lower(p_username)
     and locked_until > now();
$$;

-- Count one wrong PIN. The 5th one locks the account for 15 minutes and
-- starts the count again. Returns when the lock ends, or null if not locked.
create function public.register_failed_login(p_username text)
returns timestamptz
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_count int;
  v_locked_until timestamptz;
begin
  insert into public.login_failures as lf (username, failed_count, updated_at)
  values (lower(p_username), 1, now())
  on conflict (username) do update
    set failed_count = lf.failed_count + 1,
        updated_at = now()
  returning lf.failed_count, lf.locked_until into v_count, v_locked_until;

  if v_count >= 5 then
    update public.login_failures
       set failed_count = 0,
           locked_until = now() + interval '15 minutes',
           updated_at = now()
     where username = lower(p_username)
    returning locked_until into v_locked_until;
  end if;

  return case when v_locked_until > now() then v_locked_until end;
end;
$$;

-- Successful login: forget earlier wrong PINs.
create function public.clear_failed_logins(p_username text)
returns void
language sql
security definer
set search_path = ''
as $$
  delete from public.login_failures
   where username = lower(p_username);
$$;

-- How many accounts were created from this IP address in the last hour.
create function public.signups_from_ip_last_hour(p_ip inet)
returns int
language sql
stable
security definer
set search_path = ''
as $$
  select count(*)::int
    from public.signup_ips
   where ip = p_ip
     and created_at > now() - interval '1 hour';
$$;

-- Only the server may call them.
revoke execute on function
  public.is_login_locked(text),
  public.register_failed_login(text),
  public.clear_failed_logins(text),
  public.signups_from_ip_last_hour(inet)
from public, anon, authenticated;

grant execute on function
  public.is_login_locked(text),
  public.register_failed_login(text),
  public.clear_failed_logins(text),
  public.signups_from_ip_last_hour(inet)
to service_role;
