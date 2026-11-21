import type { ReactNode } from "react";
import type { OS, Step } from "@/content/types";

/* Contract between the lesson engine and a house (Home screen #12,
   Messages #14, Küberbrauser #26).

   The phone state S is a plain value that is NEVER changed in place:
   every function returns a new state. That is what makes „‹ Tagasi” simple –
   the engine keeps each step's starting state and puts it back. */

/** A change that happens later, scheduled and cancelled by the engine. */
export type Effect<S> =
  | { after: number; apply: (state: S) => S } // once, after `after` ms
  | { every: number; apply: (state: S) => S }; // repeatedly, every `every` ms

/** The data-* attributes of the touched element, e.g. { act: "open", app: "clock" }. */
export type ActData = Record<string, string | undefined>;

export type ActResult<S> = {
  state: S;
  /** Extra lesson event this action caused, e.g. "simOk" or "open:clock". */
  event?: string;
  effects?: Effect<S>[];
};

export interface HouseModule<S> {
  /** Starting state of the phone for a lesson. */
  initial(os: OS): S;
  /** Lesson `setup` names, e.g. "sim", "chat:mari". */
  setup?(state: S, name: string, os: OS): S;
  /** Step `enter` names, e.g. "botSay:1"; may schedule delayed changes. */
  enter?(state: S, name: string, os: OS): { state: S; effects?: Effect<S>[] };
  /**
   * A tap / swipe / long press on an element with data-act (or data-long,
   * data-swipe-act, data-slide). `action` is that name, `data` all data-* attributes.
   * The action name itself also counts as an event for `until`.
   */
  act(state: S, action: string, data: ActData, os: OS): ActResult<S>;
  /** Step `check` conditions, e.g. { kind: "searchQuery", value: "kell" }. */
  check?(state: S, check: NonNullable<Step["check"]>, os: OS): boolean;
  /** Draw the phone screen. */
  render(state: S, os: OS): ReactNode;
  /** True when the on-screen keyboard is open (desktop typing goes to act "key"). */
  keyboardOpen?(state: S): boolean;
}
