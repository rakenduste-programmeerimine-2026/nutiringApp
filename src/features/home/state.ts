import { initialKeyboard, type AppKey, type KeyboardState, type StatusNotif } from "@/features/phone";

/* State of the Home screen phone replica (prototype object P).
   Never changed in place – the module always returns a new object. */

export type Screen =
  | "sim" // SIM PIN
  | "lock" // lock screen
  | "pass" // screen lock code
  | "home"
  | "longmenu" // Android: long press menu on the home screen
  | "jiggle" // iPhone: edit mode (icons jiggle)
  | "drawer" // all apps (Android) / App Library (iOS)
  | "search" // app search with keyboard
  | "notif" // notification panel
  | "qs" // quick settings / Control Center
  | "recents" // open apps
  | `app:${AppKey}`; // an opened app

export type QuickTile = "wifi" | "data" | "torch" | "silent" | "rotate" | "plane";

export type HomeState = {
  scr: Screen;
  pin: string; // SIM PIN being typed
  pass: string; // screen lock code being typed
  err: string; // wrong code message
  homeApps: AppKey[];
  dockApps: AppKey[];
  notifs: StatusNotif[]; // in arrival order: msg, weather, call
  qs: Record<QuickTile, boolean>;
  bright: number; // 5–100, 65 = start
  q: string; // app search text
  kb: KeyboardState;
  /** context menu after holding an app in the drawer */
  ctx: AppKey | null;
  /** which panel a swipe down on the status bar opens in this lesson */
  sb: "" | "openNotif" | "openQS";
  clockPage: "clock" | "alarms";
  recents: AppKey[]; // open apps
  /** how far the finger is pulling the lock screen up right now (px, ≤ 0) */
  lockPull: number;
  /** notification / quick settings panel: how far the finger pulls it right now (px) */
  shadePull: number;
  /** the screen under the open panel (where it was pulled down from) */
  shadeUnder: Screen;
  /** the panel is sliding up after closing (kept on screen for the animation) */
  shadeClosing: "" | "notif" | "qs";
};

/** Is this screen one of the pull-down panels? */
export const isPanel = (scr: Screen) => scr === "notif" || scr === "qs";

/** How long the panel takes to slide open / closed (ms). */
export const PANEL_ANIM_MS = 250;

export const START_BRIGHTNESS = 65;

export const initialHome = (emojiKey = false): HomeState => ({
  scr: "home",
  pin: "",
  pass: "",
  err: "",
  homeApps: ["settings", "contacts"],
  dockApps: ["phone", "messages", "browser", "camera"],
  notifs: ["msg", "weather", "call"],
  qs: { wifi: true, data: true, torch: false, silent: false, rotate: false, plane: false },
  bright: START_BRIGHTNESS,
  q: "",
  kb: initialKeyboard(emojiKey),
  ctx: null,
  sb: "",
  clockPage: "clock",
  recents: ["browser"],
  lockPull: 0,
  shadePull: 0,
  shadeUnder: "home",
  shadeClosing: "",
});

/** The app on screen, if the screen is an opened app. */
export const openApp = (scr: Screen): AppKey | null => (scr.startsWith("app:") ? (scr.slice(4) as AppKey) : null);
