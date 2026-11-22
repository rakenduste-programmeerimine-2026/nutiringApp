"use client";

import { createContext, Fragment, useContext, useEffect, useRef, type ReactNode } from "react";
import styles from "./cyber.module.css";

/*
 * Message texts in src/content/cyber.ts mark warning signs as [[n|text]].
 * SignText shows such a text as React elements (never as raw HTML):
 *   - each marker becomes <span data-s="n">, highlighted once the answer flow reaches sign n
 *   - web addresses are shown blue and underlined, like links in a phone
 *   - line breaks are kept
 */

/** How a sign marker looks right now. */
export type SignMark = {
  /** green (a sign of a real message) instead of red */
  ok: boolean;
  /** the sign being explained at the moment */
  current: boolean;
};

/** Which markers to highlight: ref → mark. Empty while Tiia is still asking. */
export const SignMarksContext = createContext<ReadonlyMap<number, SignMark>>(new Map());

/** One marked part of a text. */
export function Sig({ sign, children }: { sign: number; children: ReactNode }) {
  const mark = useContext(SignMarksContext).get(sign);
  const ref = useRef<HTMLSpanElement>(null);
  const isCurrent = mark?.current ?? false;

  // Bring the sign being explained into view.
  useEffect(() => {
    if (isCurrent) ref.current?.scrollIntoView?.({ block: "nearest", behavior: "smooth" });
  }, [isCurrent]);

  const classes = [
    styles.sig,
    mark && styles.shown,
    mark?.ok && styles.ok,
    mark?.current && styles.current,
  ]
    .filter(Boolean)
    .join(" ");
  return (
    <span ref={ref} className={classes} data-s={sign} data-mark={mark ? (mark.ok ? "ok" : "bad") : undefined}>
      {children}
    </span>
  );
}

const MARKER = /\[\[(\d+)\|([\s\S]*?)\]\]/g;
const URL = /((?:https?:\/\/)?(?:www\.)?[a-z0-9-]+(?:\.[a-z0-9-]+)*\.(?:ee|cc|com|info|top|xyz|id)(?:\/[^\s]*)?)/gi;

export type TextPart = { text: string; sign?: number };

/** Split a text into plain parts and sign-marked parts. */
export function parseSigns(text: string): TextPart[] {
  const parts: TextPart[] = [];
  let last = 0;
  for (const m of text.matchAll(MARKER)) {
    if (m.index > last) parts.push({ text: text.slice(last, m.index) });
    parts.push({ text: m[2], sign: Number(m[1]) });
    last = m.index + m[0].length;
  }
  if (last < text.length) parts.push({ text: text.slice(last) });
  return parts;
}

/** The text without markers, e.g. for labels. */
export function plainText(text: string): string {
  return parseSigns(text)
    .map((p) => p.text)
    .join("");
}

function withLinks(text: string, links: boolean): ReactNode[] {
  const out: ReactNode[] = [];
  text.split("\n").forEach((line, li) => {
    if (li > 0) out.push(<br key={`br${li}`} />);
    if (!links) {
      out.push(line);
      return;
    }
    line.split(URL).forEach((piece, pi) => {
      if (!piece) return;
      // split() with a capturing group puts the matches at odd positions
      out.push(
        pi % 2 === 1 ? (
          <span key={`${li}-${pi}`} className={styles.link}>
            {piece}
          </span>
        ) : (
          piece
        ),
      );
    });
  });
  return out;
}

type SignTextProps = {
  text: string;
  /** Show web addresses as links (message bodies). */
  links?: boolean;
};

export function SignText({ text, links = false }: SignTextProps) {
  return (
    <>
      {parseSigns(text).map((part, i) =>
        part.sign === undefined ? (
          <Fragment key={i}>{withLinks(part.text, links)}</Fragment>
        ) : (
          <Sig key={i} sign={part.sign}>
            {withLinks(part.text, links)}
          </Sig>
        ),
      )}
    </>
  );
}
