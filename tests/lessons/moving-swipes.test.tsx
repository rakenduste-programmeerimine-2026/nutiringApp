import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { House } from "@/content/types";
import { DELAY, LessonHouse, type HouseModule } from "@/features/lessons";
import { FOLLOW_MIN, SWIPE_ANIM_MS, followDone, swipeOffset } from "@/features/lessons/gestures";

/* ---------- fake house: a card that follows the finger, a panel pulled by a drag ---------- */
type S = { card: boolean; pull: number; dragEnds: string[]; open: boolean };

const movingHouse: HouseModule<S> = {
  initial: () => ({ card: true, pull: 0, dragEnds: [], open: false }),
  act: (s, action, data) => {
    switch (action) {
      case "dismiss":
        return { state: { ...s, card: false } };
      case "swipeDrag":
        return { state: { ...s, pull: Number(data.dy) } };
      case "swipeDragEnd":
        return { state: { ...s, pull: 0, dragEnds: [...s.dragEnds, data.done ?? ""] } };
      case "openShade":
        return { state: { ...s, open: true } };
      default:
        return { state: s };
    }
  },
  render: (s) => (
    <div className="ph">
      {s.card && (
        <div className="card" data-swipe="side" data-swipe-act="dismiss" data-swipe-follow="">
          teavitus
        </div>
      )}
      <div className="bar" data-swipe="down" data-swipe-act="openShade" data-swipe-drag="">
        olekuriba
      </div>
      <span>tõmme:{s.pull}</span>
      <span>lõpud:{s.dragEnds.join(",")}</span>
      <span>{s.open ? "paneel lahti" : "paneel kinni"}</span>
    </div>
  ),
};

const house: House = {
  title: "Liikuvad pühked",
  lessons: [
    {
      title: "Proov",
      steps: [
        { type: "do", text: "Libista teavitus ära", target: ".card", until: "dismiss" },
        { type: "do", text: "Tõmba paneel alla", target: ".bar", until: "openShade" },
        { type: "info", text: "Valmis" },
      ],
    },
  ],
};

/* jsdom has no real PointerEvent; a MouseEvent with the pointer name keeps the position */
const pointer = (type: string, e: Element, x: number, y: number) =>
  fireEvent(e, new MouseEvent(type, { bubbles: true, cancelable: true, clientX: x, clientY: y }));
const el = (sel: string) => document.querySelector(sel) as HTMLElement;
const wait = (ms: number) => act(() => vi.advanceTimersByTime(ms));
const card = () => screen.getByTestId("step-card");

const start = () => {
  render(<LessonHouse house={house} module={movingHouse} os="android" />);
  fireEvent.click(screen.getByRole("button", { name: "1. Proov" }));
};

beforeEach(() => vi.useFakeTimers());
afterEach(() => vi.useRealTimers());

describe("helpers", () => {
  it("the element only moves in its swipe direction", () => {
    expect(swipeOffset("up", 30, -50)).toEqual({ x: 0, y: -50 });
    expect(swipeOffset("up", 0, 40)).toEqual({ x: 0, y: 0 }); // can't pull an "up" element down
    expect(swipeOffset("down", 10, 40)).toEqual({ x: 0, y: 40 });
    expect(swipeOffset("side", -70, 20)).toEqual({ x: -70, y: 0 });
  });

  it("a moving swipe needs at least FOLLOW_MIN pixels", () => {
    expect(followDone("side", FOLLOW_MIN - 1, 0)).toBe(false);
    expect(followDone("side", -FOLLOW_MIN, 0)).toBe(true);
  });
});

describe("data-swipe-follow: the element follows the finger", () => {
  it("moves with the finger, slides off when far enough, then the action fires", async () => {
    start();
    const c = el(".card");
    pointer("pointerdown", c, 200, 100);
    pointer("pointermove", c, 150, 130);
    expect(c.style.transform).toBe("translate(-50px, 0px)"); // only sideways
    pointer("pointerup", c, 110, 130);
    expect(screen.getByText("teavitus")).toBeInTheDocument(); // still sliding off
    expect(c.style.opacity).toBe("0");
    await wait(SWIPE_ANIM_MS);
    expect(screen.queryByText("teavitus")).toBeNull(); // action fired
    await wait(DELAY.afterEvent);
    expect(card()).toHaveTextContent("Tõmba paneel alla");
  });

  it("springs back when the swipe was too short", async () => {
    start();
    const c = el(".card");
    pointer("pointerdown", c, 200, 100);
    pointer("pointermove", c, 170, 100);
    pointer("pointerup", c, 170, 100);
    await wait(SWIPE_ANIM_MS);
    expect(c.style.transform).toBe("");
    expect(screen.getByText("teavitus")).toBeInTheDocument();
    expect(card()).toHaveTextContent("Libista teavitus ära");
  });
});

describe("data-swipe-drag: the house is told how far the finger pulls", () => {
  const toPanelStep = async () => {
    start();
    const c = el(".card");
    pointer("pointerdown", c, 200, 100);
    pointer("pointerup", c, 100, 100);
    await wait(SWIPE_ANIM_MS + DELAY.afterEvent);
  };

  it("reports the pull while moving, then opens when far enough", async () => {
    await toPanelStep();
    const bar = el(".bar");
    pointer("pointerdown", bar, 100, 10);
    pointer("pointermove", bar, 100, 90);
    expect(screen.getByText("tõmme:80")).toBeInTheDocument();
    pointer("pointerup", bar, 100, 120);
    expect(screen.getByText("tõmme:0")).toBeInTheDocument();
    expect(screen.getByText("lõpud:1")).toBeInTheDocument();
    expect(screen.getByText("paneel lahti")).toBeInTheDocument();
  });

  it("a short pull ends with done=0 and does not open", async () => {
    await toPanelStep();
    const bar = el(".bar");
    pointer("pointerdown", bar, 100, 10);
    pointer("pointermove", bar, 100, 40);
    pointer("pointerup", bar, 100, 40);
    expect(screen.getByText("lõpud:0")).toBeInTheDocument();
    expect(screen.getByText("paneel kinni")).toBeInTheDocument();
  });
});
