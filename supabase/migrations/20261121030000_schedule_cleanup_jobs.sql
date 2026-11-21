-- Nightly cleanup (issue #24). Runs inside Supabase with pg_cron; nobody has
-- to click anything.
--
-- What runs when (pg_cron uses UTC; 01:00 UTC is 03:00 in Tallinn in winter
-- and 04:00 in summer):
--   01:00 UTC  delete-inactive-accounts  accounts unused for 3 months, with
--                                        their profile and exam results
--   01:00 UTC  purge-old-signup-ips      IP addresses older than 24 hours and
--                                        old wrong-PIN counters
--
-- Both functions can also be run by hand from the SQL editor, e.g.
--   select public.delete_inactive_accounts();

create extension if not exists pg_cron with schema pg_catalog;

-- ---------------------------------------------------------------------------
-- 1. Accounts not used for 3 months
-- ---------------------------------------------------------------------------

-- "Used" = profiles.last_active_at, which is set on login (#6) and when an
-- exam result is saved (#3). Deleting the auth user also deletes the profile
-- and the exam results (on delete cascade).
--
-- An auth user without a profile (signup stopped half-way) counts as unused
-- from the moment it was created.
--
-- Returns how many accounts were deleted.
create function public.delete_inactive_accounts()
returns int
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_deleted int;
begin
  delete from auth.users u
   where coalesce(
           (select p.last_active_at from public.profiles p where p.id = u.id),
           u.created_at
         ) < now() - interval '3 months';
  get diagnostics v_deleted = row_count;
  return v_deleted;
end;
$$;

-- ---------------------------------------------------------------------------
-- 2. IP addresses older than 24 hours, old wrong-PIN counters
-- ---------------------------------------------------------------------------

-- IP addresses are personal data and are only needed for the "30 signups per
-- hour" check (#23), so they are kept for 24 hours at most.
--
-- A wrong-PIN counter untouched for 24 hours is stale: any lock on it ended
-- long ago (locks last 15 minutes).
--
-- Returns how many rows were deleted from both tables together.
create function public.purge_old_signup_ips()
returns int
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_ips int;
  v_failures int;
begin
  delete from public.signup_ips
   where created_at < now() - interval '24 hours';
  get diagnostics v_ips = row_count;

  delete from public.login_failures
   where updated_at < now() - interval '24 hours';
  get diagnostics v_failures = row_count;

  return v_ips + v_failures;
end;
$$;

-- Only the database itself (pg_cron, SQL editor) runs these, not the app.
revoke execute on function
  public.delete_inactive_accounts(),
  public.purge_old_signup_ips()
from public, anon, authenticated, service_role;

-- ---------------------------------------------------------------------------
-- Schedule: every night at 01:00 UTC
-- ---------------------------------------------------------------------------

-- cron.schedule with a job name replaces an existing job of the same name.
select cron.schedule(
  'delete-inactive-accounts',
  '0 1 * * *',
  'select public.delete_inactive_accounts()'
);

select cron.schedule(
  'purge-old-signup-ips',
  '0 1 * * *',
  'select public.purge_old_signup_ips()'
);
