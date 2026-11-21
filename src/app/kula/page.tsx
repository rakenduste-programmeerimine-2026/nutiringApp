"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Logo } from "@/components/ui";
import { RequireOs, useOs } from "@/features/os";
import { HouseSvg, type HouseKind } from "./HouseSvg";
import styles from "./page.module.css";

const HOUSES: { kind: HouseKind; name: string; sub: string; href: string }[] = [
  { kind: "home", name: "Avaekraan", sub: "Telefoni avamine ja nupud", href: "/maja/avaekraan" },
  { kind: "msg", name: "Sõnumid", sub: "Sõnumite kirjutamine", href: "/maja/sonumid" },
  { kind: "cyber", name: "Küberturvalisus", sub: "Kuidas kelmusi ära tunda", href: "/maja/kuber" },
  { kind: "exam", name: "Eksam", sub: "Kontrolli oma teadmisi", href: "/eksam" },
];

export default function VillagePage() {
  return (
    <RequireOs>
      <Village />
    </RequireOs>
  );
}

function Village() {
  const { os } = useOs();
  const router = useRouter();
  const rootRef = useRef<HTMLElement>(null);
  const [path, setPath] = useState<{ d: string; w: number; h: number } | null>(null);

  // Draw a winding road through the bottom of each house picture.
  useEffect(() => {
    const draw = () => {
      const root = rootRef.current;
      if (!root) return;
      const rb = root.getBoundingClientRect();
      const points = Array.from(root.querySelectorAll<SVGElement>("[data-house] svg")).map((svg) => {
        const r = svg.getBoundingClientRect();
        return [r.left - rb.left + r.width / 2, r.top - rb.top + r.height * 0.92];
      });
      if (points.length < 2) return;
      let d = `M${points[0][0]} ${points[0][1]}`;
      for (let i = 1; i < points.length; i++) {
        const [x0, y0] = points[i - 1];
        const [x1, y1] = points[i];
        const my = (y0 + y1) / 2;
        d += ` C${x0} ${my} ${x1} ${my} ${x1} ${y1}`;
      }
      setPath({ d, w: rb.width, h: rb.height });
    };
    draw();
    // Redraw whenever the village changes size (window resize, font loaded, …).
    // ResizeObserver does not exist in the test environment, so fall back to "resize".
    if (typeof ResizeObserver !== "undefined" && rootRef.current) {
      const observer = new ResizeObserver(draw);
      observer.observe(rootRef.current);
      return () => observer.disconnect();
    }
    window.addEventListener("resize", draw);
    return () => window.removeEventListener("resize", draw);
  }, []);

  return (
    <main className={styles.village} ref={rootRef}>
      <div className={styles.head}>
        <div className={styles.title}>
          <Logo className={styles.logo} />
          <span className={styles.name}>Nutiküla</span>
        </div>
        <div className={styles.chip}>
          {os === "android" ? "Android" : "iPhone"}
          <button type="button" onClick={() => router.push("/")}>
            Vaheta
          </button>
        </div>
      </div>

      <h1 className={styles.intro}>
        Tere tulemast Nutikülla!
        <small>Vali maja, mida tahad külastada</small>
      </h1>

      {path && (
        <svg className={styles.path} viewBox={`0 0 ${path.w} ${path.h}`} aria-hidden="true">
          <path d={path.d} fill="none" stroke="#F6DC8C" strokeWidth="30" strokeLinecap="round" />
          <path
            d={path.d}
            fill="none"
            stroke="#fff"
            strokeWidth="3"
            strokeDasharray="2 16"
            strokeLinecap="round"
          />
        </svg>
      )}

      <div className={styles.houses}>
        {HOUSES.map((h, i) => (
          <div key={h.kind} className={`${styles.row} ${i % 2 ? styles.right : ""}`}>
            <Link href={h.href} className={styles.house} data-house={h.kind} aria-label={h.name}>
              <HouseSvg kind={h.kind} />
              <span className={styles.houseName}>{h.name}</span>
              <span className={styles.houseSub}>{h.sub}</span>
            </Link>
          </div>
        ))}
      </div>
    </main>
  );
}
