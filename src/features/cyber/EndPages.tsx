"use client";

import { CHECKLIST, PHONE_NUMBERS, SCREENSHOT_HELP, VICTIM_EMAIL, VICTIM_STEPS } from "@/content/cyber";
import type { OS } from "@/content/types";
import { ButtonLink, HomeIcon } from "@/components/ui";
import { RichText } from "@/features/lessons";
import { CheckIcon } from "./icons";
import styles from "./cyber.module.css";

export const CHECKLIST_PATH = "/maja/kuber/kokkuvote";
export const VICTIM_PATH = "/maja/kuber/abi";

/** A phone with the two buttons to press for a screenshot (prototype `shotSvg`). */
export function ScreenshotPicture({ os }: { os: OS }) {
  const android = os === "android";
  const label = { fontSize: 11, fontWeight: 800, fill: "#03236A", fontFamily: "Nunito" } as const;
  return (
    <svg
      viewBox="0 0 150 230"
      role="img"
      aria-label={android ? "Kuvatõmmise nupud Android-telefonil" : "Kuvatõmmise nupud iPhone'il"}
      data-os={os}
    >
      <rect x="25" y="10" width="100" height="210" rx={android ? 14 : 18} fill="#fff" stroke="#03236A" strokeWidth="5" />
      <rect x="33" y="22" width="84" height="186" rx={android ? 6 : 12} fill="#C9D8FB" />
      {android ? (
        <>
          {/* power (1) and volume down (2) on the right */}
          <rect x="125" y="60" width="9" height="30" rx="3" fill="#E7B416" />
          <rect x="125" y="100" width="9" height="46" rx="3" fill="#03236A" />
          <rect x="125" y="122" width="9" height="24" rx="3" fill="#E7B416" />
          <text x="138" y="80" {...label}>1</text>
          <text x="138" y="140" {...label}>2</text>
        </>
      ) : (
        <>
          {/* side button (1) on the right, volume up (2) on the left */}
          <rect x="125" y="70" width="9" height="44" rx="3" fill="#E7B416" />
          <rect x="16" y="60" width="9" height="26" rx="3" fill="#E7B416" />
          <rect x="16" y="94" width="9" height="26" rx="3" fill="#03236A" />
          <text x="138" y="96" {...label}>1</text>
          <text x="4" y="78" {...label}>2</text>
        </>
      )}
      <path d="M45 60h60M45 80h50M45 100h56M45 120h44" stroke="#fff" strokeWidth="7" strokeLinecap="round" />
    </svg>
  );
}

/** „Kontrollnimekiri”: the 9 questions and how to take a screenshot of them. */
export function Checklist({ os }: { os: OS }) {
  return (
    <main className={styles.infoPage}>
      <h1>Kontrollnimekiri</h1>
      <p className={styles.lead}>
        Kui sulle tuleb ootamatu sõnum või kõne, küsi endalt need küsimused. Kui vastus on kasvõi korra
        „jah”, ole ettevaatlik!
      </p>
      <section className={styles.checklist} aria-labelledby="checklist-title">
        <h2 id="checklist-title">
          <CheckIcon />
          Kas see võib olla kelmus?
        </h2>
        <ol>
          {CHECKLIST.map((q) => (
            <li key={q}>{q}</li>
          ))}
        </ol>
      </section>
      <section className={styles.shotBox} aria-labelledby="screenshot-title">
        <ScreenshotPicture os={os} />
        <div className={styles.shotText}>
          <h2 id="screenshot-title">{SCREENSHOT_HELP.title}</h2>
          <p>{SCREENSHOT_HELP.intro}</p>
          <div className={styles.shotHow}>
            <RichText text={os === "android" ? SCREENSHOT_HELP.android : SCREENSHOT_HELP.ios} />
          </div>
          <p className={styles.shotNote}>{SCREENSHOT_HELP.computer}</p>
        </div>
      </section>
      <div className={styles.pageEnd}>
        <ButtonLink href={VICTIM_PATH} block>
          Edasi →
        </ButtonLink>
      </div>
    </main>
  );
}

/** Shows the police e-mail address in bold inside a step text. */
function withEmail(text: string) {
  const at = text.indexOf(VICTIM_EMAIL);
  if (at < 0) return text;
  return (
    <>
      {text.slice(0, at)}
      <b>{VICTIM_EMAIL}</b>
      {text.slice(at + VICTIM_EMAIL.length)}
    </>
  );
}

/** „Mis teha, kui oled petta saanud?”: 4 steps and the important phone numbers. */
export function VictimHelp() {
  return (
    <main className={styles.infoPage}>
      <h1>Mis teha, kui oled petta saanud?</h1>
      <p className={styles.lead}>
        Ära oota ega häbene. Mida kiiremini tegutsed, seda suurem on võimalus raha tagasi saada.
      </p>
      <ol className={styles.steps}>
        {VICTIM_STEPS.map((step, i) => (
          <li key={step.title} className={styles.stepBox}>
            <span className={styles.stepNumber} aria-hidden="true">
              {i + 1}
            </span>
            <div>
              <b>{step.title}</b>
              <p>{withEmail(step.body)}</p>
            </div>
          </li>
        ))}
      </ol>
      <h2 className={styles.contactsTitle}>Olulised telefoninumbrid</h2>
      <ul className={styles.contacts}>
        {PHONE_NUMBERS.map((c) => (
          <li key={c.name} className={styles.contact}>
            <div className={styles.contactName}>{c.name}</div>
            <a className={styles.contactNumber} href={`tel:${c.number.replace(/\s/g, "")}`}>
              {c.number}
            </a>
            <div className={styles.contactHours}>{c.hours}</div>
          </li>
        ))}
      </ul>
      <ButtonLink href="/kula" block>
        <HomeIcon />
        Tagasi külasse
      </ButtonLink>
    </main>
  );
}
