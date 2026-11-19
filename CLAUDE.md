# nutiringApp – working rules

Stack: Next.js (App Router, TypeScript), Supabase (Postgres, auth), Vitest + Testing Library.

## Workflow
- Design first, code second: do not build UI until the design mockup is provided.
- Feature branching: branch from `development` as `feat/<issue#>-<slug>`, `fix/…`, `chore/…`. Never commit or push to `main`.
- Conventional Commits (`feat:`, `fix:`, `chore:`, `test:`, `docs:` …), enforced by commitlint. Do NOT add Claude as co-author.
- One GitHub issue per task, each atomic (a backend task and a frontend task are separate issues). Issues are assigned to a milestone and added to the project's timeline board.
- Every PR must pass CI (lint, typecheck, tests, build). Write tests for new behaviour.
- After a PR/merge, check open issues (`gh issue list`) for the next task and for anything the merge resolved or blocked.
- Kanban (project board "Nutiring"): move the issue to "In Progress" when you start it. Every PR must say `Closes #<issue>` so the board moves it to "Done" on merge. If work stops or is split, update the issue status by hand.
- Order: respect "blocked by" links on issues – don't start a blocked issue until its blocker is closed. Otherwise follow the milestone order and the timeline dates.

## Supabase
- Migrations live in `supabase/migrations`. Env vars: see `.env.example`.
