import { SCREEN_LOCK, SIM_PIN } from "@/content/lessons/home";
import type { OS } from "@/content/types";
import type { ActData, ActResult, HouseModule } from "@/features/lessons";
import { keyboardAction, pinPress, t, type AppKey, type StatusNotif } from "@/features/phone";
import { HomePhone } from "./HomePhone";
import {
  PANEL_ANIM_MS,
  START_BRIGHTNESS,
  initialHome,
  isPanel,
  openApp,
  type HomeState,
  type QuickTile,
  type Screen,
} from "./state";

/* The Home screen house for the lesson engine (prototype HOME.act).
   Event names match src/content/lessons/home.ts. */

const done = (state: HomeState, event?: string): ActResult<HomeState> => ({ state, event });

/**
 * Leave the current screen for `scr`. If a panel (notifications / quick settings)
 * was open, it stays on screen for PANEL_ANIM_MS while it slides up; the engine
 * runs the delayed change (and cancels it on „Tagasi”).
 */
function closeTo(s: HomeState, scr: Screen, event: string): ActResult<HomeState> {
  const next: HomeState = { ...s, scr, ctx: null, shadePull: 0 };
  if (!isPanel(s.scr)) return { state: next, event };
  return {
    state: { ...next, shadeClosing: s.scr === "notif" ? "notif" : "qs" },
    event,
    effects: [{ after: PANEL_ANIM_MS, apply: (x) => ({ ...x, shadeClosing: "" }) }],
  };
}

/** SIM PIN / screen lock: a key on the number pad. */
function pad(s: HomeState, key: string, os: OS): ActResult<HomeState> {
  const sim = s.scr === "sim";
  const field = sim ? "pin" : "pass";
  const code = sim ? SIM_PIN : SCREEN_LOCK;
  const wrong = t(os, "Vale kood. Proovi uuesti.", "Wrong passcode. Try again.");
  const value = s[field];

  const check = (entered: string): ActResult<HomeState> =>
    entered === code
      ? done({ ...s, [field]: "", err: "", scr: sim ? "lock" : "home" }, sim ? "simOk" : "passOk")
      : done({ ...s, [field]: "", err: wrong });

  if (key === "ok") return check(value);
  const next = pinPress(value, key, 4);
  // iPhone screen lock has no OK key: the code is checked after the 4th digit
  if (!sim && os === "ios" && next.length === 4 && next !== value) return check(next);
  return done({ ...s, [field]: next, err: "" });
}

function act(s: HomeState, action: string, data: ActData, os: OS): ActResult<HomeState> {
  // all keyboard actions (search) in one line
  const k = keyboardAction(action, data, s.q, s.kb);
  if (k) return done({ ...s, q: k.text, kb: action === "key" && data.k === "enter" ? { ...k.state, mode: "abc" } : k.state });

  switch (action) {
    case "pad":
      return pad(s, data.d ?? "", os);
    // pulls that move with the finger: the lock screen up, a panel down (or back up)
    case "swipeDrag": {
      const dy = Number(data.dy) || 0;
      if (s.scr === "lock") return done({ ...s, lockPull: dy });
      return done({ ...s, shadePull: dy });
    }
    case "swipeDragEnd":
      return done({ ...s, lockPull: 0, shadePull: 0 });
    case "unlock":
      return done({ ...s, scr: "pass", lockPull: 0 });
    case "longHome":
      return done({ ...s, scr: os === "android" ? "longmenu" : "jiggle" });
    case "closeMenu":
      return done({ ...s, scr: "home" });
    case "open": {
      const app = data.app as AppKey;
      const recents = s.recents.includes(app) ? s.recents : [...s.recents, app];
      return done({ ...s, scr: `app:${app}`, ctx: null, clockPage: "clock", recents }, `open:${app}`);
    }
    case "navHome":
      return closeTo(s, "home", "goHome");
    case "navBack":
      if (openApp(s.scr) === "clock" && s.clockPage === "alarms") return done({ ...s, clockPage: "clock" }, "backClock");
      return closeTo(s, s.scr === "search" ? "drawer" : "home", "goHome");
    case "appBack": // iPhone „‹ Clock”
      return done({ ...s, clockPage: "clock" }, "backClock");
    case "alarms":
      return done({ ...s, clockPage: "alarms" });
    case "navRecent":
    case "openRecents":
      return done({ ...s, scr: "recents" }, "recents");
    case "closeCard":
      return done({ ...s, recents: s.recents.filter((a) => a !== data.r) });
    case "openDrawer":
      return done({ ...s, scr: "drawer" });
    case "searchFocus":
      return done({ ...s, scr: "search" });
    case "openNotif":
    case "openQS": {
      // remember what was under the panel; the panel slides on top of it
      const shadeUnder = isPanel(s.scr) ? s.shadeUnder : s.scr;
      return done({ ...s, scr: action === "openNotif" ? "notif" : "qs", shadeUnder, shadeClosing: "" });
    }
    case "dismiss":
      return done({ ...s, notifs: s.notifs.filter((n) => n !== (data.n as StatusNotif)) });
    case "clearNotif":
      return done({ ...s, notifs: [] });
    case "tile": {
      const tile = data.tile as QuickTile;
      return done({ ...s, qs: { ...s.qs, [tile]: !s.qs[tile] } }, `tile:${tile}`);
    }
    case "slide":
      return done({ ...s, bright: Number(data.v) || s.bright });
    case "longApp":
      return done({ ...s, ctx: (data.app as AppKey) ?? "clock" });
    case "ctxClose":
      return done({ ...s, ctx: null });
    case "addHome": {
      const app = s.ctx ?? "clock";
      const homeApps = s.homeApps.includes(app) ? s.homeApps : [...s.homeApps, app];
      return done({ ...s, ctx: null, homeApps, scr: "home" });
    }
    default:
      return done(s);
  }
}

export const homeModule: HouseModule<HomeState> = {
  initial: () => initialHome(),

  setup(s, name) {
    if (name === "sim") return { ...s, scr: "sim" };
    if (name === "drawer") return { ...s, scr: "drawer" };
    if (name === "sb:openNotif") return { ...s, sb: "openNotif" };
    if (name === "sb:openQS") return { ...s, sb: "openQS" };
    return s;
  },

  act,

  check(s, c) {
    if (c.kind === "searchQuery") return s.q.trim().toLowerCase() === String(c.value).toLowerCase();
    if (c.kind === "brightnessChanged") return Math.abs(s.bright - START_BRIGHTNESS) >= Number(c.value ?? 15);
    return false;
  },

  keyboardOpen: (s) => s.scr === "search",

  // quick settings fill the screen with tiles: put the card at the far edge so it never covers them
  cardAt: (s) => (s.scr === "qs" ? "far" : undefined),

  render: (s, os) => <HomePhone s={s} os={os} />,
};
