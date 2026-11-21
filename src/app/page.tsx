"use client";

import { useRouter } from "next/navigation";
import { Logo } from "@/components/ui";
import { useOs } from "@/features/os";
import type { OS } from "@/content/types";
import styles from "./page.module.css";

/** Phone drawings from the prototype (viewStart → phoneSvg). */
function PhonePicture({ os }: { os: OS }) {
  if (os === "android") {
    return (
      <svg viewBox="0 0 70 110" aria-hidden="true">
        <rect x="4" y="2" width="62" height="106" rx="12" fill="#fff" stroke="#03236A" strokeWidth="4" />
        <rect x="10" y="12" width="50" height="82" rx="4" fill="#C9D8FB" />
        <circle cx="35" cy="7" r="2" fill="#03236A" />
        <path d="M22 101h6M33 101h4M42 101h6" stroke="#03236A" strokeWidth="3" strokeLinecap="round" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 70 110" aria-hidden="true">
      <rect x="4" y="2" width="62" height="106" rx="14" fill="#fff" stroke="#03236A" strokeWidth="4" />
      <rect x="10" y="8" width="50" height="94" rx="9" fill="#C9D8FB" />
      <rect x="27" y="11" width="16" height="5" rx="2.5" fill="#03236A" />
      <rect x="24" y="96" width="22" height="2.5" rx="1.2" fill="#03236A" />
    </svg>
  );
}

const CHOICES: { os: OS; name: string; hint: string }[] = [
  { os: "android", name: "Android", hint: "Samsung, Xiaomi, Pixel jt" },
  { os: "ios", name: "iPhone", hint: "Apple'i telefon" },
];

export default function StartPage() {
  const { setOs } = useOs();
  const router = useRouter();

  const choose = (os: OS) => {
    setOs(os);
    router.push("/kula");
  };

  return (
    <main className={styles.start}>
      <Logo className={styles.logo} />
      <h1 className={styles.name}>Nutiküla</h1>
      <p className={styles.tag}>Aitame sul nutitelefoniga sõbraks saada.</p>
      <h2 className={styles.question}>Millist telefoni sa kasutad?</h2>
      <div className={styles.choice}>
        {CHOICES.map((c) => (
          <button
            key={c.os}
            type="button"
            className={styles.osbtn}
            aria-label={c.name}
            onClick={() => choose(c.os)}
          >
            <PhonePicture os={c.os} />
            {c.name}
            <small>{c.hint}</small>
          </button>
        ))}
      </div>
    </main>
  );
}
