import type { ReactNode } from "react";
import type { House, Lesson } from "@/content/types";
import { Button, ButtonLink, HomeIcon, ListIcon } from "@/components/ui";
import { RichText } from "./RichText";
import styles from "./lessons.module.css";

/* The screens around the lessons, shown over the phone
   (prototype showList, showIntro, finishLesson, legend). */

/** Dark overlay over the phone with a white panel. */
function Overlay({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={styles.ovl}>
      <div className={`${styles.panel} ${className}`}>{children}</div>
    </div>
  );
}

/** „Vali õppetund” – „Tulekul” lessons are shown but cannot be opened. */
export function LessonList({ house, onStart }: { house: House; onStart: (index: number) => void }) {
  return (
    <Overlay>
      <h3>Vali õppetund</h3>
      {house.lessons.map((l, i) => (
        <button
          type="button"
          key={l.title}
          className={styles.lbtn}
          disabled={l.soon}
          onClick={() => onStart(i)}
          aria-label={`${i + 1}. ${l.title}${l.soon ? " (tulekul)" : ""}`}
        >
          <span className={styles.lnum}>{i + 1}</span>
          <span>
            {l.title}
            {l.soon && <small className={styles.soon}>Tulekul</small>}
          </span>
        </button>
      ))}
    </Overlay>
  );
}

/** Explanation shown before the lesson list (e.g. Küberbrauser). */
export function IntroScreen({ text, onContinue }: { text: string; onContinue: () => void }) {
  return (
    <Overlay className={styles.intro}>
      <RichText text={text} />
      <Button block onClick={onContinue}>
        Sain aru, alustan
      </Button>
    </Overlay>
  );
}

type DoneProps = {
  lesson: Lesson;
  /** Next lesson can be started (exists and is not „Tulekul”). */
  hasNext: boolean;
  onNext: () => void;
  onList: () => void;
};

/** End of a lesson: „Tubli!” – or „Peamised punktid” when the lesson has a summary. */
export function DoneScreen({ lesson, hasNext, onNext, onList }: DoneProps) {
  const summary = lesson.summary && lesson.summary.length > 0 ? lesson.summary : null;
  return (
    <Overlay className={`${styles.done}${summary ? ` ${styles.summary}` : ""}`}>
      {summary ? (
        <>
          <div className={styles.big}>Peamised punktid</div>
          <ul className={styles.sumlist}>
            {summary.map((point) => (
              <li key={point}>
                <RichText text={point} />
              </li>
            ))}
          </ul>
          <div className={styles.sumextra}>
            <b>Lisapunktid</b>
            <div>Nutiring lisab siia peagi täiendavad näpunäited.</div>
          </div>
        </>
      ) : (
        <>
          <svg className={styles.tick} viewBox="0 0 70 70" aria-hidden="true">
            <circle cx="35" cy="35" r="33" fill="#E5F6EC" />
            <path d="M20 36l10 10 20-22" fill="none" stroke="#1E8E4E" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <div className={styles.big}>Tubli!</div>
          <div>Õppetund „{lesson.title}” on läbi.</div>
        </>
      )}
      {hasNext && (
        <Button block onClick={onNext}>
          Järgmine õppetund →
        </Button>
      )}
      <Button variant="ghost" block onClick={onList}>
        <ListIcon />
        Vali teine õppetund
      </Button>
      <ButtonLink href="/kula" variant="ghost" block>
        <HomeIcon />
        Tagasi külasse
      </ButtonLink>
    </Overlay>
  );
}

/** Legend under the guide card on computers. */
export function Legend({ withWarn }: { withWarn: boolean }) {
  return (
    <div className={styles.legend}>
      <b>Kuidas õpetus töötab</b>
      <span>
        <i style={{ background: "var(--navy)" }} />
        Tumesinine kaart „SINU KORD”: tee ise, mida kaart ütleb.
      </span>
      <span>
        <i style={{ background: "#fff", border: "3px solid var(--navy)" }} />
        Valge kaart „LOE”: loe ja vajuta „Edasi”.
      </span>
      {withWarn && (
        <span>
          <i style={{ background: "#fff", border: "3px solid var(--bad)" }} />
          Punane kaart „OHUMÄRK”: see oleks pidanud sind hoiatama.
        </span>
      )}
      <span>
        <i style={{ background: "#fff", border: "3px solid var(--line)" }} />
        „Tagasi” viib ühe sammu tagasi.
      </span>
    </div>
  );
}
