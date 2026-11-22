"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { pickTasks, taskQuestion, type CyberTask } from "@/content/cyber";
import type { OS } from "@/content/types";
import { Button } from "@/components/ui";
import { RichText } from "@/features/lessons";
import {
  isCorrect,
  isGoodSign,
  nextLabel,
  signLabel,
  signMarks,
  tiiaReply,
  verdictText,
  type Choice,
} from "./answerFlow";
import { CHECKLIST_PATH } from "./EndPages";
import { CheckIcon, XIcon } from "./icons";
import { SignMarksContext } from "./SignText";
import { BankView, CallView, SerpView, SmsView } from "./TaskViews";
import { TiiaFace, type Mood } from "./TiiaFace";
import styles from "./cyber.module.css";

/** After the four tasks: the checklist page. */
export const ROUND_END_PATH = CHECKLIST_PATH;

type TiiaTasksProps = {
  os: OS;
  /** The four tasks of this round; picked at random when not given (tests pass fixed ones). */
  tasks?: CyberTask[];
};

/** null while Tiia is asking; set once the user has answered (no retry). */
type Answered = { choice: Choice; correct: boolean; shown: number };

/**
 * „Aita Tiiat”: Tiia shows four tasks one by one (scam SMS + real SMS in random order,
 * a web task, a call). After each answer she reacts, the verdict is shown and the
 * signs are explained one by one; after the last task comes the checklist page.
 */
export function TiiaTasks({ os, tasks: given }: TiiaTasksProps) {
  const router = useRouter();
  const [tasks] = useState(() => given ?? pickTasks());
  const [index, setIndex] = useState(0);
  const [played, setPlayed] = useState(false);
  const [answered, setAnswered] = useState<Answered | null>(null);
  const verdictRef = useRef<HTMLDivElement>(null);

  const task = tasks[index];
  const marks = useMemo(
    () => (answered ? signMarks(task, answered.shown) : new Map()),
    [task, answered],
  );

  // Show the verdict right after answering.
  useEffect(() => {
    if (answered?.shown === 0) verdictRef.current?.scrollIntoView?.({ block: "center", behavior: "smooth" });
  }, [answered?.shown]);

  function answer(choice: Choice) {
    if (answered) return;
    setAnswered({ choice, correct: isCorrect(task, choice), shown: 0 });
  }

  function next() {
    if (!answered) return;
    if (answered.shown < task.signs.length - 1) {
      setAnswered({ ...answered, shown: answered.shown + 1 });
    } else if (index < tasks.length - 1) {
      setIndex(index + 1);
      setPlayed(false);
      setAnswered(null);
      window.scrollTo?.(0, 0);
    } else {
      router.push(ROUND_END_PATH);
    }
  }

  const mood: Mood = !answered ? "neutral" : answered.correct ? "happy" : "worried";
  const speech = answered ? tiiaReply(answered.correct) : taskQuestion(task, index);

  let view;
  if (task.kind === "sms") view = <SmsView task={task} os={os} />;
  else if (task.kind === "serp") {
    const picked = answered && (answered.choice === "fake" || answered.choice === "real") ? answered.choice : null;
    view = <SerpView os={os} picked={picked} onPick={answered ? null : answer} />;
  } else if (task.kind === "bank") view = <BankView os={os} />;
  else {
    view = (
      <CallView
        key={task.id}
        task={task}
        os={os}
        onPlayed={() => setPlayed(true)}
        signsShown={answered ? answered.shown + 1 : 0}
      />
    );
  }

  let below;
  if (answered) {
    const sign = task.signs[answered.shown];
    const good = isGoodSign(task, sign);
    below = (
      <>
        <div
          ref={verdictRef}
          className={`${styles.verdict} ${answered.correct ? styles.right : styles.wrong}`}
          role="status"
        >
          {answered.correct ? <CheckIcon /> : <XIcon />}
          <div>
            {answered.correct ? "Õige!" : "Vale vastus."} {verdictText(task)}
          </div>
        </div>
        <section
          className={`${styles.signCard} ${good ? styles.good : styles.bad}`}
          aria-label="Märk"
          data-tone={good ? "good" : "bad"}
        >
          <div className={styles.signLabel}>
            {signLabel(task, sign)} {answered.shown + 1}/{task.signs.length}
          </div>
          <h2 className={styles.signTitle}>{sign.title}</h2>
          <div className={styles.signBody}>
            <RichText text={sign.body} />
          </div>
          <Button block onClick={next}>
            {nextLabel(task, answered.shown, index, tasks.length)}
          </Button>
        </section>
      </>
    );
  } else if (task.kind === "serp") {
    below = <div className={styles.hint}>Vajuta tulemusele, millele Tiia peaks vajutama.</div>;
  } else if (task.kind === "call" && !played) {
    below = <div className={styles.hint}>Vajuta ▶, et kõnet kuulata.</div>;
  } else {
    const bank = task.kind === "bank";
    below = (
      <div className={styles.answers}>
        <Button className={styles.scam} onClick={() => answer("scam")}>
          {bank ? "Võlts" : "Kelmus"}
        </Button>
        <Button className={styles.safe} onClick={() => answer("safe")}>
          {bank ? "Päris" : "Pole kelmus"}
        </Button>
      </div>
    );
  }

  return (
    <main className={styles.task} data-kind={task.kind}>
      <div className={styles.character}>
        <div className={styles.face}>
          <TiiaFace mood={mood} />
        </div>
        <div className={styles.characterText}>
          <div
            className={styles.progress}
            role="progressbar"
            aria-label="Ülesanne"
            aria-valuemin={1}
            aria-valuemax={tasks.length}
            aria-valuenow={index + 1}
            aria-valuetext={`Ülesanne ${index + 1} / ${tasks.length}`}
          >
            {tasks.map((t, i) => (
              <i key={t.id} className={i <= index ? styles.on : undefined} />
            ))}
          </div>
          <div className={styles.speech} aria-live="polite">
            {speech}
          </div>
        </div>
      </div>
      <div className={styles.taskView}>
        <SignMarksContext.Provider value={marks}>{view}</SignMarksContext.Provider>
        {below}
      </div>
    </main>
  );
}
