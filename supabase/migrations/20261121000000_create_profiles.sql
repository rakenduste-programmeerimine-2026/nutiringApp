-- profiles: one row per exam user (issue #2).
--
-- Login itself is handled by Supabase Auth (#6); this table only keeps the
-- public username and when the account was last used. No personal data is
-- stored here — the UI tells users not to use their real name.

create table public.profiles (
  -- Same id as the Supabase Auth user; deleting the auth user deletes the profile.
  id uuid primary key references auth.users (id) on delete cascade,

  -- Login name, 3–30 characters: latin letters, digits, "_" and "-".
  username text not null unique
    constraint profiles_username_format
      check (username ~ '^[a-zA-Z0-9_-]{3,30}$'),

  -- Set by the server on every successful login (see touch_last_active below).
  -- Accounts inactive for 3 months are removed by the cleanup job (#24).
  last_active_at timestamptz not null default now(),

  created_at timestamptz not null default now()
);

comment on table public.profiles is
  'Exam user profiles: username and last activity. Login is Supabase Auth.';

-- The hidden login email is <username>@nutiring.local and Supabase Auth
-- treats emails case-insensitively, so "Mari" and "mari" must not both exist.
create unique index profiles_username_lower_key
  on public.profiles (lower(username));

-- Used by the 3-month inactive-account cleanup (#24).
create index profiles_last_active_at_idx
  on public.profiles (last_active_at);

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------

alter table public.profiles enable row level security;

-- A logged-in user can read only their own profile.
create policy "profiles_select_own"
  on public.profiles for select
  to authenticated
  using ((select auth.uid()) = id);

-- A logged-in user can create only their own profile (done right after signup).
create policy "profiles_insert_own"
  on public.profiles for insert
  to authenticated
  with check ((select auth.uid()) = id);

-- No update or delete policies: clients cannot change last_active_at, rename
-- themselves or delete their row. On insert they may only set id and
-- username; the timestamps always come from the database defaults.
revoke all on public.profiles from anon, authenticated;
grant select on public.profiles to authenticated;
grant insert (id, username) on public.profiles to authenticated;

-- ---------------------------------------------------------------------------
-- last_active_at update
-- ---------------------------------------------------------------------------

-- Sets the caller's last_active_at to now(). Runs as the table owner so it
-- works without an update policy, but it can only touch the caller's own row
-- and only ever writes now(), so the client cannot fake the value.
create function public.touch_last_active()
returns void
language sql
security definer
set search_path = ''
as $$
  update public.profiles
     set last_active_at = now()
   where id = auth.uid();
$$;

revoke execute on function public.touch_last_active() from public, anon;
grant execute on function public.touch_last_active() to authenticated;
