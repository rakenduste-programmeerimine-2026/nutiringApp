import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
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
    expect(screen.getByRole("button", { name: "3. Tulekul tund (tulekul)" })).toBeDisabled();
    expect(screen.getByText("Tulekul")).toBeInTheDocument();
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
    expect(screen.getByText("Õppetund „Teine tund” on läbi.")).toBeInTheDocument();
  });
});

describe("screens around the lessons", () => {
  const finish = (lesson: string, steps: number) => {
    start("ios", lesson);
    for (let i = 0; i < steps; i++) fireEvent.click(screen.getByRole("button", { name: "Edasi →" }));
  };

  it("end screen: „Järgmine õppetund” starts the next lesson; links back to the village", () => {
    render(<LessonHouse house={house} module={fakeModule} os="ios" />);
    fireEvent.click(screen.getByRole("button", { name: "1. Esimene tund" }));
    // jump straight to the second lesson's end via the list instead of playing lesson 1
    fireEvent.click(screen.getByRole("button", { name: "Õppetunnid" }));
    fireEvent.click(screen.getByRole("button", { name: "2. Teine tund" }));
    fireEvent.click(screen.getByRole("button", { name: "Edasi →" }));
    fireEvent.click(screen.getByRole("button", { name: "Edasi →" }));
    // next lesson is „Tulekul” → no „Järgmine õppetund”
    expect(screen.queryByRole("button", { name: "Järgmine õppetund →" })).toBeNull();
    // two links: the top bar and the end screen – both go to the village
    const links = screen.getAllByRole("link", { name: "Tagasi külasse" });
    expect(links).toHaveLength(2);
    links.forEach((l) => expect(l).toHaveAttribute("href", "/kula"));
    fireEvent.click(screen.getByRole("button", { name: "Vali teine õppetund" }));
    expect(screen.getByText("Vali õppetund")).toBeInTheDocument();
  });

  it("„Järgmine õppetund →” is shown when the next lesson can be started", () => {
    const twoLessons: House = { title: "Kaks", lessons: [house.lessons[1], { title: "Kolmas", steps: [{ type: "info", text: "Kolm" }] }] };
    render(<LessonHouse house={twoLessons} module={fakeModule} os="ios" />);
    fireEvent.click(screen.getByRole("button", { name: "1. Teine tund" }));
    fireEvent.click(screen.getByRole("button", { name: "Edasi →" }));
    fireEvent.click(screen.getByRole("button", { name: "Edasi →" }));
    fireEvent.click(screen.getByRole("button", { name: "Järgmine õppetund →" }));
    expect(card()).toHaveTextContent("Kolm");
  });

  it("a lesson with a summary ends with „Peamised punktid”", () => {
    const withSummary: House = {
      title: "Kokkuvõte",
      lessons: [{ title: "Tund", summary: ["Vaata <b>aadressi</b>.", "Ära sisesta PIN2."], steps: [{ type: "info", text: "Üks" }] }],
    };
    render(<LessonHouse house={withSummary} module={fakeModule} os="ios" />);
    fireEvent.click(screen.getByRole("button", { name: "1. Tund" }));
    fireEvent.click(screen.getByRole("button", { name: "Edasi →" }));
    expect(screen.getByText("Peamised punktid")).toBeInTheDocument();
    expect(screen.getByText("aadressi").tagName).toBe("B");
    expect(screen.getByText("Lisapunktid")).toBeInTheDocument();
    expect(screen.queryByText("Tubli!")).toBeNull();
  });

  it("a house with an intro shows it first, then the list", () => {
    const withIntro: House = { ...house, intro: "<h3>Küberbrauser</h3><p>See ei ole päris brauser.</p>" };
    render(<LessonHouse house={withIntro} module={fakeModule} os="ios" />);
    expect(screen.getByRole("heading", { name: "Küberbrauser" })).toBeInTheDocument();
    expect(screen.queryByText("Vali õppetund")).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Sain aru, alustan" }));
    expect(screen.getByText("Vali õppetund")).toBeInTheDocument();
  });

  it("the legend explains OHUMÄRK only in houses that use red cards", () => {
    finish("1. Esimene tund", 0);
    expect(screen.getByText(/Punane kaart „OHUMÄRK”/)).toBeInTheDocument();
    cleanup();
    const noWarn: House = { title: "Ilma", lessons: [house.lessons[1]] };
    render(<LessonHouse house={noWarn} module={fakeModule} os="ios" />);
    expect(screen.queryByText(/Punane kaart „OHUMÄRK”/)).toBeNull();
    expect(screen.getByText(/„Tagasi” viib ühe sammu tagasi/)).toBeInTheDocument();
  });
});
