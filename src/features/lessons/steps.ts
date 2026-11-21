import type { Lesson, OS, Step, Text } from "@/content/types";

/** Pick the text for the chosen system. */
export function resolveText(text: Text | undefined, os: OS): string {
  if (text === undefined) return "";
  return typeof text === "string" ? text : text[os];
}

/** A step is shown if it has no `os` or matches the chosen system. */
export const isVisible = (step: Step, os: OS) => !step.os || step.os === os;

/** Index of the first visible step at or after `from`, or -1 if none. */
export function nextVisible(lesson: Lesson, from: number, os: OS): number {
  for (let i = from; i < lesson.steps.length; i++) if (isVisible(lesson.steps[i], os)) return i;
  return -1;
}

/** Index of the previous visible step before `from`, or -1 if none. */
export function prevVisible(lesson: Lesson, from: number, os: OS): number {
  for (let i = from - 1; i >= 0; i--) if (isVisible(lesson.steps[i], os)) return i;
  return -1;
}

/** "3/7" numbering that counts only the steps of the chosen system. */
export function stepNumber(lesson: Lesson, index: number, os: OS): { n: number; total: number } {
  const visible = lesson.steps.map((s) => isVisible(s, os));
  return {
    n: visible.slice(0, index + 1).filter(Boolean).length,
    total: visible.filter(Boolean).length,
  };
}

/** Does this event finish the step? */
export function matchesUntil(step: Step, event: string | undefined): boolean {
  if (!event || step.type !== "do" || !step.until) return false;
  return Array.isArray(step.until) ? step.until.includes(event) : step.until === event;
}
