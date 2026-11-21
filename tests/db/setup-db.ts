import { PGlite } from "@electric-sql/pglite";
import { readdirSync, readFileSync } from "fs";
import { join } from "path";

const MIGRATIONS = join(__dirname, "..", "..", "supabase", "migrations");

// The parts of Supabase the migrations rely on: the API roles, auth.users
// and auth.uid() (which reads the logged-in user's id from the request).
//
// PGlite has no pg_cron, so cron.job and cron.schedule() are stand-ins that
// only record the jobs (same job-name upsert as the real one), and the
// "create extension pg_cron" line is skipped when the migrations are applied.
const SUPABASE_STUB = `
  create role anon nologin;
  create role authenticated nologin;
  create role service_role nologin bypassrls;
  create schema auth;
  create table auth.users (
    id uuid primary key,
    created_at timestamptz not null default now()
  );
  create function auth.uid() returns uuid language sql stable as
    $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
  grant usage on schema auth to anon, authenticated, service_role;
  grant usage on schema public to anon, authenticated, service_role;

  create schema cron;
  create table cron.job (
    jobid bigint generated always as identity primary key,
    jobname text unique,
    schedule text not null,
    command text not null
  );
  create function cron.schedule(job_name text, schedule text, command text)
  returns bigint language sql as $$
    insert into cron.job (jobname, schedule, command) values (job_name, schedule, command)
    on conflict (jobname) do update set schedule = excluded.schedule, command = excluded.command
    returning jobid;
  $$;
`;

const PG_CRON_EXTENSION = /create extension[^;]*\bpg_cron\b[^;]*;/gi;

export type TestDb = {
  db: PGlite;
  /** Run the next queries as a logged-in user (or as anon with null). */
  asUser: (userId: string | null) => Promise<void>;
  /** Run the next queries as the server's service role. */
  asService: () => Promise<void>;
  /** Run the next queries as the database owner (for test setup). */
  asOwner: () => Promise<void>;
  /** Create an auth user (optionally created in the past) and return its id. */
  createAuthUser: (createdAt?: string) => Promise<string>;
};

/** A fresh in-memory Postgres with every migration in supabase/migrations applied. */
export async function createTestDb(): Promise<TestDb> {
  const db = new PGlite();
  await db.exec(SUPABASE_STUB);
  const files = readdirSync(MIGRATIONS)
    .filter((f) => f.endsWith(".sql"))
    .sort();
  for (const file of files) {
    const sql = readFileSync(join(MIGRATIONS, file), "utf8").replace(PG_CRON_EXTENSION, "");
    await db.exec(sql);
  }

  const asOwner = async () => {
    await db.exec("reset role");
  };
  const asUser = async (userId: string | null) => {
    await asOwner();
    await db.query("select set_config('request.jwt.claim.sub', $1, false)", [userId ?? ""]);
    await db.exec(`set role ${userId ? "authenticated" : "anon"}`);
  };
  const asService = async () => {
    await asOwner();
    await db.exec("set role service_role");
  };
  const createAuthUser = async (createdAt?: string) => {
    await asOwner();
    const { rows } = await db.query<{ id: string }>(
      "insert into auth.users (id, created_at) values (gen_random_uuid(), coalesce($1::timestamptz, now())) returning id",
      [createdAt ?? null],
    );
    return rows[0].id;
  };

  return { db, asUser, asService, asOwner, createAuthUser };
}
