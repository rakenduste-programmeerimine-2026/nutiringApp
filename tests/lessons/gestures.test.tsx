import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { House } from "@/content/types";
import { DELAY, LessonHouse, type HouseModule } from "@/features/lessons";
import { HINTS, LONG_PRESS_MS, physicalKey, swipeMatches } from "@/features/lessons/gestures";
import { Keyboard, initialKeyboard, keyboardAction, type KeyboardState } from "@/features/phone";

/* ---------- fake house with one element per gesture ---------- */
type S = { bright: number; text: string; kb: KeyboardState };

const gestureHouse: HouseModule<S> = {
  initial: () => ({ bright: 50, text: "", kb: initialKeyboard() }),
  act: (s, action, data) => {
    const k = keyboardAction(action, data, s.text, s.kb);
    if (k) return { state: { ...s, text: k.text, kb: k.state } };
    if (action === "slide") return { state: { ...s, bright: Number(data.v) } };
    return { state: s };
  },
  check: (s, c) => (c.kind === "bright" ? s.bright >= Number(c.value) : s.text === c.value),
  keyboardOpen: () => true,
  render: (s) => (
    <div className="ph">
      <div className="hold" data-long="longIt">hoia</div>
      <div className="swipeonly" data-swipe="up" data-swipe-act="unlock">pühi</div>
      <div className="side" data-swipe="side" data-swipe-act="dismiss">teavitus</div>
      <div className="slider" data-slide="h">heledus {s.bright}</div>
      <span className="text">tekst:{s.text}</span>
      <Keyboard state={s.kb} />
    </div>
  ),
};

const house: House = {
  title: "Žestid",
  lessons: [
    {
      title: "Kõik žestid",
      steps: [
        { type: "do", text: "Hoia", target: ".hold", until: "longIt" },
        { type: "do", text: "Pühi üles", target: ".swipeonly", until: "unlock" },
        { type: "do", text: "Libista kõrvale", target: ".side", until: "dismiss" },
        { type: "do", text: "Lohista heledust", target: ".slider", check: { kind: "bright", value: 80 } },
        { type: "do", text: "Hoia o", target: "[data-base=o]", until: "keyLong" },
        { type: "do", text: "Libista õ peale", target: '.accpop [data-k="ch:õ"]', check: { kind: "text", value: "õ" } },
        { type: "do", text: "Kirjuta a", target: ".kb", check: { kind: "text", value: "õa" } },
        { type: "info", text: "Valmis" },
      ],
    },
  ],
};

const card = () => screen.getByTestId("step-card");
const wait = (ms: number) => act(() => vi.advanceTimersByTime(ms));
const el = (sel: string) => document.querySelector(sel) as HTMLElement;
/* jsdom has no real PointerEvent, so fireEvent.pointerDown would lose the finger
   position. A MouseEvent with the pointer event's name keeps clientX / clientY. */
const pointer = (type: string, e: Element, x: number, y: number) =>
  fireEvent(e, new MouseEvent(type, { bubbles: true, cancelable: true, clientX: x, clientY: y }));
const down = (e: Element, x = 100, y = 100) => pointer("pointerdown", e, x, y);
const move = (e: Element, x: number, y: number) => pointer("pointermove", e, x, y);
const up = (e: Element, x = 100, y = 100) => pointer("pointerup", e, x, y);

/** Start the lesson and skip ahead `n` steps by doing each gesture. */
const startAt = async (n: number) => {
  render(<LessonHouse house={house} module={gestureHouse} os="android" />);
  fireEvent.click(screen.getByRole("button", { name: "1. Kõik žestid" }));
  const steps = [holdStep, swipeUpStep, sideStep, sliderStep];
  for (let i = 0; i < n; i++) await steps[i]();
};
async function holdStep() {
  down(el(".hold"));
  await wait(LONG_PRESS_MS);
  up(el(".hold"));
  await wait(DELAY.afterEvent);
}
async function swipeUpStep() {
  down(el(".swipeonly"), 100, 200);
  up(el(".swipeonly"), 100, 120);
  await wait(DELAY.afterEvent);
}
async function sideStep() {
  down(el(".side"), 200, 100);
  up(el(".side"), 120, 100);
  await wait(DELAY.afterEvent);
}
async function sliderStep() {
  vi.spyOn(el(".slider"), "getBoundingClientRect").mockReturnValue({ left: 0, right: 200, top: 0, bottom: 20, width: 200, height: 20 } as DOMRect);
  down(el(".slider"), 100, 10);
  move(el(".slider"), 180, 10);
  up(el(".slider"), 180, 10);
  await wait(DELAY.afterCheck);
}

beforeEach(() => vi.useFakeTimers());
afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe("helpers", () => {
  it("swipe directions", () => {
    expect(swipeMatches("up", 0, -40)).toBe(true);
    expect(swipeMatches("up", 0, 40)).toBe(false);
    expect(swipeMatches("down", 0, 40)).toBe(true);
    expect(swipeMatches("left", -40, 0)).toBe(true);
    expect(swipeMatches("side", 40, 0)).toBe(true);
    expect(swipeMatches("side", -40, 0)).toBe(true);
    expect(swipeMatches("side", 10, 0)).toBe(false);
  });

  it("computer keys", () => {
    expect(physicalKey("a")).toBe("ch:a");
    expect(physicalKey("õ")).toBe("ch:õ");
    expect(physicalKey("Backspace")).toBe("bksp");
    expect(physicalKey(" ")).toBe("space");
    expect(physicalKey("Shift")).toBeNull();
  });
});

describe("gestures in a lesson", () => {
  it("long press: a short tap shows the hold hint, holding finishes the step", async () => {
    await startAt(0);
    down(el(".hold"));
    up(el(".hold"));
    expect(card()).toHaveTextContent(HINTS.hold);
    await holdStep();
    expect(card()).toHaveTextContent("Pühi üles");
  });

  it("swipe-only: a tap shows the swipe hint, the wrong direction does nothing", async () => {
    await startAt(1);
    down(el(".swipeonly"));
    up(el(".swipeonly"));
    expect(card()).toHaveTextContent(HINTS.swipe);
    down(el(".swipeonly"), 100, 100);
    up(el(".swipeonly"), 100, 180); // down instead of up
    await wait(DELAY.afterEvent);
    expect(card()).toHaveTextContent("Pühi üles");
    await swipeUpStep();
    expect(card()).toHaveTextContent("Libista kõrvale");
  });

  it("sideways swipe works to the left", async () => {
    await startAt(2);
    await sideStep();
    expect(card()).toHaveTextContent("Lohista heledust");
  });

  it("slider: follows the finger, but the step is checked only when the finger is lifted", async () => {
    await startAt(3);
    vi.spyOn(el(".slider"), "getBoundingClientRect").mockReturnValue({ left: 0, right: 200, top: 0, bottom: 20, width: 200, height: 20 } as DOMRect);
    down(el(".slider"), 100, 10);
    expect(screen.getByText("heledus 50")).toBeInTheDocument();
    move(el(".slider"), 180, 10);
    expect(screen.getByText("heledus 90")).toBeInTheDocument();
    await wait(DELAY.afterCheck);
    expect(card()).toHaveTextContent("Lohista heledust"); // still dragging
    up(el(".slider"), 180, 10);
    await wait(DELAY.afterCheck);
    expect(card()).toHaveTextContent("Hoia o");
  });

  it("hold o, then slide the same finger onto õ and lift – across two steps", async () => {
    await startAt(4);
    const o = el("[data-base=o]");
    down(o);
    await wait(LONG_PRESS_MS); // popup opens, step "Hoia o" is done
    await wait(DELAY.afterEvent);
    expect(card()).toHaveTextContent("Libista õ peale");

    // the finger is still down: slide onto õ
    const oTilde = el('.accpop [data-k="ch:õ"]');
    document.elementFromPoint = vi.fn(() => oTilde);
    move(o, 100, 40);
    expect(el('.accpop [data-k="ch:õ"]')).toHaveClass("sel");
    up(o, 100, 40);
    expect(screen.getByText("tekst:õ")).toBeInTheDocument();
    expect(document.querySelector(".accpop")).toBeNull(); // popup closed
    await wait(DELAY.afterCheck);
    expect(card()).toHaveTextContent("Kirjuta a");
  });

  it("typing with the computer keyboard when the step points at the keyboard", async () => {
    await startAt(4);
    const o = el("[data-base=o]");
    down(o);
    await wait(LONG_PRESS_MS + DELAY.afterEvent);
    document.elementFromPoint = vi.fn(() => el('.accpop [data-k="ch:õ"]'));
    move(o, 100, 40);
    up(o, 100, 40);
    await wait(DELAY.afterCheck);
    fireEvent.keyDown(window, { key: "a" });
    expect(screen.getByText("tekst:õa")).toBeInTheDocument();
    await wait(DELAY.afterCheck);
    expect(card()).toHaveTextContent("Valmis");
  });

  it("lifting the finger without choosing a letter closes the popup and types nothing", async () => {
    await startAt(4);
    const o = el("[data-base=o]");
    down(o);
    await wait(LONG_PRESS_MS + DELAY.afterEvent);
    document.elementFromPoint = vi.fn(() => null);
    move(o, 300, 300);
    up(o, 300, 300);
    expect(document.querySelector(".accpop")).toBeNull();
    expect(screen.getByText("tekst:")).toBeInTheDocument();
  });
});
