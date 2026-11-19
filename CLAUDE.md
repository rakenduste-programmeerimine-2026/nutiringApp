# nutiringApp – working rules

Stack: Next.js (App Router, TypeScript), Supabase (Postgres, auth), Vitest + Testing Library.

## Workflow
- Design first, code second: do not build UI until the design mockup is provided.
- Feature branching: branch from `development` as `feat/<issue#>-<slug>`, `fix/…`, `chore/…`. Never commit or push to `main`.
- Conventional Commits (`feat:`, `fix:`, `chore:`, `test:`, `docs:` …), enforced by commitlint. Do NOT add Claude as co-author.
- One GitHub issue per task, each atomic (a backend task and a frontend task are separate issues). Issues are assigned to a milestone and added to the project's timeline board.
- Every PR must pass CI (lint, typecheck, tests, build). Write tests for new behaviour.
- After a PR/merge, check open issues (`gh issue list`) for the next task and for anything the merge resolved or blocked.

## Supabase
- Migrations live in `supabase/migrations`. Env vars: see `.env.example`.
