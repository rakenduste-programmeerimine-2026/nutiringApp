"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { saveExamResult } from "@/app/eksam/actions";
import { Button, ButtonLink, HomeIcon } from "@/components/ui";
import { EXAM, EXAM_TOPIC_TITLES, type ExamTopicId } from "@/content/exam";
import { resolveText } from "@/features/lessons";
import { useOs } from "@/features/os";
import { ExamPage } from "./ExamPage";
import { QuestionImage } from "./QuestionImage";
import { resultMessage, TOPIC_HOUSE } from "./result";
import { computeScore } from "./score";
import styles from "./exam.module.css";

const LETTERS = "ABCD";

type SaveState = "saving" | "saved" | { error: string };

/** One exam: 10 questions one after another, then the result. */
export function ExamRunner({ topic }: { topic: ExamTopicId }) {
  const { os } = useOs();
  const questions = EXAM[topic];
  const title = EXAM_TOPIC_TITLES[topic];

  const [attempt, setAttempt] = useState(0);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [picked, setPicked] = useState<number | null>(null);
  const [save, setSave] = useState<SaveState>("saving");
  const savedAttempt = useRef<number | null>(null);

  const finished = answers.length === questions.length;

  // Save the result once per attempt (the ref also stops the double effect in dev mode).
  useEffect(() => {
    if (!finished || !os || savedAttempt.current === attempt) return;
    savedAttempt.current = attempt;
    setSave("saving");
    saveExamResult({ topic, os, answers })
      .then((r) => setSave(r.ok ? "saved" : { error: r.error }))
      .catch(() => setSave({ error: "Tulemuse salvestamine ei õnnestunud." }));
  }, [finished, attempt, topic, os, answers]);

  function restart() {
    setAttempt((a) => a + 1);
    setIndex(0);
    setAnswers([]);
    setPicked(null);
    setSave("saving");
  }

  if (!os) return null;

  if (finished) {
    const score = computeScore(topic, answers) ?? 0;
    const message = resultMessage(score, title);
    return (
      <ExamPage title="Eksam · Tulemus" showLogout>
        <div className={styles.score}>
          <div className={styles.scoreBig}>
            {score}/{questions.length}
          </div>
          <div className={styles.scoreOf}>õiget vastust</div>
          <div className={styles.scoreMsg}>
            {message.title}
            <div className={styles.scoreSub}>{message.text}</div>
          </div>
        </div>
        {typeof save === "object" && (
          <p className={styles.error} role="alert">
            {save.error} <Link href="/eksam/logi-sisse">Logi sisse</Link>
          </p>
        )}
        <div className={styles.stack}>
          <Button block onClick={restart}>
            Proovi uuesti
          </Button>
          <ButtonLink block variant="ghost" href="/eksam/teemad">
            Vali teine teema
          </ButtonLink>
          {message.revisitHouse && (
            <ButtonLink block variant="ghost" href={TOPIC_HOUSE[topic]}>
              Mine majja „{title}”
            </ButtonLink>
          )}
          <ButtonLink block variant="ghost" href="/kula">
            <HomeIcon />
            Tagasi külasse
          </ButtonLink>
        </div>
      </ExamPage>
    );
  }

  const q = questions[index];
  const answered = picked !== null;
  const correct = picked === q.answer;
  const last = index === questions.length - 1;

  function choose(option: number) {
    if (answered) return;
    setPicked(option);
  }

  function next() {
    if (picked === null) return;
    setAnswers((a) => [...a, picked]);
    setPicked(null);
    if (!last) setIndex((i) => i + 1);
  }

  return (
    <ExamPage title={`Eksam · ${title}`} showLogout>
      <div className={styles.qhead}>
        <span>
          Küsimus {index + 1}/{questions.length}
        </span>
        <span>{title}</span>
      </div>
      <div
        className={styles.progress}
        role="progressbar"
        aria-label="Küsimuse number"
        aria-valuemin={1}
        aria-valuemax={questions.length}
        aria-valuenow={index + 1}
      >
        {questions.map((_, i) => (
          <i key={i} className={i <= index ? styles.on : undefined} />
        ))}
      </div>
      {q.image && <QuestionImage image={q.image} os={os} />}
      <h1 className={styles.qtext}>{resolveText(q.question, os)}</h1>
      <div className={styles.opts}>
        {q.options.map((option, i) => {
          const state = !answered
            ? ""
            : i === q.answer
              ? styles.right
              : i === picked
                ? styles.wrong
                : "";
          return (
            <button
              key={i}
              type="button"
              className={`${styles.opt} ${state}`}
              disabled={answered}
              onClick={() => choose(i)}
            >
              <span className={styles.letter}>{LETTERS[i]}</span>
              {resolveText(option, os)}
            </button>
          );
        })}
      </div>
      {answered && (
        <>
          <div
            className={`${styles.fb} ${correct ? styles.fbRight : styles.fbWrong}`}
            role="status"
          >
            {correct ? "Õige!" : "Vale vastus."}{" "}
            {resolveText(q.explanation, os)}
          </div>
          <div style={{ marginTop: 16 }}>
            <Button block onClick={next}>
              {last ? "Vaata tulemust →" : "Järgmine küsimus →"}
            </Button>
          </div>
        </>
      )}
    </ExamPage>
  );
}
