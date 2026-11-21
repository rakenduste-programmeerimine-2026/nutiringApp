// @vitest-environment node
import { beforeEach, describe, expect, it } from "vitest";
import { createTestDb, type TestDb } from "./setup-db";

let t: TestDb;

beforeEach(async () => {
  t = await createTestDb();
});

const count = async (sql: string, params: unknown[] = []) => {
  await t.asOwner();
  const { rows } = await t.db.query<{ n: number }>(`select (${sql})::int as n`, params);
  return rows[0].n;
};

const userWithProfile = async (username: string, lastActive: string) => {
  const id = await t.createAuthUser();
  await t.db.query(
    "insert into public.profiles (id, username, last_active_at) values ($1, $2, now() - $3::interval)",
    [id, username, lastActive],
  );
  return id;
};

const run = async (fn: string) => {
  await t.asOwner();
  const { rows } = await t.db.query<{ n: number }>(`select public.${fn}() as n`);
  return rows[0].n;
};

describe("delete_inactive_accounts", () => {
  it("deletes accounts unused for more than 3 months, with their results", async () => {
    const old = await userWithProfile("vana_mari", "3 months 1 day");
    const recent = await userWithProfile("uus_kati", "2 months 29 days");
    await t.db.query(
      `insert into public.exam_results (user_id, topic, os, score) values
         ($1, 'home', 'ios', 5), ($2, 'cyber', 'android', 8)`,
      [old, recent],
    );
    // Saving a result bumps last_active_at; put the old user back in the past.
    await t.db.query(
      "update public.profiles set last_active_at = now() - interval '3 months 1 day' where id = $1",
      [old],
    );

    expect(await run("delete_inactive_accounts")).toBe(1);

    expect(await count("select count(*) from auth.users where id = $1", [old])).toBe(0);
    expect(await count("select count(*) from public.profiles where id = $1", [old])).toBe(0);
    expect(await count("select count(*) from public.exam_results where user_id = $1", [old])).toBe(0);

    expect(await count("select count(*) from auth.users where id = $1", [recent])).toBe(1);
    expect(await count("select count(*) from public.exam_results where user_id = $1", [recent])).toBe(1);
  });

  it("deletes old auth users without a profile, keeps new ones", async () => {
    const stale = await t.createAuthUser(new Date(Date.now() - 100 * 86_400_000).toISOString());
    const fresh = await t.createAuthUser();

    expect(await run("delete_inactive_accounts")).toBe(1);
    expect(await count("select count(*) from auth.users where id = $1", [stale])).toBe(0);
    expect(await count("select count(*) from auth.users where id = $1", [fresh])).toBe(1);
  });

  it("uses last_active_at, not the account age", async () => {
    const id = await t.createAuthUser(new Date(Date.now() - 365 * 86_400_000).toISOString());
    await t.db.query(
      "insert into public.profiles (id, username, last_active_at) values ($1, 'aktiivne', now())",
      [id],
    );
    expect(await run("delete_inactive_accounts")).toBe(0);
  });
});

describe("purge_old_signup_ips", () => {
  it("deletes IP records older than 24 hours and stale wrong-PIN counters", async () => {
    await t.asOwner();
    await t.db.query(
      `insert into public.signup_ips (ip, created_at) values
         ('10.0.0.1', now() - interval '25 hours'),
         ('10.0.0.2', now() - interval '23 hours'),
         ('10.0.0.3', now())`,
    );
    await t.db.query(
      `insert into public.login_failures (username, failed_count, locked_until, updated_at) values
         ('vana', 3, null, now() - interval '25 hours'),
         ('lukus', 0, now() + interval '10 minutes', now() - interval '5 minutes'),
         ('hiljuti', 2, null, now() - interval '1 hour')`,
    );

    expect(await run("purge_old_signup_ips")).toBe(2);

    await t.asOwner();
    const ips = await t.db.query<{ ip: string }>("select host(ip) as ip from public.signup_ips order by ip");
    expect(ips.rows.map((r) => r.ip)).toEqual(["10.0.0.2", "10.0.0.3"]);
    const names = await t.db.query<{ username: string }>(
      "select username from public.login_failures order by username",
    );
    expect(names.rows.map((r) => r.username)).toEqual(["hiljuti", "lukus"]);
  });
});

describe("schedule", () => {
  it("runs both jobs every night at 01:00 UTC", async () => {
    await t.asOwner();
    const { rows } = await t.db.query<{ jobname: string; schedule: string; command: string }>(
      "select jobname, schedule, command from cron.job order by jobname",
    );
    expect(rows).toEqual([
      {
        jobname: "delete-inactive-accounts",
        schedule: "0 1 * * *",
        command: "select public.delete_inactive_accounts()",
      },
      {
        jobname: "purge-old-signup-ips",
        schedule: "0 1 * * *",
        command: "select public.purge_old_signup_ips()",
      },
    ]);
  });
});

describe("access", () => {
  for (const role of ["anon", "authenticated", "service_role"] as const) {
    it(`${role} cannot run the cleanup functions`, async () => {
      if (role === "service_role") await t.asService();
      else await t.asUser(role === "anon" ? null : "11111111-1111-1111-1111-111111111111");
      for (const fn of ["delete_inactive_accounts", "purge_old_signup_ips"]) {
        await expect(t.db.query(`select public.${fn}()`)).rejects.toThrow(/permission denied/);
      }
    });
  }
});
