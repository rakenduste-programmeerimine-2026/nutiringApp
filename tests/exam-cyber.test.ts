import { describe, expect, it } from "vitest";
import {
  CALL_TASKS,
  CHECKLIST,
  PHONE_NUMBERS,
  pickTasks,
  SAFE_SMS,
  SCAM_SMS,
  TASK_POOL,
  VICTIM_STEPS,
  WEB_TASKS,
} from "@/content/cyber";
import { EXAM, EXAM_TOPICS } from "@/content/exam";
import type { Text } from "@/content/types";

const texts = (t: Text): string[] =>
  typeof t === "string" ? [t] : [t.android, t.ios];

describe("exam content", () => {
  it("has exactly 10 questions per topic", () => {
    for (const topic of EXAM_TOPICS) expect(EXAM[topic]).toHaveLength(10);
  });

  it("every answer index is valid and every Text has both systems", () => {
    for (const topic of EXAM_TOPICS)
      for (const q of EXAM[topic]) {
        expect(q.options.length).toBeGreaterThanOrEqual(2);
        expect(Number.isInteger(q.answer)).toBe(true);
        expect(q.answer).toBeGreaterThanOrEqual(0);
        expect(q.answer).toBeLessThan(q.options.length);
        for (const t of [q.question, q.explanation, ...q.options])
          for (const s of texts(t)) expect(s.length).toBeGreaterThan(0);
      }
  });

  it("teaches the õ long press and no longer has the LKF question", () => {
    const all = JSON.stringify(EXAM);
    expect(all).toContain("Hoia sõrme o-tähel");
    expect(all).not.toContain("LKF");
    expect(all).toContain("Autokaubad24");
  });
});

describe("cyber content", () => {
  it("has the agreed task pool", () => {
    expect(SCAM_SMS).toHaveLength(5);
    expect(SAFE_SMS).toHaveLength(2);
    expect(WEB_TASKS).toHaveLength(2);
    expect(CALL_TASKS).toHaveLength(2);
    expect(new Set(TASK_POOL.map((t) => t.id)).size).toBe(TASK_POOL.length);
  });

  it("every task has at least one sign and web tasks end with a tip", () => {
    for (const t of TASK_POOL) expect(t.signs.length).toBeGreaterThanOrEqual(1);
    for (const t of WEB_TASKS)
      expect(t.signs[t.signs.length - 1].tone).toBe("tip");
  });

  it("sign markers in the text match the signs", () => {
    for (const t of TASK_POOL) {
      const refs = [
        ...`${t.from ?? ""}${t.text ?? ""}`.matchAll(/\[\[(\d+)\|/g),
      ].map((m) => Number(m[1]));
      for (const r of refs) expect(t.signs.some((s) => s.ref === r)).toBe(true);
    }
  });

  it("pickTasks always returns scam sms + safe sms + web + call", () => {
    for (let i = 0; i < 200; i++) {
      const [a, b, web, call] = pickTasks();
      expect([a.answer, b.answer].sort()).toEqual(["safe", "scam"]);
      expect(a.kind).toBe("sms");
      expect(b.kind).toBe("sms");
      expect(WEB_TASKS).toContain(web);
      expect(CALL_TASKS).toContain(call);
    }
  });

  it("pickTasks puts both sms orders in play", () => {
    const firsts = new Set(
      Array.from({ length: 100 }, () => pickTasks()[0].answer),
    );
    expect(firsts).toEqual(new Set(["scam", "safe"]));
  });

  it("has the checklist, victim steps and phone numbers", () => {
    expect(CHECKLIST).toHaveLength(9);
    expect(VICTIM_STEPS).toHaveLength(4);
    expect(PHONE_NUMBERS.length).toBeGreaterThan(0);
  });

  it("has no Malvi, Kalev or LKF left", () => {
    const all = JSON.stringify([TASK_POOL, CHECKLIST, VICTIM_STEPS]);
    for (const w of ["Malvi", "Kalev", "LKF"]) expect(all).not.toContain(w);
  });
});

describe("task questions", () => {
  it("SMS tasks get a question by position, others have their own", async () => {
    const { taskQuestion, SCAM_SMS, WEB_TASKS } =
      await import("@/content/cyber");
    expect(taskQuestion(SCAM_SMS[0], 0)).toContain("Mulle tuli selline sõnum");
    expect(taskQuestion(SCAM_SMS[0], 1)).toContain("Nüüd tuli veel üks sõnum");
    for (const t of WEB_TASKS) expect(taskQuestion(t, 2)).toBe(t.question);
  });
});
