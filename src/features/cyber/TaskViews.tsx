"use client";

import { useEffect, useRef, useState } from "react";
import type { CyberTask } from "@/content/cyber";
import type { OS } from "@/content/types";
import { LockIcon, PauseIcon, PersonIcon, PlayIcon, SearchIcon, XIcon } from "./icons";
import { Sig, SignText } from "./SignText";
import styles from "./cyber.module.css";

/* The four kinds of task, each drawn inside a small phone frame (prototype `renderTask`). */

/** On iPhone the message meta line is in English, like a real iPhone. */
const IOS_META: [string, string][] = [
  ["Tekstsõnum", "Text Message"],
  ["esmaspäev", "Monday"],
  ["teisipäev", "Tuesday"],
  ["kolmapäev", "Wednesday"],
  ["neljapäev", "Thursday"],
  ["reede", "Friday"],
  ["laupäev", "Saturday"],
  ["pühapäev", "Sunday"],
  ["19. dets", "19 Dec"],
];

export function metaFor(os: OS, meta: string): string {
  if (os === "android") return meta;
  return IOS_META.reduce((m, [et, en]) => m.replace(et, en), meta);
}

function MiniPhone({ os, children }: { os: OS; children: React.ReactNode }) {
  return (
    <div className={styles.mini} data-os={os} data-testid="mini-phone">
      {children}
    </div>
  );
}

export function SmsView({ task, os }: { task: CyberTask; os: OS }) {
  return (
    <MiniPhone os={os}>
      <div className={styles.mtop}>
        <div className={styles.av}>
          <PersonIcon />
        </div>
        <div className={styles.sender}>
          <SignText text={task.from ?? ""} />
        </div>
      </div>
      <div className={styles.mbody}>
        <div className={styles.meta}>{metaFor(os, task.meta ?? "")}</div>
        <div className={styles.bubble}>
          <SignText text={task.text ?? ""} links />
        </div>
      </div>
    </MiniPhone>
  );
}

type SearchResult = {
  pick: "fake" | "real";
  sponsored: string;
  domain: string;
  url: string;
  title: string;
  description: string;
};

/* The two „coop pank” search results of the web task (fake one first, as in the prototype). */
const RESULTS: SearchResult[] = [
  {
    pick: "fake",
    sponsored: "[[3|Sponsitud]]",
    domain: "cooppank.ee",
    url: "[[1|https://cooppank.ee.rhinolodgechitwan.com]]",
    title: "Coop Pank : Avaleht - Internetipank",
    description: "Ja aidata inimestel viia ellu oma unistusi. Coop Pank aitab hoogu Eesti ettevõtetel.",
  },
  {
    pick: "real",
    sponsored: "Sponsitud",
    domain: "cooppank.ee",
    url: "[[2|https://www.cooppank.ee]]",
    title: "Coop Pank Väikelaen - Intress alates 7,9%",
    description: "Tagatiseta väikelaen kuni 25 000 €. Kiire ja lihtne.",
  },
];

type SerpViewProps = {
  os: OS;
  picked: "fake" | "real" | null;
  /** Called when a result is tapped; null while answering is not possible. */
  onPick: ((pick: "fake" | "real") => void) | null;
};

export function SerpView({ os, picked, onPick }: SerpViewProps) {
  return (
    <MiniPhone os={os}>
      <div className={styles.serp}>
        <div className={styles.searchLogo}>Otsing</div>
        <div className={styles.searchQuery}>
          <SearchIcon /> coop pank
        </div>
        {RESULTS.map((r) => (
          <button
            key={r.pick}
            type="button"
            className={`${styles.result} ${picked === r.pick ? styles.picked : ""}`}
            data-pick={r.pick}
            disabled={!onPick}
            onClick={() => onPick?.(r.pick)}
          >
            <span className={styles.sponsored}>
              <SignText text={r.sponsored} />
            </span>
            <span className={styles.domain}>{r.domain}</span>
            <span className={styles.url}>
              <SignText text={r.url} />
            </span>
            <span className={styles.resultTitle}>{r.title}</span>
            <span className={styles.description}>{r.description}</span>
          </button>
        ))}
      </div>
    </MiniPhone>
  );
}

export function BankView({ os }: { os: OS }) {
  return (
    <MiniPhone os={os}>
      <div className={styles.browser}>
        <div className={styles.address}>
          <LockIcon />
          <SignText text="[[1|https://jillniyomoto.com/seb/logon=set&3e9bdf4]]" />
        </div>
        <div className={styles.bankHead}>
          <span className={styles.bankLogo}>SEB</span>
          <span>Internetipank</span>
        </div>
        <div className={styles.bankWarning}>
          <Sig sign={2}>
            <b>Oluline sõnum!</b> Täna testime SEPA Instant süsteemi. Kui olete oma online-kontole
            sisse loginud, nõutakse meie simulatsiooni ülekannet kontole NL**BUNQ**. Tähelepanu! See
            ülekanne on lihtsalt simulatsioon ja teie kontolt raha ei võeta!
          </Sig>
        </div>
        <div className={styles.bankLogin}>
          <h4>
            <SignText text="[[3|Login sisse]]" />
          </h4>
          <div className={styles.bankLabel}>Sisestage kasutajatunnus ja valige autentimisviis</div>
          <div className={styles.bankField} />
          <div className={styles.bankGo}>Jätka</div>
        </div>
      </div>
    </MiniPhone>
  );
}

/** Length of the sample recording. The real call recordings are added later. */
export const CALL_SECONDS = 8;
const TICK_MS = 250;

type CallViewProps = {
  task: CyberTask;
  os: OS;
  /** Called once when the recording has been played to the end. */
  onPlayed: () => void;
  /** After answering: how many signs have been shown so far (a call has no text to mark). */
  signsShown?: number;
};

export function CallView({ task, os, onPlayed, signsShown = 0 }: CallViewProps) {
  const [elapsed, setElapsed] = useState(0);
  const [playing, setPlaying] = useState(false);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  const onPlayedRef = useRef(onPlayed);
  onPlayedRef.current = onPlayed;

  // Stop the timer when leaving the task.
  useEffect(() => () => {
    if (timer.current) clearInterval(timer.current);
  }, []);

  function play() {
    if (playing) return;
    setPlaying(true);
    setElapsed(0);
    let t = 0;
    timer.current = setInterval(() => {
      t += TICK_MS / 1000;
      setElapsed(Math.min(t, CALL_SECONDS));
      if (t >= CALL_SECONDS) {
        if (timer.current) clearInterval(timer.current);
        timer.current = null;
        setPlaying(false);
        onPlayedRef.current();
      }
    }, TICK_MS);
  }

  const percent = (elapsed / CALL_SECONDS) * 100;
  return (
    <MiniPhone os={os}>
      <div className={styles.callScreen}>
        <div className={styles.callAvatar}>
          <PersonIcon />
        </div>
        <div className={styles.caller}>{os === "android" ? task.caller : "Unknown Caller"}</div>
        <div className={styles.callNumber}>
          {task.num} · {os === "android" ? "kõne" : "mobile"}
        </div>
        <div className={styles.player}>
          <button type="button" onClick={play} aria-label={playing ? "Kõne mängib" : "Kuula kõnet"}>
            {playing ? <PauseIcon /> : <PlayIcon />}
          </button>
          <div
            className={styles.progressBar}
            role="progressbar"
            aria-label="Kõne kulg"
            aria-valuemin={0}
            aria-valuemax={CALL_SECONDS}
            aria-valuenow={Math.floor(elapsed)}
          >
            <i style={{ width: `${percent}%` }} />
          </div>
          <div className={styles.playTime}>0:0{Math.floor(elapsed)}</div>
        </div>
        <div className={styles.callNote}>Näidisheli. Päris kõne salvestis lisatakse hiljem.</div>
        {signsShown > 0 && (
          <ul className={styles.callSigns} aria-label="Ohumärgid kõnes">
            {task.signs.slice(0, signsShown).map((s, i) => (
              <li key={s.title} className={i === signsShown - 1 ? styles.current : undefined}>
                <XIcon />
                <span>{s.title}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </MiniPhone>
  );
}
