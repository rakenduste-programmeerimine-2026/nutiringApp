import { EXAM, EXAM_TOPICS, type ExamTopicId } from "@/content/exam";

export type ExamOS = "android" | "ios";

export const QUESTIONS_PER_EXAM = 10;

export function isTopic(value: unknown): value is ExamTopicId {
  return typeof value === "string" && (EXAM_TOPICS as string[]).includes(value);
}

export function isOS(value: unknown): value is ExamOS {
  return value === "android" || value === "ios";
}

/**
 * Score of one exam, computed from the answers the user picked (option indexes).
 * Returns null when the input is not a full exam: wrong length or non-integers.
 * Answers that are out of range simply count as wrong.
 */
export function computeScore(
  topic: ExamTopicId,
  answers: unknown,
): number | null {
  const questions = EXAM[topic];
  if (!Array.isArray(answers) || answers.length !== questions.length)
    return null;
  if (!answers.every((a) => Number.isInteger(a))) return null;
  return questions.reduce(
    (sum, q, i) => sum + (answers[i] === q.answer ? 1 : 0),
    0,
  );
}

export type ResultRow = { topic: string; score: number; created_at: string };

/** Newest result per topic from rows ordered in any way. */
export function latestPerTopic(rows: ResultRow[]): ResultRow[] {
  const latest = new Map<string, ResultRow>();
  for (const row of rows) {
    const current = latest.get(row.topic);
    if (!current || row.created_at > current.created_at)
      latest.set(row.topic, row);
  }
  return [...latest.values()];
}
