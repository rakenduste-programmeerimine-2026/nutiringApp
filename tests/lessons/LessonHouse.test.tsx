import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { vi } from "vitest";
import type { House } from "@/content/types";
import { DELAY, LessonHouse, type HouseModule } from "@/features/lessons";

/* ---------- a tiny fake house ---------- */
type FakeState = { count: number; opened: string | null; note: string };

const fakeModule: HouseModule<FakeState> = {
  initial: () => ({ count: 0, opened: null, note: "" }),
  setup: (s, name) => (name === "start5" ? { ...s, count: 5 } : s),
  enter: (s, name) =>
    name === "noteLater"
      ? { state: s, effects: [{ after: 1000, apply: (x) => ({ ...x, note: "hiljem" }) }] }
      : { state: s },
  act: (s, action, data) => {
    if (action === "plus") return { state: { ...s, count: s.count + 1 } };
    if (action === "open") return { state: { ...s, opened: data.app ?? null }, event: `open:${data.app}` };
    return { state: s };
  },
  check: (s, c) => c.kind === "count" && s.count >= Number(c.value),
  render: (s) => (
    <div className="ph">
      <span className="counter">loendur {s.count}</span>
      <span className="note">{s.note}</span>
      <button data-act="plus">pluss</button>
      <button data-act="open" data-app="clock">kell</button>
      <button className="other">muu</button>
    </div>
  ),
};

const house: House = {
  title: "Proovimaja",
  lessons: [
    {
      title: "Esimene tund",
      steps: [
        { type: "info", text: "Tere! See on <b>loendur</b>.", target: ".counter" },
        { type: "do", text: "Ava kell.", target: "[data-act=open]", until: "open:clock" },
        { type: "info", text: "Ainult Androidis", os: "android" },
        { type: "do", text: "Vajuta plussi kaks korda.", target: "[data-act=plus]", check: { kind: "count", value: 2 }, popup: "Kood on <b>1234</b>" },
        { type: "info", text: "Ohtlik koht!", warn: true },
      ],
    },
    { title: "Teine tund", setup: "start5", steps: [{ type: "info", text: "Viis", enter: "noteLater" }, { type: "info", text: "Lõpp" }] },
    { title: "Tulekul tund", soon: true, steps: [] },
  ],
};

const card = () => screen.getByTestId("step-card");
const tap = (el: Element) => {
  fireEvent.pointerDown(el);
  fireEvent.pointerUp(el);
};
const wait = (ms: number) => act(() => vi.advanceTimersByTime(ms));
const start = (os: "android" | "ios" = "ios", lesson = "1. Esimene tund") => {
  render(<LessonHouse house={house} module={fakeModule} os={os} />);
  fireEvent.click(screen.getByRole("button", { name: lesson }));
};

beforeEach(() => vi.useFakeTimers());
afterEach(() => vi.useRealTimers());

describe("lesson engine", () => {
  it("starts from the lesson list; the „Tulekul” lesson is disabled", () => {
    render(<LessonHouse house={house} module={fakeModule} os="ios" />);
    expect(screen.getByRole("button", { name: "3. Tulekul tund" })).toBeDisabled();
  });

  it("LOE step: shows the text with formatting and moves on with „Edasi →”", () => {
    start();
    expect(card()).toHaveTextContent("LOE");
    expect(card().querySelector("b")).toHaveTextContent("loendur");
    fireEvent.click(screen.getByRole("button", { name: "Edasi →" }));
    expect(card()).toHaveTextContent("SINU KORD");
    expect(card()).toHaveTextContent("Ava kell.");
  });

  it("SINU KORD step: a tap in the wrong place shows the hint, the right one moves on", async () => {
    start();
    fireEvent.click(screen.getByRole("button", { name: "Edasi →" }));
    tap(screen.getByText("muu"));
    expect(card()).toHaveTextContent("Vajuta sinise ringiga märgitud kohale.");
    tap(screen.getByText("kell"));
    await wait(DELAY.afterEvent);
    // iPhone: the Android-only step is skipped
    expect(card()).toHaveTextContent("Vajuta plussi kaks korda.");
  });

  it("does not let taps outside the target change the phone", () => {
    start();
    fireEvent.click(screen.getByRole("button", { name: "Edasi →" }));
    tap(screen.getByText("pluss")); // target is the clock, not plus
    expect(screen.getByText("loendur 0")).toBeInTheDocument();
  });

  it("numbers only the chosen system's steps", () => {
    start("ios");
    expect(card()).toHaveTextContent("1/4");
  });

  it("a check step finishes when the condition becomes true; OHUMÄRK card is red", async () => {
    start("ios");
    fireEvent.click(screen.getByRole("button", { name: "Edasi →" }));
    tap(screen.getByText("kell"));
    await wait(DELAY.afterEvent);
    expect(card()).toHaveTextContent("Kood on 1234"); // yellow note inside the card on phones
    tap(screen.getByText("pluss"));
    tap(screen.getByText("pluss"));
    await wait(DELAY.afterCheck);
    expect(card()).toHaveTextContent("OHUMÄRK");
    expect(card()).toHaveTextContent("Ohtlik koht!");
  });

  it("„‹ Tagasi” goes one step back and restores the phone", async () => {
    start("ios");
    fireEvent.click(screen.getByRole("button", { name: "Edasi →" }));
    tap(screen.getByText("kell"));
    await wait(DELAY.afterEvent);
    tap(screen.getByText("pluss"));
    expect(screen.getByText("loendur 1")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Eelmine samm" }));
    expect(card()).toHaveTextContent("Ava kell.");
    expect(screen.getByText("loendur 0")).toBeInTheDocument();
  });

  it("has no „‹ Tagasi” on the first step", () => {
    start();
    expect(screen.queryByRole("button", { name: "Eelmine samm" })).toBeNull();
  });

  it("runs the lesson setup and delayed changes", async () => {
    start("ios", "2. Teine tund");
    expect(screen.getByText("loendur 5")).toBeInTheDocument();
    await wait(1000);
    expect(screen.getByText("hiljem")).toBeInTheDocument();
  });

  it("cancels a pending delayed change when going back to the list", async () => {
    start("ios", "2. Teine tund");
    fireEvent.click(screen.getByRole("button", { name: "Õppetunnid" }));
    await wait(1000);
    expect(screen.queryByText("hiljem")).toBeNull();
  });

  it("shows the end screen after the last step", () => {
    start("ios", "2. Teine tund");
    fireEvent.click(screen.getByRole("button", { name: "Edasi →" }));
    fireEvent.click(screen.getByRole("button", { name: "Edasi →" }));
    expect(screen.getByText("Tubli!")).toBeInTheDocument();
  });
});
