import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { SCREEN_LOCK, SIM_PIN, home } from "@/content/lessons/home";
import type { OS, Step } from "@/content/types";
import { homeModule } from "@/features/home";
import { LessonHouse, resolveText } from "@/features/lessons";
import { LONG_PRESS_MS } from "@/features/lessons/gestures";

/* „Test robot”: plays every Home screen lesson from start to „Tubli!” on
   Android and iPhone, through the real lesson content and the real screens.
   For each step it does what a person would do:
     LOE      → press „Edasi →” (and check the highlighted part exists)
     SINU KORD → look at the highlighted element and tap / hold / swipe it,
                type a code or a word, or drag the brightness bar.
   If a step can't be done, the error says which lesson, step and system. */

const INTERACTIVE = "[data-act],[data-long],[data-swipe],[data-slide]";

const pointer = (type: string, el: Element, x: number, y: number) =>
  fireEvent(el, new MouseEvent(type, { bubbles: true, cancelable: true, clientX: x, clientY: y }));
const wait = (ms: number) => act(() => vi.advanceTimersByTime(ms));
const phoneScreen = () => document.querySelector(".phscreen") as HTMLElement;

const tap = (el: Element) => {
  pointer("pointerdown", el, 100, 300);
  pointer("pointerup", el, 100, 300);
};
const hold = async (el: Element) => {
  pointer("pointerdown", el, 100, 300);
  await wait(LONG_PRESS_MS + 50);
  pointer("pointerup", el, 100, 300);
};
const swipe = (el: Element, dir: string) => {
  const d = { up: [0, -400], down: [0, 400], left: [-200, 0], right: [200, 0], side: [-200, 0] }[dir] ?? [0, 0];
  pointer("pointerdown", el, 150, 300);
  pointer("pointermove", el, 150 + d[0] / 2, 300 + d[1] / 2);
  pointer("pointerup", el, 150 + d[0], 300 + d[1]);
};
const key = (name: string) => {
  const k = phoneScreen().querySelector(`[data-k="${name}"]`) ?? phoneScreen().querySelector(`[data-d="${name}"]`);
  if (!k) throw new Error(`key ${name} not found`);
  tap(k);
};

/** Current step number "n/total" from the guide card, or null at the end. */
const stepNo = () => {
  const card = screen.queryByTestId("step-card");
  const m = card?.textContent?.match(/(\d+)\/(\d+)/);
  return m ? Number(m[1]) : null;
};

/** Do what a "SINU KORD" step asks. */
async function doStep(step: Step, os: OS) {
  const sel = resolveText(step.target, os);
  const targets = [...phoneScreen().querySelectorAll(sel)];
  if (!targets.length) throw new Error(`target "${sel}" not on screen`);
  const until = ([] as string[]).concat(step.until ?? []);

  // typing a code on the number pad
  if (until.includes("simOk")) return [...SIM_PIN, "ok"].forEach(key);
  if (until.includes("passOk")) return [...SCREEN_LOCK, ...(os === "android" ? ["ok"] : [])].forEach(key);

  // typing a word on the keyboard
  if (step.check?.kind === "searchQuery") return [...String(step.check.value)].forEach((ch) => key(`ch:${ch}`));

  // dragging the brightness bar
  if (step.check?.kind === "brightnessChanged") {
    const bar = phoneScreen().querySelector<HTMLElement>("[data-slide]")!;
    vi.spyOn(bar, "getBoundingClientRect").mockReturnValue({ left: 0, right: 200, top: 0, bottom: 200, width: 200, height: 200 } as DOMRect);
    pointer("pointerdown", bar, 130, 70);
    pointer("pointermove", bar, 20, 180);
    pointer("pointerup", bar, 20, 180);
    return;
  }

  // the highlighted elements and the interactive elements inside them
  const cands = targets
    .flatMap((t) => [t, ...t.querySelectorAll(INTERACTIVE)])
    .filter((e): e is HTMLElement => e.matches(INTERACTIVE));

  const longEl = cands.find((c) => until.includes(c.dataset.long ?? ""));
  if (longEl) return hold(longEl);

  const swipeOnly = cands.find(
    (c) => c.dataset.swipe && !c.dataset.act && (until.includes(c.dataset.swipeAct ?? "") || until.includes(c.dataset.swipeHold ?? "")),
  );
  if (swipeOnly) return swipe(swipeOnly, swipeOnly.dataset.swipe!);

  const tapEl = cands.find((c) => c.dataset.act);
  if (tapEl) return tap(tapEl);

  const anySwipe = cands.find((c) => c.dataset.swipe);
  if (anySwipe) return swipe(anySwipe, anySwipe.dataset.swipe!);

  throw new Error(`nothing to touch in "${sel}" for until=${until.join(",")}`);
}

/** Play one lesson to the end; returns the steps it went through. */
async function walk(lessonIndex: number, os: OS) {
  const lesson = home.lessons[lessonIndex];
  render(<LessonHouse house={home} module={homeModule} os={os} />);
  fireEvent.click(screen.getByRole("button", { name: `${lessonIndex + 1}. ${lesson.title}` }));
  const steps = lesson.steps.filter((s) => !s.os || s.os === os);

  for (const [i, step] of steps.entries()) {
    const where = `lesson ${lessonIndex + 1} „${lesson.title}”, step ${i + 1}/${steps.length} (${os})`;
    expect(stepNo(), `${where}: not on this step`).toBe(i + 1);
    try {
      if (step.type === "info") {
        // a LOE step must point at something that exists
        if (step.target) {
          const sel = resolveText(step.target, os);
          expect(phoneScreen().querySelector(sel), `highlighted part "${sel}" missing`).not.toBeNull();
        }
        fireEvent.click(screen.getByRole("button", { name: "Edasi →" }));
      } else {
        await doStep(step, os);
      }
    } catch (e) {
      throw new Error(`${where}: ${(e as Error).message}`);
    }
    await wait(1200); // engine delays, slide-off animations
    if (i < steps.length - 1) expect(stepNo(), `${where}: did not move on`).toBe(i + 2);
  }
  expect(screen.getByText("Tubli!"), `lesson ${lessonIndex + 1} (${os}) did not finish`).toBeInTheDocument();
}

beforeEach(() => vi.useFakeTimers());
afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe.each(["android", "ios"] as const)("all Home screen lessons can be finished on %s", (os) => {
  it.each(home.lessons.map((l, i) => [i + 1, l.title, i] as const))("lesson %i: %s", async (_n, _title, i) => {
    await walk(i, os);
  });
});
