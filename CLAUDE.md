# nutiringApp – working rules

Stack: Next.js (App Router, TypeScript), Supabase (Postgres, auth), Vitest + Testing Library.

## Workflow
- Design first, code second: do not build UI until the design mockup is provided.
- Feature branching: branch from `development` as `feat/<issue#>-<slug>`, `fix/…`, `chore/…`. Never commit or push to `main`.
- Conventional Commits (`feat:`, `fix:`, `chore:`, `test:`, `docs:` …), enforced by commitlint. Do NOT add Claude as co-author.
- One GitHub issue per task, each atomic (a backend task and a frontend task are separate issues). Issues are assigned to a milestone and added to the project's timeline board.
- Every PR must pass CI (lint, typecheck, tests, build). Write tests for new behaviour.
- After a PR/merge, check open issues (`gh issue list`) for the next task and for anything the merge resolved or blocked.
- Kanban (project board "Nutiring"): move the issue to "In Progress" when you start it. Every PR says `Closes #<issue>` (links the PR to the issue). Because PRs go into `development` and not the default branch `main`, GitHub does **not** close the issue on merge: **after merging, close the issue by hand** (`gh issue close <n> --comment "Done in #<PR>"`); the board then moves it to "Done". If work stops or is split, update the issue status by hand.
- Before starting an issue: pull `development` and read the descriptions **and comments** of PRs merged since your last task (`gh pr list --state merged --limit 10`, then `gh pr view <n> --comments`). They contain notes for the team (new shared components, changed rules). Also check comments on your own open PRs and issues.
- Order: respect "blocked by" links on issues – don't start a blocked issue until its blocker is closed. Otherwise follow the milestone order and the timeline dates.

## Folder ownership (avoid merge conflicts)
Each person owns their area; only the owner edits these files. Others may import and use them, but ask the owner (or open a small issue) for changes.

| Owner | Area | Folders / files |
|---|---|---|
| Anette (`aruorg`) | Foundation, phone replica, lesson engine, Home screen + Messages houses, QA | `src/app/layout.tsx`, global styles, `src/app/page.tsx`, `src/app/kula/`, `src/app/maja/avaekraan/`, `src/app/maja/sonumid/`, `src/components/ui/`, `src/features/os/` (Android/iPhone choice: `OsProvider`, `useOs`, `RequireOs` – everyone may use it), `src/features/phone/`, `src/features/lessons/`, `src/features/home/`, `src/features/messages/` |
| `Shargathx` | All content data, auth, the whole Exam | `src/content/` (incl. shared `types.ts`), `src/app/eksam/`, `src/features/exam/`, `src/lib/auth/`, `src/middleware.ts` |
| `piperal` | Database, the whole Cyber security house (Tiia + Küberbrauser) | `supabase/migrations/`, `src/lib/supabase/types.ts`, `src/app/maja/kuber/`, `src/features/cyber/`, `src/features/browser/` |

- `package.json`: anyone adding a library says so in the team chat first, because the lockfile is where conflicts happen most.

## Shared building blocks and pitfalls
- Every page except the start page is wrapped in `<RequireOs>` (`@/features/os`); read the chosen system with `useOs()`.
- Use `Button`, `TopBar`, `BackButton`, `Logo` and the icons from `@/components/ui` and the colour variables from `src/app/globals.css` (`var(--navy)` …) instead of your own.
- The Nunito font is self-hosted in `public/fonts` (`@font-face` in `globals.css`). Do not add `next/font/google` – it made the CI build fail.
- `npm run dev` and `npm run build` share the `.next` folder: stop the dev server before building locally, otherwise the dev server breaks.
- Install with `npm ci` (never changes the lockfile). Use `npm install <package>` only when adding a library, after telling the team.

## Supabase
- Migrations live in `supabase/migrations`. Env vars: see `.env.example`.
