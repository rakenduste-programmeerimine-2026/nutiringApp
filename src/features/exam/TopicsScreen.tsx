"use client";

import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";
import { getMyResults } from "@/app/eksam/actions";
import { HomeIcon } from "@/components/ui";
import {
  EXAM_TOPICS,
  EXAM_TOPIC_TITLES,
  type ExamTopicId,
} from "@/content/exam";
import { ChatIcon, LockIcon } from "@/features/phone";
import { ExamPage } from "./ExamPage";
import { QUESTIONS_PER_EXAM } from "./score";
import styles from "./exam.module.css";

const TOPIC_LOOK: Record<ExamTopicId, { color: string; icon: ReactNode }> = {
  home: { color: "var(--yellow)", icon: <HomeIcon /> },
  messages: { color: "var(--mint)", icon: <ChatIcon /> },
  cyber: { color: "var(--lav)", icon: <LockIcon /> },
};

/** Topic selection: Avaekraan, Sõnumid, Küberturvalisus (10 questions each). */
export function TopicsScreen() {
  const [last, setLast] = useState<Record<string, number>>({});

  useEffect(() => {
    let alive = true;
    getMyResults()
      .then((rows) => {
        if (alive)
          setLast(Object.fromEntries(rows.map((r) => [r.topic, r.score])));
      })
      .catch(() => {
        // Results are only a nice extra: the topics work without them.
      });
    return () => {
      alive = false;
    };
  }, []);

  return (
    <ExamPage title="Eksam" showLogout>
      <h1>Vali teema</h1>
      <p className={styles.lead}>
        Vali teema, mille kohta tahad eksami teha. Igas eksamis on{" "}
        {QUESTIONS_PER_EXAM} küsimust.
      </p>
      <div className={styles.topics}>
        {EXAM_TOPICS.map((topic) => (
          <Link
            key={topic}
            href={`/eksam/teemad/${topic}`}
            className={styles.topicbtn}
          >
            <span
              className={styles.ti}
              style={{ background: TOPIC_LOOK[topic].color }}
            >
              {TOPIC_LOOK[topic].icon}
            </span>
            <span>
              {EXAM_TOPIC_TITLES[topic]}
              <small>
                {QUESTIONS_PER_EXAM} küsimust
                {last[topic] !== undefined &&
                  ` · viimane tulemus ${last[topic]}/${QUESTIONS_PER_EXAM}`}
              </small>
            </span>
          </Link>
        ))}
      </div>
    </ExamPage>
  );
}
