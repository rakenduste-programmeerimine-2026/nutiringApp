-- exam_results: one row per finished exam (issue #3).
--
-- The score is computed on the server from the user's answers (#7) and saved
-- here. Saving a result also counts as activity: a trigger bumps
-- profiles.last_active_at so active users are not removed by the cleanup (#24).

create table public.exam_results (
  id bigint generated always as identity primary key,

  -- Deleting the auth user deletes their results.
  user_id uuid not null references auth.users (id) on delete cascade,

  -- Which house the exam was about: Avaekraan, Sõnumid or Küberturvalisus.
  topic text not null
    constraint exam_results_topic_check
      check (topic in ('home', 'messages', 'cyber')),

  -- Which phone system the questions followed.
  os text not null
    constraint exam_results_os_check
      check (os in ('android', 'ios')),

  -- Correct answers out of 10.
  score int not null
    constraint exam_results_score_check
      check (score between 0 and 10),

  created_at timestamptz not null default now()
);

comment on table public.exam_results is
  'Finished exams: topic, phone system and score (0–10) per user.';

-- "My results, newest first" (#7 getMyResults).
create index exam_results_user_id_created_at_idx
  on public.exam_results (user_id, created_at desc);

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------

alter table public.exam_results enable row level security;

-- A logged-in user can read only their own results.
create policy "exam_results_select_own"
  on public.exam_results for select
  to authenticated
  using ((select auth.uid()) = user_id);

-- A logged-in user can save results only for themselves.
create policy "exam_results_insert_own"
  on public.exam_results for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

-- No update or delete: results are permanent. On insert the client sets only
-- the result fields; id and created_at always come from the database.
revoke all on public.exam_results from anon, authenticated;
grant select on public.exam_results to authenticated;
grant insert (user_id, topic, os, score) on public.exam_results to authenticated;

-- ---------------------------------------------------------------------------
-- Saving a result updates profiles.last_active_at
-- ---------------------------------------------------------------------------

-- Runs as the table owner because users have no update right on profiles.
create function public.exam_results_touch_profile()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.profiles
     set last_active_at = now()
   where id = new.user_id;
  return null;
end;
$$;

-- Only the trigger should call it.
revoke execute on function public.exam_results_touch_profile() from public, anon, authenticated;

create trigger exam_results_touch_profile
  after insert on public.exam_results
  for each row
  execute function public.exam_results_touch_profile();
