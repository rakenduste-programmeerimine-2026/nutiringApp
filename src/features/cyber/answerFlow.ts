import type { CyberTask, Sign } from "@/content/cyber";
import type { SignMark } from "./SignText";

/*
 * Rules of the answer flow (prototype `answer`, `renderTask`, `nextSign`).
 * Kept free of React so they are easy to test.
 */

/** What the user chose: scam / safe for messages, calls and the bank page; a result for search. */
export type Choice = "scam" | "safe" | "fake" | "real";

export function isCorrect(task: CyberTask, choice: Choice): boolean {
  return choice === task.answer;
}

/** The second half of the verdict box, e.g. „Õige! See sõnum on kelmus.” */
export function verdictText(task: CyberTask): string {
  if (task.answer === "real") return "Õige on alumine tulemus.";
  if (task.answer === "safe") return "See sõnum ei ole kelmus.";
  if (task.kind === "bank") return "See veebileht on võlts.";
  if (task.kind === "call") return "See kõne oli kelmus.";
  return "See sõnum on kelmus.";
}

/** What Tiia says after the answer. */
export function tiiaReply(correct: boolean): string {
  return correct ? "Aitäh! Hea, et sa mind aitasid." : "Oi! Hea, et me selle koos läbi vaatame.";
}

/** Green card / marker: a sign that the message is real, a safe address or a tip. */
export function isGoodSign(task: CyberTask, sign: Sign): boolean {
  if (task.answer === "safe") return sign.tone !== "warn";
  return sign.tone === "ok" || sign.tone === "tip";
}

/** The small heading of a sign card. */
export function signLabel(task: CyberTask, sign: Sign): string {
  if (sign.tone === "warn") return "HOIATUS";
  if (sign.tone === "tip") return "NÕUANNE";
  if (sign.tone === "ok") return "TURVALINE";
  return task.answer === "safe" ? "MIKS SEE ON PÄRIS" : "OHUMÄRK";
}

/**
 * Markers to highlight when sign number `shown` (0-based) is being explained:
 * every sign up to it stays highlighted, the current one stronger.
 */
export function signMarks(task: CyberTask, shown: number): Map<number, SignMark> {
  const marks = new Map<number, SignMark>();
  task.signs.slice(0, shown + 1).forEach((sign, i) => {
    if (sign.ref === 0) return;
    marks.set(sign.ref, {
      ok: task.answer === "safe" || sign.tone === "ok",
      current: i === shown,
    });
  });
  return marks;
}

/** Text of the button under a sign card. */
export function nextLabel(task: CyberTask, shown: number, taskIndex: number, taskCount: number): string {
  if (shown < task.signs.length - 1) return "Järgmine märk →";
  return taskIndex < taskCount - 1 ? "Järgmine ülesanne →" : "Vaata kokkuvõtet →";
}
