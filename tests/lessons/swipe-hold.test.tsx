import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import type { House } from "@/content/types";
import { DELAY, LessonHouse, type HouseModule } from "@/features/lessons";
import { SWIPE_HOLD_MS } from "@/features/lessons/gestures";

/* iPhone bottom line: swipe up + pause → open apps; swipe up + release → home. */
type S = { where: string };

const lineHouse: HouseModule<S> = {
  initial: () => ({ where: "app" }),
  act: (s, action) => {
    if (action === "navHome") return { state: { where: "home" }, event: "goHome" };
    if (action === "openRecents") return { state: { where: "recents" } };
    return { state: s };
  },
  render: (s) => (
    <div className="ph">
      <span>kus:{s.where}</span>
      <div className="line" data-act="navHome" data-swipe="up" data-long="openRecents" data-swipe-hold="openRecents">
        joon
      </div>
    </div>
  ),
};

const house: House = {
  title: "Joon",
  lessons: [
    {
      title: "Avatud rakendused",
      steps: [
        { type: "do", text: "Pühi üles ja hoia", target: ".line", until: ["openRecents", "goHome"] },
        { type: "info", text: "Valmis" },
      ],
    },
  ],
};

const pointer = (type: string, x: number, y: number) =>
  fireEvent(document.querySelector(".line")!, new MouseEvent(type, { bubbles: true, cancelable: true, clientX: x, clientY: y }));
const wait = (ms: number) => act(() => vi.advanceTimersByTime(ms));

beforeEach(() => {
  vi.useFakeTimers();
  render(<LessonHouse house={house} module={lineHouse} os="ios" />);
  fireEvent.click(screen.getByRole("button", { name: "1. Avatud rakendused" }));
});
afterEach(() => vi.useRealTimers());

it("swipe up and pause with the finger down → open apps (release does nothing more)", async () => {
  pointer("pointerdown", 100, 600);
  pointer("pointermove", 100, 520); // swiped up 80 px
  await wait(SWIPE_HOLD_MS);
  expect(screen.getByText("kus:recents")).toBeInTheDocument();
  pointer("pointerup", 100, 520);
  expect(screen.getByText("kus:recents")).toBeInTheDocument(); // not "home"
});

it("swipe up and let go without pausing → home", async () => {
  pointer("pointerdown", 100, 600);
  pointer("pointermove", 100, 520);
  await wait(SWIPE_HOLD_MS / 2);
  pointer("pointerup", 100, 500);
  expect(screen.getByText("kus:home")).toBeInTheDocument();
});

it("still moving does not count as a pause", async () => {
  pointer("pointerdown", 100, 600);
  pointer("pointermove", 100, 560);
  await wait(SWIPE_HOLD_MS - 100);
  pointer("pointermove", 100, 500); // keeps moving → the wait starts again
  await wait(SWIPE_HOLD_MS - 100);
  expect(screen.getByText("kus:app")).toBeInTheDocument();
  await wait(200);
  expect(screen.getByText("kus:recents")).toBeInTheDocument();
  await wait(DELAY.afterEvent);
});
