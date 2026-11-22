import {
  CONTROL_CODE,
  SMART_KOOD_PIN1,
  SMART_KOOD_PIN2,
  SPAM_NOTIFICATIONS,
} from "@/content/lessons/browser";
import type { OS, Step } from "@/content/types";
import type { ActData, ActResult, Effect } from "@/features/lessons";
import { initialKeyboard, keyboardAction, type KeyboardState } from "@/features/phone";

/*
 * State and rules of the Küberbrauser practice browser (prototype `WEB`).
 * The state is never changed in place: every function returns a new object,
 * so the lesson engine can save it at each step and put it back on „‹ Tagasi”.
 */

export type Topic = "pension" | "cake";

export type Page =
  | "home"
  | "search"
  | "res"
  | "fake-gov"
  | "fake-login"
  | "fake-id"
  | "fake-wait"
  | "fake-pin2"
  | "fake-done"
  | "cake"
  | "diet";

export type SmartKood = { stage: "pin1" | "pin2"; pin: string };

export type BrowserState = {
  topic: Topic;
  page: Page;
  /** Text typed into the search box. */
  query: string;
  kb: KeyboardState;
  /** The search keyboard is shown. */
  kbOpen: boolean;
  /** Pages behind the ‹ button, oldest first. */
  history: Page[];
  /** Permission prompt of the recipe site. */
  perm: "notif" | "popup" | null;
  /** Pop-up ad over the page. */
  popup: "prize" | "diet" | null;
  /** Spam notifications, newest first (max 3). */
  spam: string[];
  spamOn: boolean;
  /** Which spam text comes next. */
  spamNext: number;
  /** Smart-KOOD notification at the top of the screen. */
  skNotif: boolean;
  /** Smart-KOOD app open (asking for PIN1 or PIN2). */
  sk: SmartKood | null;
  pinError: string;
  /** NutiBank payment notification. */
  bankNotif: boolean;
};

export const SPAM_EVERY_MS = 3000;
export const SK_NOTIF_DELAY_MS = 1200;
export const MAX_SPAM = 3;
export const WRONG_PIN = "Vale PIN. Proovi uuesti.";

export const SUGGESTION: Record<Topic, string> = {
  pension: "sotsiaalkindlustusamet pension",
  cake: "porgandikook retsept",
};

export function initialBrowser(os: OS): BrowserState {
  return {
    topic: "pension",
    page: "home",
    query: "",
    kb: initialKeyboard(os === "ios"),
    kbOpen: false,
    history: [],
    perm: null,
    popup: null,
    spam: [],
    spamOn: false,
    spamNext: 0,
    skNotif: false,
    sk: null,
    pinError: "",
    bankNotif: false,
  };
}

/** Go to another page: closes the keyboard and everything shown over the page (spam stays). */
export function goTo(s: BrowserState, page: Page): BrowserState {
  return { ...s, page, kbOpen: false, perm: null, popup: null, sk: null, skNotif: false, bankNotif: false, pinError: "" };
}

/** The suggestion appears after 3 letters that match its start. */
export function showSuggestion(s: BrowserState): boolean {
  const q = s.query.toLowerCase().trim();
  return q.length >= 3 && SUGGESTION[s.topic].startsWith(q);
}

export function pinLength(stage: SmartKood["stage"]): number {
  return (stage === "pin1" ? SMART_KOOD_PIN1 : SMART_KOOD_PIN2).length;
}

/** One new spam notification (only while spam is on). */
export function addSpam(s: BrowserState): BrowserState {
  if (!s.spamOn) return s;
  const text = SPAM_NOTIFICATIONS[s.spamNext % SPAM_NOTIFICATIONS.length];
  return { ...s, spam: [text, ...s.spam].slice(0, MAX_SPAM), spamNext: s.spamNext + 1 };
}

/** A key on the Smart-KOOD number pad: a digit, "del" or "ok". */
export function pressPad(s: BrowserState, key: string): ActResult<BrowserState> {
  if (!s.sk) return { state: s };
  const want = s.sk.stage === "pin1" ? SMART_KOOD_PIN1 : SMART_KOOD_PIN2;
  const sk = s.sk;
  if (key === "del") return { state: { ...s, pinError: "", sk: { ...sk, pin: sk.pin.slice(0, -1) } } };
  if (key === "ok") {
    if (sk.pin === want) {
      const done = goTo(s, sk.stage === "pin1" ? "fake-pin2" : "fake-done");
      return { state: done, event: sk.stage === "pin1" ? "pin1Ok" : "pin2Ok" };
    }
    return { state: { ...s, pinError: WRONG_PIN, sk: { ...sk, pin: "" } } };
  }
  if (!/^\d$/.test(key) || sk.pin.length >= want.length) return { state: { ...s, pinError: "" } };
  return { state: { ...s, pinError: "", sk: { ...sk, pin: sk.pin + key } } };
}

/* ---------- lesson setup and step `enter` names (see src/content/lessons/browser.ts) ---------- */

export function setupBrowser(s: BrowserState, name: string): BrowserState {
  if (name === "topic:pension") return { ...s, topic: "pension" };
  if (name === "topic:cake") return { ...s, topic: "cake" };
  return s;
}

const PAGES: readonly Page[] = [
  "home",
  "search",
  "res",
  "fake-gov",
  "fake-login",
  "fake-id",
  "fake-wait",
  "fake-pin2",
  "fake-done",
  "cake",
  "diet",
];

/** One part of an `enter` name; "a+b" names are applied part by part. */
function enterPart(s: BrowserState, part: string): { state: BrowserState; effects?: Effect<BrowserState>[] } {
  const [name, arg] = part.split(":");
  switch (name) {
    case "page":
      return { state: PAGES.includes(arg as Page) ? goTo(s, arg as Page) : s };
    case "skNotif":
      if (arg === "delayed") {
        return { state: s, effects: [{ after: SK_NOTIF_DELAY_MS, apply: (x) => ({ ...x, skNotif: true }) }] };
      }
      return { state: { ...s, skNotif: true } };
    case "skRequest": {
      const stage = arg === "pin2" ? "pin2" : "pin1";
      return { state: { ...goTo(s, stage === "pin1" ? "fake-wait" : "fake-pin2"), sk: { stage, pin: "" } } };
    }
    case "bankNotif":
      return { state: { ...s, bankNotif: true } };
    case "permNotif":
      return { state: { ...s, perm: "notif" } };
    case "permPopup":
      return { state: { ...s, perm: "popup" } };
    case "popupPrize":
      return { state: { ...s, popup: "prize" } };
    case "popupDiet":
      return { state: { ...s, popup: "diet" } };
    case "startSpam": {
      if (s.spamOn) return { state: s };
      return {
        state: addSpam({ ...s, spamOn: true, spamNext: s.spam.length }),
        effects: [{ every: SPAM_EVERY_MS, apply: addSpam }],
      };
    }
    case "stopSpam":
      return { state: { ...s, spamOn: false } };
    case "resetSpam":
      return { state: { ...s, spam: [], spamOn: false } };
    case "spamSample":
      return { state: { ...s, spam: SPAM_NOTIFICATIONS.slice(0, MAX_SPAM) } };
    case "histCake":
      return { state: { ...s, history: ["home", "res", "cake"], spam: [] } };
    default:
      return { state: s };
  }
}

export function enterBrowser(s: BrowserState, name: string): { state: BrowserState; effects?: Effect<BrowserState>[] } {
  let state = s;
  const effects: Effect<BrowserState>[] = [];
  for (const part of name.split("+")) {
    const r = enterPart(state, part);
    state = r.state;
    if (r.effects) effects.push(...r.effects);
  }
  return effects.length ? { state, effects } : { state };
}

/* ---------- touches ---------- */

export function actBrowser(s: BrowserState, action: string, data: ActData): ActResult<BrowserState> {
  if (s.kbOpen) {
    const k = keyboardAction(action, data, s.query, s.kb);
    if (k) return { state: { ...s, query: k.text, kb: k.state } };
  }
  switch (action) {
    case "searchFocus":
      return { state: { ...s, page: "search", kbOpen: true } };
    case "pickSugg":
      return { state: goTo({ ...s, history: [...s.history, "home"] }, "res") };
    case "openRes":
      return { state: goTo({ ...s, history: [...s.history, "res"] }, s.topic === "pension" ? "fake-gov" : "cake") };
    case "fgLogin":
      return { state: { ...s, page: "fake-login" } };
    case "fgSk":
      return { state: { ...s, page: "fake-id" } };
    case "fgGo":
      return { state: { ...s, page: "fake-wait" } };
    case "openSk":
      return {
        state: { ...s, skNotif: false, pinError: "", sk: { stage: s.page === "fake-pin2" ? "pin2" : "pin1", pin: "" } },
      };
    case "pad":
      return pressPad(s, data.d ?? "");
    case "allow":
      return { state: { ...s, perm: s.perm === "notif" ? "popup" : null } };
    case "adClose":
      return { state: { ...goTo({ ...s, history: [...s.history, s.page] }, "diet"), popup: "diet" } };
    case "brBack": {
      if (!s.history.length) return { state: s };
      const page = s.history[s.history.length - 1];
      return { state: goTo({ ...s, history: s.history.slice(0, -1) }, page) };
    }
    case "brHome":
      return { state: goTo(s, "home") };
    default:
      return { state: s };
  }
}

export function checkBrowser(s: BrowserState, check: NonNullable<Step["check"]>): boolean {
  if (check.kind === "queryStartsWith") return s.query.toLowerCase().startsWith(String(check.value).toLowerCase());
  if (check.kind === "page") return s.page === check.value;
  return false;
}

/** Text in the address bar. */
export function addressText(s: BrowserState): { dim?: string; text: string } {
  switch (s.page) {
    case "home":
      return { dim: "Otsi või sisesta aadress", text: "" };
    case "search":
      return { dim: "Otsing:", text: s.query };
    case "res":
      return { dim: "Otsing:", text: SUGGESTION[s.topic] };
    case "cake":
      return { text: "kook-retseptid.top/porgandikook" };
    case "diet":
      return { text: "best-slim-deals.xyz/offer?id=88231" };
    default:
      return { text: "sootsiaalkindlustusamet.com/pension/login" };
  }
}

export { CONTROL_CODE };
