import { describe, expect, it } from "vitest";
import { EXAM, EXAM_TOPICS } from "@/content/exam";
import {
  computeScore,
  isOS,
  isTopic,
  latestPerTopic,
} from "@/features/exam/score";

const correct = (topic: "home" | "messages" | "cyber") =>
  EXAM[topic].map((q) => q.answer);

describe("computeScore", () => {
  it("gives 10 for all correct answers in every topic", () => {
    for (const t of EXAM_TOPICS) expect(computeScore(t, correct(t))).toBe(10);
  });

  it("counts only the right answers", () => {
    const answers = correct("home");
    answers[0] = (answers[0] + 1) % EXAM.home[0].options.length;
    answers[1] = (answers[1] + 1) % EXAM.home[1].options.length;
    expect(computeScore("home", answers)).toBe(8);
  });

  it("gives 0 when everything is wrong or out of range", () => {
    expect(computeScore("cyber", Array(10).fill(99))).toBe(0);
    expect(computeScore("cyber", Array(10).fill(-1))).toBe(0);
  });

  it("rejects anything that is not a full list of integers", () => {
    expect(computeScore("home", [])).toBeNull();
    expect(computeScore("home", correct("home").slice(1))).toBeNull();
    expect(computeScore("home", [...correct("home"), 0])).toBeNull();
    expect(computeScore("home", Array(10).fill("1"))).toBeNull();
    expect(computeScore("home", Array(10).fill(0.5))).toBeNull();
    expect(computeScore("home", "nope")).toBeNull();
    expect(computeScore("home", null)).toBeNull();
  });

  it("never returns a score outside 0–10 (the database check range)", () => {
    for (const t of EXAM_TOPICS) {
      const s = computeScore(t, correct(t))!;
      expect(s).toBeGreaterThanOrEqual(0);
      expect(s).toBeLessThanOrEqual(10);
    }
  });
});

describe("input guards", () => {
  it("accepts only known topics and systems", () => {
    expect(isTopic("home")).toBe(true);
    expect(isTopic("math")).toBe(false);
    expect(isTopic(undefined)).toBe(false);
    expect(isOS("ios")).toBe(true);
    expect(isOS("windows")).toBe(false);
  });
});

describe("latestPerTopic", () => {
  it("keeps the newest result per topic", () => {
    const rows = [
      { topic: "home", score: 4, created_at: "2026-11-20T10:00:00Z" },
      { topic: "home", score: 9, created_at: "2026-11-21T10:00:00Z" },
      { topic: "cyber", score: 7, created_at: "2026-11-19T10:00:00Z" },
    ];
    const res = latestPerTopic(rows);
    expect(res).toHaveLength(2);
    expect(res.find((r) => r.topic === "home")?.score).toBe(9);
    expect(res.find((r) => r.topic === "cyber")?.score).toBe(7);
  });

  it("returns an empty list for no results", () => {
    expect(latestPerTopic([])).toEqual([]);
  });
});
