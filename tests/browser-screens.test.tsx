import { cleanup, render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import {
  browser,
  CONTROL_CODE,
  SMART_KOOD_PIN1,
  SMART_KOOD_PIN2,
  SPAM_NOTIFICATIONS,
} from "@/content/lessons/browser";
import type { OS, Step } from "@/content/types";
import {
  actBrowser,
  addSpam,
  browserModule,
  checkBrowser,
  enterBrowser,
  initialBrowser,
  setupBrowser,
  SK_NOTIF_DELAY_MS,
  SPAM_EVERY_MS,
  WRONG_PIN,
  type BrowserState,
} from "@/features/browser";
import { resolveText } from "@/features/lessons";

/** Draw the phone screen into a .phone frame like PhoneStage does. */
const draw = (s: BrowserState, os: OS = "android") =>
  render(<div className={`phone ${os}`}>{browserModule.render(s, os)}</div>).container;

const act = (s: BrowserState, action: string, data: Record<string, string> = {}) =>
  actBrowser(s, action, data).state;

const typeText = (s: BrowserState, text: string) =>
  [...text].reduce((x, c) => act(x, "key", { k: `ch:${c}` }), s);

const pad = (s: BrowserState, keys: string) => {
  let event: string | undefined;
  for (const d of [...keys, "ok"]) {
    const r = actBrowser(s, "pad", { d });
    s = r.state;
    event = r.event ?? event;
  }
  return { state: s, event };
};

/** Through the fake site up to the Smart-KOOD PIN1 request. */
const toPin1 = () => {
  let s = setupBrowser(initialBrowser("android"), "topic:pension");
  for (const a of ["searchFocus"]) s = act(s, a);
  s = typeText(s, "sots");
  for (const a of ["pickSugg", "openRes", "fgLogin", "fgSk", "fgGo"]) s = act(s, a);
  s = enterBrowser(s, "skNotif").state;
  return act(s, "openSk");
};

describe("both systems", () => {
  it.each(["android", "ios"] as const)("draws the browser frame on %s", (os) => {
    const el = draw(initialBrowser(os), os);
    expect(el.querySelector(".br-badge")?.textContent).toBe("HARJUTUS");
    expect(el.querySelector(".br-search")).not.toBeNull();
    expect(el.querySelector(".br-back")).not.toBeNull();
    expect(el.querySelector(os === "android" ? ".navbar" : ".homeind")).not.toBeNull();
  });
});

describe("search", () => {
  it("opens the keyboard and shows the suggestion after 3 matching letters", () => {
    let s = act(setupBrowser(initialBrowser("android"), "topic:cake"), "searchFocus");
    expect(browserModule.keyboardOpen!(s)).toBe(true);
    s = typeText(s, "po");
    expect(draw(s).querySelector(".sugg")).toBeNull();
    s = typeText(s, "r");
    expect(draw(s).querySelector(".sugg")?.textContent).toBe("porgandikook retsept");
    expect(checkBrowser(s, { kind: "queryStartsWith", value: "porg" })).toBe(false);
    s = typeText(s, "g");
    expect(checkBrowser(s, { kind: "queryStartsWith", value: "porg" })).toBe(true);
    cleanup();
    expect(draw(typeText(s, "x")).querySelector(".sugg")).toBeNull();
  });

  it("shows a sponsored fake result first and the real one below", () => {
    const s = act(act(typeText(act(initialBrowser("ios"), "searchFocus"), "sots"), "pickSugg"), "noop");
    const el = draw(s, "ios");
    expect(el.querySelector(".res-ad .sp")?.textContent).toBe("Sponsitud");
    expect(el.querySelector(".res-ad .url")?.textContent).toBe("https://sootsiaalkindlustusamet.com");
    expect(el.querySelector(".res-real .url")?.textContent).toBe("https://www.sotsiaalkindlustusamet.ee");
    expect(browserModule.keyboardOpen!(s)).toBe(false);
  });
});

describe("Smart-KOOD PIN entry", () => {
  it("asks PIN1 (4 digits) with the control code and accepts the right PIN", () => {
    const s = toPin1();
    const el = draw(s);
    expect(el.querySelector(".skapp")?.textContent).toContain("harjutusrakendus");
    expect(el.querySelector(".sk-req")?.textContent).toContain(CONTROL_CODE);
    expect(el.querySelectorAll(".dots i")).toHaveLength(4);

    const r = pad(s, SMART_KOOD_PIN1);
    expect(r.event).toBe("pin1Ok");
    expect(r.state.sk).toBeNull();
    expect(r.state.page).toBe("fake-pin2");
  });

  it("shows an error and clears the PIN after a wrong PIN", () => {
    const r = pad(toPin1(), "1111");
    expect(r.event).toBeUndefined();
    expect(r.state.pinError).toBe(WRONG_PIN);
    expect(r.state.sk?.pin).toBe("");
    expect(draw(r.state).querySelector(".pinerr")?.textContent).toBe(WRONG_PIN);
  });

  it("does not take more digits than the PIN has, and ⌫ deletes one", () => {
    let s = toPin1();
    for (const d of "123456") s = act(s, "pad", { d });
    expect(s.sk?.pin).toBe("1234");
    s = act(s, "pad", { d: "del" });
    expect(s.sk?.pin).toBe("123");
    expect(draw(s).querySelectorAll(".dots i.f")).toHaveLength(3);
  });

  it("asks PIN2 (5 digits) for a payment to the scammer", () => {
    let s = pad(toPin1(), SMART_KOOD_PIN1).state;
    s = act(enterBrowser(s, "skNotif").state, "openSk");
    expect(s.sk?.stage).toBe("pin2");
    const el = draw(s);
    expect(el.querySelectorAll(".dots i")).toHaveLength(5);
    expect(el.querySelector(".sk-req")?.textContent).toContain("Kiirlaen Invest OÜ");
    const r = pad(s, SMART_KOOD_PIN2);
    expect(r.event).toBe("pin2Ok");
    expect(r.state.page).toBe("fake-done");
  });
});

describe("back history", () => {
  it("‹ goes back page by page and does nothing at the start", () => {
    let s = setupBrowser(initialBrowser("android"), "topic:cake");
    expect(act(s, "brBack")).toEqual(s);
    s = act(typeText(act(s, "searchFocus"), "porg"), "pickSugg");
    s = act(s, "openRes");
    s = act(enterBrowser(s, "popupPrize").state, "adClose");
    expect(s.page).toBe("diet");
    expect(s.popup).toBe("diet");

    s = act(s, "brBack");
    expect(s.page).toBe("cake");
    expect(s.popup).toBeNull();
    s = act(s, "brBack");
    expect(checkBrowser(s, { kind: "page", value: "res" })).toBe(true);
    s = act(s, "brBack");
    expect(s.page).toBe("home");
  });

  it("the „‹ kaks korda” step starts with the recipe history", () => {
    const s = enterBrowser(initialBrowser("android"), "page:diet+histCake").state;
    expect(act(act(s, "brBack"), "brBack").page).toBe("res");
  });

  it("never changes a state in place, so the engine can restore it", () => {
    const s = setupBrowser(initialBrowser("android"), "topic:cake");
    const copy = structuredClone(s);
    act(typeText(act(s, "searchFocus"), "porg"), "pickSugg");
    enterBrowser(s, "page:diet+histCake+spamSample+popupDiet");
    expect(s).toEqual(copy);
  });
});

describe("spam notifications", () => {
  it("start with one notification and add one every 3 s, newest first, max 3", () => {
    const r = enterBrowser(initialBrowser("android"), "startSpam");
    expect(r.state.spam).toEqual([SPAM_NOTIFICATIONS[0]]);
    expect(r.effects).toEqual([{ every: SPAM_EVERY_MS, apply: addSpam }]);
    let s = r.state;
    for (let i = 0; i < 3; i++) s = addSpam(s);
    expect(s.spam).toEqual([SPAM_NOTIFICATIONS[3], SPAM_NOTIFICATIONS[2], SPAM_NOTIFICATIONS[1]]);
    expect(draw(s).querySelectorAll(".spam .spn")).toHaveLength(3);
  });

  it("stop when the next step says so: the timer adds nothing any more", () => {
    let s = enterBrowser(initialBrowser("android"), "startSpam").state;
    s = enterBrowser(s, "stopSpam").state;
    expect(addSpam(s)).toBe(s);
    s = enterBrowser(s, "page:res+resetSpam").state;
    expect(s.spam).toEqual([]);
    expect(addSpam(s)).toBe(s);
  });

  it("do not start a second timer if spam is already on", () => {
    const s = enterBrowser(initialBrowser("android"), "startSpam").state;
    expect(enterBrowser(s, "startSpam").effects).toBeUndefined();
  });
});

describe("Smart-KOOD and NutiBank notifications", () => {
  it("the delayed Smart-KOOD notification comes after 1.2 s", () => {
    const r = enterBrowser(initialBrowser("android"), "skNotif:delayed");
    expect(r.state.skNotif).toBe(false);
    const [effect] = r.effects!;
    expect(effect).toMatchObject({ after: SK_NOTIF_DELAY_MS });
    expect(effect.apply(r.state).skNotif).toBe(true);
  });

  it("the NutiBank notification shows the payment", () => {
    const s = enterBrowser(initialBrowser("android"), "page:fake-done+bankNotif").state;
    const text = draw(s).querySelector(".bank-notif")?.textContent ?? "";
    expect(text).toContain("NutiBank");
    expect(text).toContain("Kiirlaen Invest OÜ");
    // Estonian groups digits only from 5 digits up: „1250,00 €”, as in the lesson text
    expect(text).toMatch(/1\s?250,00\s€/);
  });
});

/*
 * Walk every lesson step by step like the lesson engine does (without timers):
 * run the step's `enter`, check its target is on the screen, then do what the step asks.
 */
function doStep(s: BrowserState, step: Step): BrowserState {
  if (step.type !== "do") return s;
  if (step.check?.kind === "queryStartsWith") return typeText(s, String(step.check.value));
  if (step.check?.kind === "page") {
    // press ‹ until the page is reached (at most a few times)
    for (let i = 0; i < 5 && !checkBrowser(s, step.check); i++) s = act(s, "brBack");
    return s;
  }
  const until = String(step.until);
  if (until === "pin1Ok") return pad(s, SMART_KOOD_PIN1).state;
  if (until === "pin2Ok") return pad(s, SMART_KOOD_PIN2).state;
  const r = actBrowser(s, until, {});
  return r.state;
}

describe.each(["android", "ios"] as const)("lessons on %s", (os) => {
  browser.lessons
    .filter((l) => !l.soon)
    .forEach((lesson) => {
      it(`„${lesson.title}”: every step's target is on the screen`, () => {
        let s = browserModule.initial(os);
        if (lesson.setup) s = browserModule.setup!(s, lesson.setup, os);
        lesson.steps.forEach((step, i) => {
          if (step.enter) {
            const r = browserModule.enter!(s, step.enter, os);
            // delayed changes have happened by the time the user reads the step
            s = (r.effects ?? []).filter((e) => "after" in e).reduce((x, e) => e.apply(x), r.state);
          }
          const target = resolveText(step.target, os);
          if (target) {
            const el = draw(s, os);
            for (const sel of target.split(",")) {
              expect(el.querySelector(sel.trim()), `step ${i + 1}: ${sel}`).not.toBeNull();
            }
            cleanup();
          }
          const before = s;
          s = doStep(s, step);
          if (step.type === "do" && step.check) {
            expect(browserModule.check!(s, step.check, os), `step ${i + 1} check`).toBe(true);
          } else if (step.type === "do") {
            expect(s, `step ${i + 1} (${String(step.until)}) changed nothing`).not.toEqual(before);
          }
        });
      });
    });
});
