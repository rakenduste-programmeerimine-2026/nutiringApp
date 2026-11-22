import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import BrowserRoomPage from "@/app/maja/kuber/brauser/page";
import { browser, SMART_KOOD_PIN1, SMART_KOOD_PIN2 } from "@/content/lessons/browser";
import type { Lesson, OS, Step } from "@/content/types";
import { SPAM_EVERY_MS } from "@/features/browser";
import { OS_STORAGE_KEY, OsProvider } from "@/features/os";
import { resolveText } from "@/features/lessons";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), refresh: vi.fn() }),
}));

const card = () => screen.getByTestId("step-card");
const tap = (el: Element) => {
  fireEvent.pointerDown(el);
  fireEvent.pointerUp(el);
};
const wait = (ms: number) =>
  act(() => {
    vi.advanceTimersByTime(ms);
  });
const phone = () => document.querySelector(".brph")!;
const plain = (html: string) => html.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();

function openRoom(os: OS) {
  window.sessionStorage.setItem(OS_STORAGE_KEY, os);
  render(
    <OsProvider>
      <BrowserRoomPage />
    </OsProvider>,
  );
  act(() => {}); // OsProvider reads the saved system after the first render
}

/** Do what a „SINU KORD” step asks, like a user would on the phone screen. */
function doStep(step: Step) {
  const target = phone().querySelector(String(step.target))!;
  if (step.check?.kind === "queryStartsWith") {
    for (const c of String(step.check.value)) tap(phone().querySelector(`[data-k="ch:${c}"]`)!);
  } else if (step.check?.kind === "page") {
    tap(phone().querySelector(".br-back")!);
    tap(phone().querySelector(".br-back")!);
  } else if (step.until === "pin1Ok" || step.until === "pin2Ok") {
    const pin = step.until === "pin1Ok" ? SMART_KOOD_PIN1 : SMART_KOOD_PIN2;
    for (const d of [...pin, "ok"]) tap(phone().querySelector(`.numpad [data-d="${d}"]`)!);
  } else {
    tap(target.matches(`[data-act="${step.until}"]`) ? target : target.querySelector(`[data-act="${step.until}"]`)!);
  }
}

/** Walk a lesson from its first step to the end, checking each card. */
function walk(lesson: Lesson, os: OS) {
  const steps = lesson.steps.filter((s) => !s.os || s.os === os);
  steps.forEach((step, i) => {
    expect(card(), `step ${i + 1}`).toHaveTextContent(`${i + 1}/${steps.length}`);
    expect(card()).toHaveTextContent(plain(resolveText(step.text, os)).slice(0, 40));
    if (step.warn) expect(card()).toHaveTextContent("OHUMÄRK");
    if (step.type === "info") {
      fireEvent.click(within(card()).getByRole("button", { name: "Edasi →" }));
    } else {
      doStep(step);
      wait(1000);
    }
  });
}

beforeEach(() => {
  vi.useFakeTimers();
  window.sessionStorage.clear();
});
afterEach(() => vi.useRealTimers());

describe("Küberbrauser room", () => {
  it("starts with the intro, then the lesson list with lesson 3 „Tulekul”", () => {
    openRoom("android");
    expect(screen.getByText(/See ei ole päris brauser/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Sain aru, alustan" }));

    expect(screen.getByRole("button", { name: "1. Riigi lehe otsimine ja Smart-ID" })).toBeEnabled();
    expect(screen.getByRole("button", { name: "2. Retsepti otsimine ja rämpsteavitused" })).toBeEnabled();
    expect(screen.getByRole("button", { name: "3. Investeerimispettused (tulekul)" })).toBeDisabled();
  });

  it("the legend explains the red OHUMÄRK card", () => {
    openRoom("android");
    expect(screen.getByText(/Punane kaart „OHUMÄRK”/)).toBeInTheDocument();
  });

  it("lesson 1 can be played from start to the „Peamised punktid” page (Android)", () => {
    openRoom("android");
    fireEvent.click(screen.getByRole("button", { name: "Sain aru, alustan" }));
    fireEvent.click(screen.getByRole("button", { name: "1. Riigi lehe otsimine ja Smart-ID" }));

    walk(browser.lessons[0], "android");

    expect(screen.getByText("Peamised punktid")).toBeInTheDocument();
    const points = screen.getAllByRole("listitem").map((li) => li.textContent?.replace(/\s+/g, " ").trim());
    for (const point of browser.lessons[0].summary!) expect(points).toContain(plain(point));
    expect(screen.getByText("Lisapunktid")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Järgmine õppetund →" })).toBeInTheDocument();
  });

  it("lesson 2 can be played to its summary on iPhone, and has no next lesson", () => {
    openRoom("ios");
    fireEvent.click(screen.getByRole("button", { name: "Sain aru, alustan" }));
    const started = vi.spyOn(window, "setInterval");
    const cleared = vi.spyOn(window, "clearInterval");
    fireEvent.click(screen.getByRole("button", { name: "2. Retsepti otsimine ja rämpsteavitused" }));

    walk(browser.lessons[1], "ios");

    expect(screen.getByText("Peamised punktid")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Järgmine õppetund →" })).toBeNull();

    // the spam timer (every 3 s) was started during the lesson and stopped with it
    const spamTimers = started.mock.calls
      .map((call, i) => ({ ms: call[1], id: started.mock.results[i].value }))
      .filter((t) => t.ms === SPAM_EVERY_MS);
    expect(spamTimers).toHaveLength(1);
    expect(cleared.mock.calls.map((c) => c[0])).toContain(spamTimers[0].id);
  });
});
