// @vitest-environment node
import { beforeAll, describe, expect, it } from "vitest";
import { createTestDb, type TestDb } from "./setup-db";

let t: TestDb;
let mari: string;
let kati: string;

beforeAll(async () => {
  t = await createTestDb();
  mari = await t.createAuthUser();
  kati = await t.createAuthUser();
});

const addProfile = (id: string, username: string) =>
  t.db.query("insert into public.profiles (id, username) values ($1, $2)", [id, username]);

const addResult = (userId: string, topic: string, os: string, score: number | null) =>
  t.db.query(
    "insert into public.exam_results (user_id, topic, os, score) values ($1, $2, $3, $4)",
    [userId, topic, os, score],
  );

describe("profiles (#2)", () => {
  it("lets a user create only their own profile", async () => {
    await t.asUser(mari);
    await addProfile(mari, "mari_1");
    await expect(addProfile(kati, "kati")).rejects.toThrow(/row-level security/);
  });

  it("rejects duplicate usernames, also with different case", async () => {
    await t.asUser(kati);
    await expect(addProfile(kati, "mari_1")).rejects.toThrow(/duplicate key/);
    await expect(addProfile(kati, "MARI_1")).rejects.toThrow(/duplicate key/);
  });

  it.each(["ab", "a".repeat(31), "mari mets", "jüri"])("rejects username %j", async (name) => {
    await t.asUser(kati);
    await expect(addProfile(kati, name)).rejects.toThrow(/profiles_username_format/);
  });

  it("shows a user only their own profile", async () => {
    await t.asUser(kati);
    await addProfile(kati, "Kati-K");
    const { rows } = await t.db.query<{ id: string }>("select id from public.profiles");
    expect(rows).toEqual([{ id: kati }]);
  });

  it("does not let users change profiles", async () => {
    await t.asUser(kati);
    await expect(
      t.db.query("update public.profiles set last_active_at = now() + interval '1 year'"),
    ).rejects.toThrow(/permission denied/);
    await expect(t.db.query("delete from public.profiles")).rejects.toThrow(/permission denied/);
  });

  it("is not readable without logging in", async () => {
    await t.asUser(null);
    await expect(t.db.query("select * from public.profiles")).rejects.toThrow(/permission denied/);
  });
});

describe("exam_results (#3)", () => {
  it("saves valid results", async () => {
    await t.asUser(mari);
    await addResult(mari, "home", "android", 0);
    await addResult(mari, "messages", "ios", 10);
    await addResult(mari, "cyber", "android", 7);
  });

  it.each([
    ["bank", "ios", 5, /exam_results_topic_check/],
    ["home", "windows", 5, /exam_results_os_check/],
    ["home", "ios", 11, /exam_results_score_check/],
    ["home", "ios", -1, /exam_results_score_check/],
    ["home", "ios", null, /not-null/],
  ] as const)("rejects topic=%s os=%s score=%s", async (topic, os, score, error) => {
    await t.asUser(mari);
    await expect(addResult(mari, topic, os, score)).rejects.toThrow(error);
  });

  it("does not let a user save or read another user's results", async () => {
    await t.asUser(kati);
    await expect(addResult(mari, "home", "ios", 10)).rejects.toThrow(/row-level security/);
    const { rows } = await t.db.query("select * from public.exam_results");
    expect(rows).toHaveLength(0);
  });

  it("updates last_active_at of that user only when a result is saved", async () => {
    await t.asOwner();
    await t.db.query("update public.profiles set last_active_at = '2020-01-01'");
    await t.asUser(kati);
    await addResult(kati, "cyber", "ios", 4);
    await t.asOwner();
    const { rows } = await t.db.query<{ id: string; fresh: boolean }>(
      "select id, last_active_at > now() - interval '1 minute' as fresh from public.profiles",
    );
    expect(Object.fromEntries(rows.map((r) => [r.id, r.fresh]))).toEqual({
      [mari]: false,
      [kati]: true,
    });
  });

  it("does not let users change or delete results", async () => {
    await t.asUser(mari);
    await expect(t.db.query("update public.exam_results set score = 10")).rejects.toThrow(
      /permission denied/,
    );
    await expect(t.db.query("delete from public.exam_results")).rejects.toThrow(
      /permission denied/,
    );
  });

  it("deletes profile and results with the auth user", async () => {
    await t.asOwner();
    await t.db.query("delete from auth.users where id = $1", [mari]);
    const { rows } = await t.db.query<{ p: number; r: number }>(
      `select (select count(*)::int from public.profiles where id = $1) as p,
              (select count(*)::int from public.exam_results where user_id = $1) as r`,
      [mari],
    );
    expect(rows[0]).toEqual({ p: 0, r: 0 });
  });
});
