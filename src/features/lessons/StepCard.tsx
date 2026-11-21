import type { CSSProperties, Ref } from "react";
import type { OS, Step } from "@/content/types";
import { BackIcon, HandIcon, InfoIcon, KeyIcon, WarnIcon } from "@/features/phone";
import { RichText } from "./RichText";
import { resolveText } from "./steps";
import styles from "./lessons.module.css";

export type StepKind = "do" | "info" | "warn";

/** do = „SINU KORD”, info = „LOE”, warn = „OHUMÄRK” (red, Küberbrauser). */
export const stepKind = (step: Step): StepKind => (step.warn ? "warn" : step.type);

const BADGE = {
  do: { icon: HandIcon, label: "SINU KORD" },
  info: { icon: InfoIcon, label: "LOE" },
  warn: { icon: WarnIcon, label: "OHUMÄRK" },
};

const DEFAULT_HINT = "Vajuta sinise ringiga märgitud kohale.";

type StepCardProps = {
  step: Step;
  os: OS;
  n: number;
  total: number;
  hint: boolean;
  /** Gesture-specific hint when the step has none (e.g. "hold longer"). */
  hintFallback?: string;
  canGoBack: boolean;
  onNext: () => void;
  onBack: () => void;
  /** On phones the yellow practice-code note is shown inside the card. */
  showPopupInside: boolean;
  /** true = in the desktop side panel, false = floating over the phone */
  inPanel: boolean;
  style?: CSSProperties;
  cardRef?: Ref<HTMLDivElement>;
};

/** The guide card for one step. */
export function StepCard(p: StepCardProps) {
  const kind = stepKind(p.step);
  const { icon: Icon, label } = BADGE[kind];
  const popup = resolveText(p.step.popup, p.os);
  // the lesson's own hint wins, then the gesture's hint, then the general one
  const hint = resolveText(p.step.hint, p.os) || p.hintFallback || DEFAULT_HINT;

  return (
    <div
      ref={p.cardRef}
      className={`${styles.card} ${styles[kind]}${p.inPanel ? ` ${styles.inPanel}` : ""}`}
      style={p.style}
      data-testid="step-card"
      role="region"
      aria-label={`Samm ${p.n}/${p.total}`}
      aria-live="polite"
    >
      <div className={styles.top}>
        <span className={styles.badge}>
          <Icon />
          {label}
        </span>
        <span className={styles.stepn}>
          {p.n}/{p.total}
        </span>
        {p.canGoBack && (
          <button type="button" className={styles.backstep} onClick={p.onBack} aria-label="Eelmine samm">
            <BackIcon />
            Tagasi
          </button>
        )}
      </div>
      {popup && p.showPopupInside && (
        <div className={styles.cpop}>
          <KeyIcon />
          <span>
            <RichText text={popup} />
          </span>
        </div>
      )}
      <div className={styles.txt}>
        <RichText text={resolveText(p.step.text, p.os)} />
      </div>
      {p.hint && kind === "do" && (
        <div className={styles.hint}>
          <RichText text={hint} />
        </div>
      )}
      {p.step.type === "info" && (
        <button type="button" className={styles.next} onClick={p.onNext}>
          Edasi →
        </button>
      )}
    </div>
  );
}

/** Yellow practice-code note shown at the top of the phone (desktop). */
export function CodePopup({ text }: { text: string }) {
  return (
    <div className={styles.popup} role="note">
      <KeyIcon />
      <div>
        <RichText text={text} />
      </div>
    </div>
  );
}
