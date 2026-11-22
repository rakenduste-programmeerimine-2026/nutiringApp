"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { pickTasks, taskQuestion, type CyberTask, type TaskAnswer } from "@/content/cyber";
import type { OS } from "@/content/types";
import { Button } from "@/components/ui";
import { BankView, CallView, SerpView, SmsView } from "./TaskViews";
import { TiiaFace } from "./TiiaFace";
import styles from "./cyber.module.css";

/** Where the round ends for now. The checklist and help pages come with the answer flow (#17). */
export const ROUND_END_PATH = "/maja/kuber";

type TiiaTasksProps = {
  os: OS;
  /** The four tasks of this round; picked at random when not given (tests pass fixed ones). */
  tasks?: CyberTask[];
};

/**
 * „Aita Tiiat”: Tiia shows four tasks one by one (scam SMS + real SMS in random order,
 * a web task, a call) and asks whether each one is a scam.
 */
export function TiiaTasks({ os, tasks: given }: TiiaTasksProps) {
  const router = useRouter();
  const [tasks] = useState(() => given ?? pickTasks());
  const [index, setIndex] = useState(0);
  const [played, setPlayed] = useState(false);

  const task = tasks[index];

  // Temporary until #17: an answer moves straight on to the next task.
  function answer(choice: TaskAnswer | "fake") {
    void choice;
    if (index < tasks.length - 1) {
      setIndex(index + 1);
      setPlayed(false);
      window.scrollTo?.(0, 0);
    } else {
      router.push(ROUND_END_PATH);
    }
  }

  let view;
  if (task.kind === "sms") view = <SmsView task={task} os={os} />;
  else if (task.kind === "serp") view = <SerpView os={os} picked={null} onPick={answer} />;
  else if (task.kind === "bank") view = <BankView os={os} />;
  else view = <CallView key={task.id} task={task} os={os} onPlayed={() => setPlayed(true)} />;

  let below;
  if (task.kind === "serp") {
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
          <TiiaFace mood="neutral" />
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
          <div className={styles.speech}>{taskQuestion(task, index)}</div>
        </div>
      </div>
      <div className={styles.taskView}>
        {view}
        {below}
      </div>
    </main>
  );
}
