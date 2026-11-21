"use client";

import { useCallback, useEffect, useLayoutEffect, useRef } from "react";
import type { House, OS } from "@/content/types";
import { Button, ListIcon, TopBar } from "@/components/ui";
import { PhoneStage } from "@/features/phone";
import { physicalKey, usePhoneGestures } from "./gestures";
import { cardPosition, highlightFrame, unionBox, type Box } from "./placement";
import { resolveText, stepNumber } from "./steps";
import { CodePopup, StepCard, stepKind } from "./StepCard";
import type { HouseModule } from "./types";
import { useLessonRunner } from "./useLessonRunner";
import { useWide } from "./useWide";
import styles from "./lessons.module.css";

type LessonHouseProps<S> = {
  house: House;
  module: HouseModule<S>;
  os: OS;
};

/** Elements in the phone screen matching a selector (bad selector → none). */
function findAll(root: HTMLElement | null, selector: string): Element[] {
  if (!root || !selector) return [];
  try {
    return Array.from(root.querySelectorAll(selector));
  } catch {
    return [];
  }
}

const boxOf = (el: Element): Box => {
  const r = el.getBoundingClientRect();
  return { left: r.left, top: r.top, right: r.right, bottom: r.bottom };
};

/**
 * A whole lesson house: top bar, phone replica and guide.
 *   <LessonHouse house={home} module={homeModule} os={os} />
 */
export function LessonHouse<S>({ house, module, os }: LessonHouseProps<S>) {
  const runner = useLessonRunner(house, module, os);
  const { run, lesson, step } = runner;
  const wide = useWide();

  const phoneRef = useRef<HTMLDivElement>(null);
  const screenRef = useRef<HTMLDivElement>(null);
  const hlRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  const targetSelector = step ? resolveText(step.target, os) : "";

  /* ---------- which touches are allowed ---------- */
  const isAllowed = (el: Element) =>
    run.mode === "run" &&
    !run.pending &&
    step?.type === "do" &&
    findAll(screenRef.current, targetSelector).some((t) => t === el || t.contains(el));

  const gestures = usePhoneGestures({
    isAllowed,
    onBlocked: runner.showHint,
    onAct: runner.act,
    expects: () => step?.until,
  });

  /* ---------- typing with the computer keyboard (desktop) ----------
     Only when the on-screen keyboard is open and the step points at it. */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (run.mode !== "run" || run.pending || step?.type !== "do") return;
      if (!module.keyboardOpen?.(run.phone)) return;
      if (e.ctrlKey || e.metaKey || e.altKey) return; // keep browser shortcuts working
      const kb = screenRef.current?.querySelector(".kb");
      const targets = findAll(screenRef.current, targetSelector);
      if (!kb || !targets.some((t) => t === kb || t.contains(kb) || kb.contains(t))) return;
      const k = physicalKey(e.key);
      if (!k) return;
      e.preventDefault();
      runner.act("key", { act: "key", k });
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  /* ---------- highlight frame + card position ---------- */
  const place = useCallback(() => {
    const phone = phoneRef.current;
    const hl = hlRef.current;
    if (!phone || !hl) return;
    const border = parseFloat(getComputedStyle(phone).borderLeftWidth) || 0;
    const pr = phone.getBoundingClientRect();
    const inner: Box = {
      left: pr.left + border,
      top: pr.top + border,
      right: pr.right - border,
      bottom: pr.bottom - border,
    };
    const showSel = step?.show ?? "";
    const els = [...findAll(screenRef.current, targetSelector), ...findAll(screenRef.current, showSel)];
    const target = unionBox(els.map(boxOf));

    if (target) {
      const f = highlightFrame(target, inner);
      Object.assign(hl.style, { left: `${f.left}px`, top: `${f.top}px`, width: `${f.width}px`, height: `${f.height}px` });
      hl.hidden = false;
    } else hl.hidden = true;

    const card = cardRef.current;
    if (card) {
      const pos = cardPosition({ target, phone: inner, cardHeight: card.offsetHeight, cardAt: step?.cardAt });
      card.style.top = pos.top !== undefined ? `${pos.top}px` : "";
      card.style.bottom = pos.bottom !== undefined ? `${pos.bottom}px` : "";
    }
  }, [step, targetSelector]);

  // after every redraw, and when the window size changes
  useLayoutEffect(() => {
    place();
  });
  useEffect(() => {
    window.addEventListener("resize", place);
    return () => window.removeEventListener("resize", place);
  }, [place]);

  /* ---------- pieces ---------- */
  const number = lesson && step ? stepNumber(lesson, run.step, os) : { n: 0, total: 0 };
  const popup = step ? resolveText(step.popup, os) : "";

  const card = (inPanel: boolean) =>
    step && (
      <StepCard
        step={step}
        os={os}
        n={number.n}
        total={number.total}
        hint={run.hint}
        hintFallback={run.hintFallback}
        canGoBack={runner.canGoBack}
        onNext={runner.next}
        onBack={runner.back}
        showPopupInside={!wide}
        inPanel={inPanel}
        cardRef={inPanel ? undefined : cardRef}
      />
    );

  // TEMPORARY simple list and end screen – the real ones come in step c
  const overlay =
    run.mode === "list" || run.mode === "intro" ? (
      <div className={styles.ovl}>
        <div className={styles.panel}>
          <h3>Vali õppetund</h3>
          {house.lessons.map((l, i) => (
            <Button key={l.title} variant="ghost" small block disabled={l.soon} onClick={() => runner.startLesson(i)}>
              {i + 1}. {l.title}
            </Button>
          ))}
        </div>
      </div>
    ) : run.mode === "done" ? (
      <div className={styles.ovl}>
        <div className={styles.panel}>
          <h3>Tubli!</h3>
          <p>Õppetund „{lesson?.title}” on läbi.</p>
          <Button block onClick={runner.showList}>
            Vali teine õppetund
          </Button>
        </div>
      </div>
    ) : null;

  const layer = (
    <>
      {run.mode === "run" && step && (
        <>
          <div ref={hlRef} className={`${styles.hl} ${styles[stepKind(step)]}`} hidden data-testid="highlight" />
          {popup && wide && <CodePopup text={popup} />}
          {!wide && card(false)}
        </>
      )}
      {overlay}
    </>
  );

  const guide =
    run.mode === "run" && lesson ? (
      <>
        <div className={styles.gtitle}>Õppetund {run.lesson + 1}</div>
        <div className={styles.gh}>{lesson.title}</div>
        {wide && card(true)}
      </>
    ) : (
      <>
        <div className={styles.gtitle}>{house.title}</div>
        <div className={styles.gh}>Vali õppetund telefoni ekraanilt.</div>
      </>
    );

  const top = (
    <TopBar title={house.title}>
      {run.mode === "run" && (
        <Button variant="ghost" small onClick={runner.showList} aria-label="Õppetunnid">
          <ListIcon />
          Õppetunnid
        </Button>
      )}
    </TopBar>
  );

  return (
    <PhoneStage
      os={os}
      top={top}
      phoneRef={phoneRef}
      screenRef={screenRef}
      screen={
        <div style={{ position: "absolute", inset: 0 }} {...gestures}>
          {module.render(run.phone, os)}
        </div>
      }
      layer={layer}
      guide={guide}
    />
  );
}
