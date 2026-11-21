// @vitest-environment node
import { beforeAll, describe, expect, it } from "vitest";
import { createTestDb, type TestDb } from "./setup-db";

let t: TestDb;

beforeAll(async () => {
  t = await createTestDb();
});

const lockedUntil = async (username: string) => {
  const { rows } = await t.db.query<{ until: Date | null }>(
    "select public.is_login_locked($1) as until",
    [username],
  );
  return rows[0].until;
};

const failLogin = async (username: string) => {
  const { rows } = await t.db.query<{ until: Date | null }>(
    "select public.register_failed_login($1) as until",
    [username],
  );
  return rows[0].until;
};

describe("login lockout", () => {
  it("is not locked without wrong PINs", async () => {
    await t.asService();
    expect(await lockedUntil("mari")).toBeNull();
  });

  it("locks the account for 15 minutes on the 5th wrong PIN", async () => {
    await t.asService();
    for (let i = 0; i < 4; i++) {
      expect(await failLogin("kati")).toBeNull();
    }
    expect(await lockedUntil("kati")).toBeNull();

    const until = await failLogin("kati");
    expect(until).not.toBeNull();
    const minutes = (until!.getTime() - Date.now()) / 60_000;
    expect(minutes).toBeGreaterThan(14.5);
    expect(minutes).toBeLessThanOrEqual(15);
    expect(await lockedUntil("kati")).toEqual(until);
  });

  it("treats usernames case-insensitively", async () => {
    await t.asService();
    for (let i = 0; i < 5; i++) await failLogin("Juhan");
    expect(await lockedUntil("JUHAN")).not.toBeNull();
    expect(await lockedUntil("juhan")).not.toBeNull();
  });

  it("starts counting again after the lock has run out", async () => {
    await t.asService();
    for (let i = 0; i < 5; i++) await failLogin("peeter");
    await t.asOwner();
    await t.db.query(
      "update public.login_failures set locked_until = now() - interval '1 second' where username = 'peeter'",
    );
    await t.asService();
    expect(await lockedUntil("peeter")).toBeNull();
    for (let i = 0; i < 4; i++) expect(await failLogin("peeter")).toBeNull();
    expect(await failLogin("peeter")).not.toBeNull();
  });

  it("forgets wrong PINs after a successful login", async () => {
    await t.asService();
    for (let i = 0; i < 4; i++) await failLogin("tiia");
    await t.db.query("select public.clear_failed_logins($1)", ["tiia"]);
    expect(await failLogin("tiia")).toBeNull();
    const { rows } = await t.db.query<{ failed_count: number }>(
      "select failed_count from public.login_failures where username = 'tiia'",
    );
    expect(rows[0].failed_count).toBe(1);
  });
});

describe("signup limit per IP", () => {
  it("counts only signups from this IP in the last hour", async () => {
    await t.asService();
    await t.db.query(
      `insert into public.signup_ips (ip, created_at) values
         ('10.0.0.1', now()),
         ('10.0.0.1', now() - interval '59 minutes'),
         ('10.0.0.1', now() - interval '61 minutes'),
         ('10.0.0.2', now())`,
    );
    const { rows } = await t.db.query<{ n: number }>(
      "select public.signups_from_ip_last_hour($1) as n",
      ["10.0.0.1"],
    );
    expect(rows[0].n).toBe(2);
  });

  it("returns 0 for an IP without signups", async () => {
    await t.asService();
    const { rows } = await t.db.query<{ n: number }>(
      "select public.signups_from_ip_last_hour($1) as n",
      ["192.168.1.1"],
    );
    expect(rows[0].n).toBe(0);
  });
});

describe("access for normal users", () => {
  for (const who of ["anon", "logged-in user"] as const) {
    describe(who, () => {
      const become = async () =>
        t.asUser(who === "anon" ? null : "11111111-1111-1111-1111-111111111111");

      for (const table of ["login_failures", "signup_ips"]) {
        it(`cannot read or write ${table}`, async () => {
          await become();
          await expect(t.db.query(`select * from public.${table}`)).rejects.toThrow(
            /permission denied/,
          );
          await expect(t.db.query(`delete from public.${table}`)).rejects.toThrow(
            /permission denied/,
          );
        });
      }

      for (const call of [
        "public.is_login_locked('mari')",
        "public.register_failed_login('mari')",
        "public.clear_failed_logins('kati')",
        "public.signups_from_ip_last_hour('10.0.0.1')",
      ]) {
        it(`cannot call ${call.split("(")[0]}`, async () => {
          await become();
          await expect(t.db.query(`select ${call}`)).rejects.toThrow(/permission denied/);
        });
      }
    });
  }
});
