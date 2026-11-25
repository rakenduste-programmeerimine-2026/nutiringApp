"use client";

import { useRef, type PointerEvent } from "react";
import { accentUnderFinger } from "@/features/phone";
import type { ActData } from "./types";

/* Touch handling on the phone screen (prototype bindPhone).

   The phone screens only MARK elements; this code decides what a touch means:
     data-act="open"                 tap
     data-long="longApp"             hold ~0.55 s
     data-swipe="up|down|left|right|side" (+ data-swipe-act="unlock")   swipe
       + data-swipe-follow           the element moves with the finger (see below)
       + data-swipe-drag             the house is told how far the finger pulled
       + data-swipe-hold="name"      swipe, then pause with the finger down → "name"
                                     (iPhone: swipe up from the bottom line and pause)
     data-slide="h|v"                drag a slider; sends act "slide" { v: 5–100 }
     data-base="o" + data-long       keyboard letter: hold → accent popup, then
                                     slide the same finger onto a letter and lift

   One finger = one gesture: it starts on pointerdown (only if the step allows
   that element), follows pointermove and ends on pointerup. */

export const LONG_PRESS_MS = 550;
/** Finger moved more than this (px) = not a tap. */
export const MOVE_TOLERANCE = 14;
/** A swipe must move at least this far (px) in its direction. */
export const SWIPE_MIN = 25;

export const HINTS = {
  hold: "Hoia sõrme kauem all, umbes üks sekund.",
  swipe: "Pane sõrm ekraanile ja libista.",
};

const INTERACTIVE = "[data-act],[data-long],[data-swipe],[data-slide]";

type ActOpts = { quiet?: boolean; force?: boolean };

type GestureOptions = {
  /** Is touching this element allowed in the current step? */
  isAllowed: (el: Element) => boolean;
  /** Wrong touch → hint; optional gesture-specific text. */
  onBlocked: (fallback?: string) => void;
  /** Send an action to the house. */
  onAct: (action: string, data: ActData, opts?: ActOpts) => void;
  /** The current step's `until`, to know if a long press is expected. */
  expects: () => string | string[] | undefined;
};

/** Copy data-* attributes into a plain object (no live DOM reference). */
export const dataOf = (el: HTMLElement): ActData => ({ ...el.dataset });

/** Did the finger move in the swipe's direction? */
export function swipeMatches(dir: string, dx: number, dy: number): boolean {
  switch (dir) {
    case "up":
      return dy < -SWIPE_MIN;
    case "down":
      return dy > SWIPE_MIN;
    case "left":
      return dx < -SWIPE_MIN;
    case "right":
      return dx > SWIPE_MIN;
    case "side":
      return Math.abs(dx) > SWIPE_MIN;
    default:
      return false;
  }
}

/* ---------- swipes that move while the finger moves ----------
   data-swipe-follow  the element itself follows the finger; far enough → it
                      slides off screen and the action fires, otherwise it
                      springs back (notification, app card, lock arrow)
   data-swipe-drag    the engine reports how far the finger has pulled
                      (act "swipeDrag" { dx, dy }, then "swipeDragEnd" { done })
                      so the house can draw e.g. the notification panel
                      sliding down from the top */

/** A moving swipe needs a bit more distance than a quick one. */
export const FOLLOW_MIN = 60;
/** Swipe and then keep the finger still this long (ms) → data-swipe-hold action. */
export const SWIPE_HOLD_MS = 400;
/** Slide-off / spring-back animation (ms). */
export const SWIPE_ANIM_MS = 200;

/** How far the element may move: only along its swipe direction. */
export function swipeOffset(dir: string, dx: number, dy: number): { x: number; y: number } {
  switch (dir) {
    case "up":
      return { x: 0, y: Math.min(0, dy) };
    case "down":
      return { x: 0, y: Math.max(0, dy) };
    case "left":
      return { x: Math.min(0, dx), y: 0 };
    case "right":
      return { x: Math.max(0, dx), y: 0 };
    case "side":
      return { x: dx, y: 0 };
    default:
      return { x: 0, y: 0 };
  }
}

/** Far enough for a swipe whose element moves with the finger? */
export function followDone(dir: string, dx: number, dy: number, min = FOLLOW_MIN): boolean {
  const o = swipeOffset(dir, dx, dy);
  return Math.abs(o.x) >= min || Math.abs(o.y) >= min;
}

/** A pull (data-swipe-drag) must cover this share of the screen when done slowly… */
export const DRAG_FRACTION = 0.35;
/** …or be a quick flick: at least FOLLOW_MIN px in under this many ms (like a real phone). */
export const FLICK_MS = 250;

/**
 * Is a pull (lock screen, notification panel) done?
 * `area` = the phone screen's size along the swipe, `ms` = how long the finger was down.
 */
export function dragDone(dir: string, dx: number, dy: number, area: number, ms: number): boolean {
  if (ms < FLICK_MS && followDone(dir, dx, dy)) return true; // quick flick
  return followDone(dir, dx, dy, Math.max(FOLLOW_MIN, area * DRAG_FRACTION)); // slow pull
}

/** The user asked the system for less motion (accessibility setting). */
const reducedMotion = () =>
  typeof window !== "undefined" && !!window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

const setTransform = (el: HTMLElement, x: number, y: number, animate: boolean, opacity = "") => {
  el.style.transition = animate ? `transform ${SWIPE_ANIM_MS}ms ease-out, opacity ${SWIPE_ANIM_MS}ms ease-out` : "none";
  el.style.transform = x || y ? `translate(${x}px, ${y}px)` : "";
  el.style.opacity = opacity;
};

const clearTransform = (el: HTMLElement) => {
  el.style.transition = "";
  el.style.transform = "";
  el.style.opacity = "";
};

/** Slider value 5–100 from the finger position on the slider element. */
export function sliderValue(el: HTMLElement, x: number, y: number): number {
  const r = el.getBoundingClientRect();
  const ratio =
    el.dataset.slide === "v"
      ? (r.bottom - y) / (r.height || 1)
      : (x - r.left) / (r.width || 1);
  return Math.round(Math.max(5, Math.min(100, ratio * 100)));
}

/** Computer keyboard key → replica key id (see keyboardLogic.ts), or null. */
export function physicalKey(key: string): string | null {
  if (key === "Backspace") return "bksp";
  if (key === " ") return "space";
  if (key === "Enter") return "enter";
  if (key.length === 1) return `ch:${key}`; // letters incl. õ ä ö ü, digits, punctuation
  return null;
}

const includes = (until: string | string[] | undefined, name: string) =>
  Array.isArray(until) ? until.includes(name) : until === name;

type Press = {
  el: HTMLElement;
  x: number;
  y: number;
  timer?: ReturnType<typeof setTimeout>;
  /** long press already fired */
  longFired: boolean;
  /** accent popup open: the finger chooses a letter */
  accent: boolean;
  lastLetter: string;
  /** when the finger touched down (ms) – to tell a quick flick from a slow pull */
  t0: number;
  /** size of the phone screen (px) – a slow pull must cover part of it */
  area: { width: number; height: number };
  /** swipe-and-hold: timer + where the finger was when it started waiting */
  holdTimer?: ReturnType<typeof setTimeout>;
  hx: number;
  hy: number;
};

export function usePhoneGestures({ isAllowed, onBlocked, onAct, expects }: GestureOptions) {
  const press = useRef<Press | null>(null);

  const stopTimer = (p: Press | null) => {
    if (p?.timer) clearTimeout(p.timer);
    if (p?.holdTimer) clearTimeout(p.holdTimer);
    if (p) {
      p.timer = undefined;
      p.holdTimer = undefined;
    }
  };

  const onPointerDown = (e: PointerEvent<HTMLElement>) => {
    const target = e.target as HTMLElement;
    if (!isAllowed(target)) {
      press.current = null;
      onBlocked();
      return;
    }
    const el = target.closest<HTMLElement>(INTERACTIVE);
    if (!el) {
      press.current = null;
      return;
    }
    // keep receiving move/up for this finger even outside the element
    e.currentTarget.setPointerCapture?.(e.pointerId);
    const screenBox = e.currentTarget.getBoundingClientRect();
    const p: Press = {
      el,
      x: e.clientX,
      y: e.clientY,
      longFired: false,
      accent: false,
      lastLetter: "",
      t0: Date.now(),
      area: { width: screenBox.width, height: screenBox.height },
      hx: e.clientX,
      hy: e.clientY,
    };
    press.current = p;

    if (el.dataset.slide) {
      onAct("slide", { ...dataOf(el), v: String(sliderValue(el, e.clientX, e.clientY)) }, { quiet: true });
      return;
    }
    const long = el.dataset.long;
    if (long) {
      p.timer = setTimeout(() => {
        p.timer = undefined;
        p.longFired = true;
        // a keyboard letter with accents: from now on the finger picks a letter
        if (el.dataset.base) p.accent = true;
        onAct(long, dataOf(el));
      }, LONG_PRESS_MS);
    }
  };

  const onPointerMove = (e: PointerEvent<HTMLElement>) => {
    const p = press.current;
    if (!p) return;
    if (p.el.dataset.slide) {
      onAct("slide", { ...dataOf(p.el), v: String(sliderValue(p.el, e.clientX, e.clientY)) }, { quiet: true });
      return;
    }
    if (p.accent) {
      const letter = accentUnderFinger(e.clientX, e.clientY) ?? "";
      if (letter !== p.lastLetter) {
        p.lastLetter = letter;
        onAct("accentHover", { letter }, { force: true });
      }
      return;
    }
    const dx = e.clientX - p.x;
    const dy = e.clientY - p.y;
    // moving away cancels a long press (like on a real phone)
    if (Math.hypot(dx, dy) > MOVE_TOLERANCE && p.timer) {
      clearTimeout(p.timer);
      p.timer = undefined;
    }

    const dir = p.el.dataset.swipe;
    if (!dir) return;

    // swipe-and-hold (iPhone: swipe up from the bottom line and pause → open apps):
    // once the finger has swiped far enough, wait until it stays still for SWIPE_HOLD_MS
    const hold = p.el.dataset.swipeHold;
    if (hold && !p.longFired && swipeMatches(dir, dx, dy)) {
      const movedSinceWait = Math.hypot(e.clientX - p.hx, e.clientY - p.hy) > MOVE_TOLERANCE;
      if (!p.holdTimer || movedSinceWait) {
        if (p.holdTimer) clearTimeout(p.holdTimer);
        p.hx = e.clientX;
        p.hy = e.clientY;
        p.holdTimer = setTimeout(() => {
          p.holdTimer = undefined;
          p.longFired = true; // the release must not also count as a swipe
          onAct(hold, dataOf(p.el));
        }, SWIPE_HOLD_MS);
      }
    }
    const o = swipeOffset(dir, dx, dy);
    if (p.el.dataset.swipeFollow !== undefined) setTransform(p.el, o.x, o.y, false);
    if (p.el.dataset.swipeDrag !== undefined)
      onAct("swipeDrag", { ...dataOf(p.el), dx: String(o.x), dy: String(o.y) }, { quiet: true });
  };

  /** Finger lifted after a moving swipe: slide off + act, or spring back. */
  const finishMovingSwipe = (p: Press, dir: string, dx: number, dy: number) => {
    const el = p.el;
    const vertical = dir === "up" || dir === "down";
    // a pull (panel, lock screen) needs a real pull or a quick flick; a following element needs FOLLOW_MIN
    const done =
      el.dataset.swipeDrag !== undefined
        ? dragDone(dir, dx, dy, vertical ? p.area.height : p.area.width, Date.now() - p.t0)
        : followDone(dir, dx, dy);
    const action = el.dataset.swipeAct || el.dataset.act || "";
    const data = dataOf(el);

    if (el.dataset.swipeDrag !== undefined) onAct("swipeDragEnd", { ...data, done: done ? "1" : "0" }, { quiet: true });

    if (el.dataset.swipeFollow === undefined) {
      if (done) onAct(action, data);
      return;
    }
    const still = reducedMotion();
    if (!done) {
      // spring back to the start
      setTransform(el, 0, 0, !still);
      setTimeout(() => clearTransform(el), still ? 0 : SWIPE_ANIM_MS);
      return;
    }
    // slide off in the swipe direction, then act
    const o = swipeOffset(dir, dx, dy);
    const far = Math.max(window.innerWidth, window.innerHeight);
    const x = o.x === 0 ? 0 : Math.sign(o.x) * far;
    const y = o.y === 0 ? 0 : Math.sign(o.y) * far;
    const fire = () => {
      onAct(action, data);
      clearTransform(el); // if the element stays on screen, put it back in place
    };
    if (still) return fire();
    setTransform(el, x, y, true, "0");
    setTimeout(fire, SWIPE_ANIM_MS);
  };

  const onPointerUp = (e: PointerEvent<HTMLElement>) => {
    const p = press.current;
    press.current = null;
    if (!p) return;
    stopTimer(p);
    const el = p.el;

    if (el.dataset.slide) {
      onAct("slide", { ...dataOf(el), v: String(sliderValue(el, e.clientX, e.clientY)) });
      return;
    }
    if (p.accent) {
      onAct("accentRelease", {}, { force: true });
      return;
    }
    if (p.longFired) return;

    const dx = e.clientX - p.x;
    const dy = e.clientY - p.y;
    const moved = Math.hypot(dx, dy) > MOVE_TOLERANCE;
    const swipe = el.dataset.swipe;

    const moving = el.dataset.swipeFollow !== undefined || el.dataset.swipeDrag !== undefined;
    if (swipe && moving && (moved || el.style.transform)) return finishMovingSwipe(p, swipe, dx, dy);
    if (swipe && moved) {
      if (swipeMatches(swipe, dx, dy)) onAct(el.dataset.swipeAct || el.dataset.act || "", dataOf(el));
      return;
    }
    if (moved) return;

    // a short tap where the step expects a long press → hint, don't act
    if (el.dataset.long && includes(expects(), el.dataset.long)) return onBlocked(HINTS.hold);
    if (el.dataset.act) return onAct(el.dataset.act, dataOf(el));
    // tapped something that only reacts to holding or swiping
    if (el.dataset.long) return onBlocked(HINTS.hold);
    if (swipe) return onBlocked(HINTS.swipe);
  };

  const onPointerCancel = () => {
    const p = press.current;
    press.current = null;
    stopTimer(p);
    if (p?.accent) onAct("accentRelease", {}, { force: true });
    // an interrupted moving swipe goes back to the start
    if (p?.el.dataset.swipeFollow !== undefined) clearTransform(p.el);
    if (p?.el.dataset.swipeDrag !== undefined) onAct("swipeDragEnd", { ...dataOf(p.el), done: "0" }, { quiet: true });
  };

  return { onPointerDown, onPointerMove, onPointerUp, onPointerCancel };
}
