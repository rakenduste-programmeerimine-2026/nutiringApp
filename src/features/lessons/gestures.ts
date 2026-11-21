"use client";

import { useRef, type PointerEvent } from "react";
import type { ActData } from "./types";

/* Touch handling on the phone screen (prototype bindPhone).
   Step a: taps only. Long press, swipes, slider and the accent
   hold-and-slide follow in step b. */

/** Finger moved more than this (px) = not a tap. */
export const MOVE_TOLERANCE = 14;

/** Elements the phone screens mark as interactive. */
const INTERACTIVE = "[data-act],[data-long],[data-swipe],[data-slide]";

type GestureOptions = {
  /** Is touching this element allowed in the current step? */
  isAllowed: (el: Element) => boolean;
  /** Touch outside the allowed area. */
  onBlocked: () => void;
  /** An allowed action happened, e.g. ("open", { act: "open", app: "clock" }). */
  onAct: (action: string, data: ActData) => void;
};

/** Copy data-* attributes into a plain object (no live DOM reference). */
export const dataOf = (el: HTMLElement): ActData => ({ ...el.dataset });

export function usePhoneGestures({ isAllowed, onBlocked, onAct }: GestureOptions) {
  const press = useRef<{ el: HTMLElement; x: number; y: number } | null>(null);

  const onPointerDown = (e: PointerEvent<HTMLElement>) => {
    const target = e.target as HTMLElement;
    if (!isAllowed(target)) {
      press.current = null;
      onBlocked();
      return;
    }
    const el = target.closest<HTMLElement>(INTERACTIVE);
    press.current = el ? { el, x: e.clientX, y: e.clientY } : null;
    if (el) e.currentTarget.setPointerCapture?.(e.pointerId);
  };

  const onPointerUp = (e: PointerEvent<HTMLElement>) => {
    const p = press.current;
    press.current = null;
    if (!p) return;
    const moved = Math.hypot(e.clientX - p.x, e.clientY - p.y) > MOVE_TOLERANCE;
    if (!moved && p.el.dataset.act) onAct(p.el.dataset.act, dataOf(p.el));
  };

  const onPointerCancel = () => {
    press.current = null;
  };

  return { onPointerDown, onPointerUp, onPointerCancel };
}
