"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { House, OS } from "@/content/types";
import { matchesUntil, nextVisible, prevVisible } from "./steps";
import type { ActData, Effect, HouseModule } from "./types";

/* The lesson engine's "brain" (prototype: L, startLesson, showStep, next,
   goBack, emit, checkStep). No drawing here.

   Every change goes through commit(): it stores the new run state in a ref
   (so the next action always sees the latest state) and tells React to redraw.
   All timers are kept in one place so they can be cancelled together. */

export type RunMode = "intro" | "list" | "run" | "done";

export type RunState<S> = {
  mode: RunMode;
  lesson: number;
  step: number;
  /** The phone's current state. */
  phone: S;
  /** Phone state at the start of each step – used by „‹ Tagasi”. */
  snaps: (S | undefined)[];
  /** Show the friendly hint on the card. */
  hint: boolean;
  /** Step is done and the engine is about to move on – ignore input. */
  pending: boolean;
};

/** Delays copied from the prototype (ms). */
export const DELAY = { afterEvent: 350, afterCheck: 450, alreadyDone: 600 };

export function useLessonRunner<S>(house: House, module: HouseModule<S>, os: OS) {
  const initialRun = (): RunState<S> => ({
    mode: house.intro ? "intro" : "list",
    lesson: -1,
    step: 0,
    phone: module.initial(os),
    snaps: [],
    hint: false,
    pending: false,
  });

  const [run, setRun] = useState<RunState<S>>(initialRun);
  const runRef = useRef(run);
  const commit = useCallback((r: RunState<S>) => {
    runRef.current = r;
    setRun(r);
  }, []);
  const get = () => runRef.current;

  /* ---------- timers ---------- */
  const timers = useRef(new Set<ReturnType<typeof setTimeout>>());
  const intervals = useRef(new Set<ReturnType<typeof setInterval>>());
  const clearTimers = useCallback(() => {
    timers.current.forEach(clearTimeout);
    intervals.current.forEach(clearInterval);
    timers.current.clear();
    intervals.current.clear();
  }, []);
  const later = (fn: () => void, ms: number) => {
    const t = setTimeout(() => {
      timers.current.delete(t);
      fn();
    }, ms);
    timers.current.add(t);
  };
  const schedule = (effects: Effect<S>[] | undefined) => {
    for (const e of effects ?? []) {
      const apply = () => {
        const r = get();
        if (r.mode === "run") commit({ ...r, phone: e.apply(r.phone) });
      };
      if ("after" in e) later(apply, e.after);
      else intervals.current.add(setInterval(apply, e.every));
    }
  };
  // stop everything when the page is left
  useEffect(() => clearTimers, [clearTimers]);

  /* ---------- steps ---------- */
  const lessonOf = (r: RunState<S>) => house.lessons[r.lesson];

  /** Show the first visible step at or after `index` (or finish the lesson). */
  const showStep = (r: RunState<S>, index: number) => {
    const lesson = lessonOf(r);
    const i = nextVisible(lesson, index, os);
    if (i < 0) {
      clearTimers();
      commit({ ...r, mode: "done", hint: false, pending: false });
      return;
    }
    const step = lesson.steps[i];
    const snaps = r.snaps.slice();
    snaps[i] = r.phone; // remember the phone as it was when this step started

    let phone = r.phone;
    let effects: Effect<S>[] | undefined;
    if (step.enter && module.enter) ({ state: phone, effects } = module.enter(phone, step.enter, os));

    const shown: RunState<S> = { ...r, mode: "run", step: i, phone, snaps, hint: false, pending: false };
    commit(shown);
    schedule(effects);

    // A "do" step whose condition is already true moves on by itself.
    if (step.type === "do" && step.check && module.check?.(phone, step.check, os)) {
      commit({ ...shown, pending: true });
      later(next, DELAY.alreadyDone);
    }
  };

  function next() {
    const r = get();
    if (r.mode !== "run") return;
    showStep(r, r.step + 1);
  }

  /** „‹ Tagasi”: one step back, with the phone exactly as it was then. */
  function back() {
    const r = get();
    if (r.mode !== "run") return;
    const j = prevVisible(lessonOf(r), r.step, os);
    if (j < 0) return;
    clearTimers();
    showStep({ ...r, phone: r.snaps[j] as S }, j);
  }

  function startLesson(index: number) {
    clearTimers();
    const lesson = house.lessons[index];
    if (!lesson || lesson.soon) return;
    let phone = module.initial(os);
    if (lesson.setup && module.setup) phone = module.setup(phone, lesson.setup, os);
    showStep({ mode: "run", lesson: index, step: 0, phone, snaps: [], hint: false, pending: false }, 0);
  }

  /** The user did something on the phone (already allowed by the gesture code). */
  function act(action: string, data: ActData = {}) {
    const r = get();
    if (r.mode !== "run" || r.pending) return;
    const res = module.act(r.phone, action, data, os);
    const after: RunState<S> = { ...r, phone: res.state };
    commit(after);
    schedule(res.effects);

    const step = lessonOf(r).steps[r.step];
    if (matchesUntil(step, action) || matchesUntil(step, res.event)) {
      commit({ ...after, pending: true });
      later(next, DELAY.afterEvent);
    } else if (step.type === "do" && step.check && module.check?.(res.state, step.check, os)) {
      commit({ ...after, pending: true });
      later(next, DELAY.afterCheck);
    }
  }

  /** Wrong place tapped on a "do" step: show the friendly hint. */
  function showHint() {
    const r = get();
    const step = r.mode === "run" ? lessonOf(r).steps[r.step] : undefined;
    if (step?.type === "do" && !r.pending && !r.hint) commit({ ...r, hint: true });
  }

  function showList() {
    clearTimers();
    commit({ ...get(), mode: "list", lesson: -1, hint: false, pending: false });
  }

  const lesson = run.lesson >= 0 ? house.lessons[run.lesson] : undefined;
  return {
    run,
    lesson,
    step: run.mode === "run" && lesson ? lesson.steps[run.step] : undefined,
    canGoBack: run.mode === "run" && !!lesson && prevVisible(lesson, run.step, os) >= 0,
    startLesson,
    next,
    back,
    act,
    showHint,
    showList,
  };
}

export type LessonRunner<S> = ReturnType<typeof useLessonRunner<S>>;
