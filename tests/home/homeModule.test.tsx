import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { SCREEN_LOCK, SIM_PIN } from "@/content/lessons/home";
import type { OS } from "@/content/types";
import { homeModule, initialHome, type HomeState } from "@/features/home";

/* ---------- helpers ---------- */
const act = (s: HomeState, action: string, data: Record<string, string> = {}, os: OS = "android") =>
  homeModule.act(s, action, data, os);

/** Press number pad keys one after another; returns the last result. */
function typeCode(s: HomeState, keys: string[], os: OS = "android") {
  let r = { state: s, event: undefined as string | undefined };
  for (const d of keys) r = act(r.state, "pad", { d }, os) as typeof r;
  return r;
}

const draw = (s: HomeState, os: OS) => render(<div className={`phone ${os}`}>{homeModule.render(s, os)}</div>).container;

const sim = () => homeModule.setup!(initialHome(), "sim", "android");

describe("setup names from the lessons", () => {
  it("sim, drawer, sb:openNotif, sb:openQS", () => {
    expect(sim().scr).toBe("sim");
    expect(homeModule.setup!(initialHome(), "drawer", "ios").scr).toBe("drawer");
    expect(homeModule.setup!(initialHome(), "sb:openNotif", "ios").sb).toBe("openNotif");
    expect(homeModule.setup!(initialHome(), "sb:openQS", "ios").sb).toBe("openQS");
  });
});

describe("SIM PIN", () => {
  it(`the right code ${SIM_PIN} + OK opens the lock screen (event simOk)`, () => {
    const r = typeCode(sim(), [...SIM_PIN.split(""), "ok"]);
    expect(r.event).toBe("simOk");
    expect(r.state.scr).toBe("lock");
    expect(r.state.pin).toBe("");
  });

  it("a wrong code shows an error and empties the field", () => {
    const r = typeCode(sim(), ["9", "9", "9", "9", "ok"]);
    expect(r.event).toBeUndefined();
    expect(r.state.scr).toBe("sim");
    expect(r.state.err).toBe("Vale kood. Proovi uuesti.");
    expect(r.state.pin).toBe("");
  });

  it("⌫ deletes the last digit, at most 4 digits, typing clears the error", () => {
    let s = typeCode(sim(), ["1", "2", "del"]).state;
    expect(s.pin).toBe("1");
    s = typeCode(s, ["2", "3", "4", "5"]).state;
    expect(s.pin).toBe("1234");
    s = typeCode({ ...s, pin: "", err: "Vale kood. Proovi uuesti." }, ["1"]).state;
    expect(s.err).toBe("");
  });
});

describe("lock screen and screen lock code", () => {
  const lock = () => typeCode(sim(), [...SIM_PIN.split(""), "ok"]).state;

  it("swiping up (or tapping) unlocks to the code screen", () => {
    expect(act(lock(), "unlock").state.scr).toBe("pass");
  });

  it("the whole lock screen follows the finger and comes back when released", () => {
    const pulled = act(lock(), "swipeDrag", { dy: "-80" }).state;
    expect(pulled.lockPull).toBe(-80);
    expect(act(pulled, "swipeDragEnd", { done: "0" }).state.lockPull).toBe(0);
  });

  it(`Android: ${SCREEN_LOCK} + OK opens the home screen (event passOk)`, () => {
    const pass = act(lock(), "unlock").state;
    const r = typeCode(pass, [...SCREEN_LOCK.split(""), "ok"]);
    expect(r.event).toBe("passOk");
    expect(r.state.scr).toBe("home");
  });

  it("iPhone: no OK key – the code is checked after the 4th digit (English error)", () => {
    const pass = { ...initialHome(), scr: "pass" as const };
    expect(typeCode(pass, SCREEN_LOCK.split(""), "ios").event).toBe("passOk");
    const wrong = typeCode(pass, ["1", "1", "1", "1"], "ios").state;
    expect(wrong.err).toBe("Wrong passcode. Try again.");
    expect(wrong.scr).toBe("pass");
  });
});

describe("checks used by the lessons", () => {
  it("searchQuery and brightnessChanged", () => {
    const s = initialHome();
    expect(homeModule.check!({ ...s, q: " Kell " }, { kind: "searchQuery", value: "kell" }, "android")).toBe(true);
    expect(homeModule.check!({ ...s, q: "ke" }, { kind: "searchQuery", value: "kell" }, "android")).toBe(false);
    expect(homeModule.check!({ ...s, bright: 80 }, { kind: "brightnessChanged", value: 15 }, "ios")).toBe(true);
    expect(homeModule.check!({ ...s, bright: 70 }, { kind: "brightnessChanged", value: 15 }, "ios")).toBe(false);
  });

  it("the keyboard counts as open only on the search screen", () => {
    expect(homeModule.keyboardOpen!({ ...initialHome(), scr: "search" })).toBe(true);
    expect(homeModule.keyboardOpen!(initialHome())).toBe(false);
  });
});

describe("drawing lesson 1 screens", () => {
  it("SIM screen: Estonian on Android with OK, English on iPhone", () => {
    const a = draw(sim(), "android");
    expect(screen.getByText("Sisesta SIM-kaardi PIN-kood")).toBeInTheDocument();
    expect(a.querySelector(".pinbox")).not.toBeNull();
    expect(a.querySelector(".numpad [data-d=ok]")).not.toBeNull();
    expect(a.querySelector(".navbar")).toBeNull(); // no Android nav bar here
  });

  it("SIM screen on iPhone is in English", () => {
    draw(homeModule.setup!(initialHome(), "sim", "ios"), "ios");
    expect(screen.getByText("SIM PIN")).toBeInTheDocument();
    expect(screen.getByText("Enter SIM PIN")).toBeInTheDocument();
  });

  it("lock screen has the parts the lesson points at, without the Android nav bar", () => {
    const c = draw({ ...initialHome(), scr: "lock" }, "android");
    for (const sel of [".lock-time", ".lock-date", ".lk-left", ".lk-right", ".swipeup"]) {
      expect(c.querySelector(sel), sel).not.toBeNull();
    }
    expect(c.querySelector(".swipeup")).toHaveAttribute("data-swipe-drag");
    expect(c.querySelector(".navbar")).toBeNull();
    expect(screen.getByText("Avamiseks pühkige üles")).toBeInTheDocument();
  });

  it("code screen: no OK key on iPhone", () => {
    const c = draw({ ...initialHome(), scr: "pass" }, "ios");
    expect(screen.getByText("Enter Passcode")).toBeInTheDocument();
    expect(c.querySelector("[data-d=ok]")).toBeNull();
  });

  it("the dimmer darkens the screen when brightness goes down", () => {
    const c = draw({ ...initialHome(), bright: 20 }, "android");
    expect(Number((c.querySelector(".dimmer") as HTMLElement).style.opacity)).toBeCloseTo(0.48);
  });
});
