"use client";

import { useRef, useState, type PointerEvent } from "react";
import { TopBar } from "@/components/ui";
import { RequireOs, useOs } from "@/features/os";
import {
  AppIcon,
  Keyboard,
  NavBar,
  PhoneStage,
  StatusBar,
  accentUnderFinger,
  applyKey,
  closeAccents,
  highlightAccent,
  initialKeyboard,
  openAccents,
  releaseAccents,
  type AppKey,
  type KeyboardState,
} from "@/features/phone";

/* TEMPORARY preview of the phone shell (#10) so it can be checked in the browser.
   The real Home screen house replaces this in #12 / #13. The small touch
   handler below is only for the preview – the lesson engine (#11) does this later
   with the same helper functions. */
export default function HomeScreenHousePage() {
  return (
    <RequireOs>
      <Preview />
    </RequireOs>
  );
}

const APPS: AppKey[] = ["settings", "contacts", "clock", "weather"];
const HOLD_MS = 550; // how long to hold a letter before the accent popup opens

type Typing = { text: string; kb: KeyboardState };

function Preview() {
  const { os } = useOs();
  // text and keyboard change together, so they live in one state object
  const [typing, setTyping] = useState<Typing>({ text: "", kb: initialKeyboard(os === "ios") });
  const pressed = useRef<HTMLElement | null>(null);
  const holdTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const stopTimer = () => {
    if (holdTimer.current) clearTimeout(holdTimer.current);
    holdTimer.current = null;
  };

  // 1. finger down on a key: remember it; letters with accents start the hold timer
  const down = (e: PointerEvent<HTMLDivElement>) => {
    const el = (e.target as HTMLElement).closest<HTMLElement>("[data-act]");
    pressed.current = el;
    if (!el) return;
    // keep getting move/up events even when the finger leaves the key
    e.currentTarget.setPointerCapture(e.pointerId);
    const base = el.dataset.base;
    if (base) {
      holdTimer.current = setTimeout(() => {
        setTyping((t) => ({ ...t, kb: openAccents(t.kb, base) }));
      }, HOLD_MS);
    }
  };

  // 2. finger moves: if the popup is open, highlight the letter under the finger
  const move = (e: PointerEvent<HTMLDivElement>) => {
    if (!typing.kb.acc) return;
    const letter = accentUnderFinger(e.clientX, e.clientY);
    setTyping((t) => {
      const kb = highlightAccent(t.kb, letter);
      return kb === t.kb ? t : { ...t, kb };
    });
  };

  // 3. finger lifted: popup open → type the highlighted letter and close; otherwise a normal tap
  const up = () => {
    stopTimer();
    const el = pressed.current;
    pressed.current = null;
    if (typing.kb.acc) {
      setTyping((t) => {
        const r = releaseAccents(t.text, t.kb);
        return { text: r.text, kb: r.state };
      });
      return;
    }
    if (!el) return;
    if (el.dataset.act === "key" && el.dataset.k) {
      const k = el.dataset.k;
      setTyping((t) => {
        const r = applyKey(k, t.text, t.kb);
        return { text: r.text, kb: r.state };
      });
    } else if (el.dataset.act === "emojiPick" && el.dataset.e) {
      const emoji = el.dataset.e;
      setTyping((t) => ({ ...t, text: t.text + emoji }));
    }
  };

  // finger interrupted (e.g. the browser took over the gesture): just close the popup
  const cancel = () => {
    stopTimer();
    pressed.current = null;
    setTyping((t) => ({ ...t, kb: closeAccents(t.kb) }));
  };

  const screen = (
    <div className={`ph ${os === "android" ? "wall" : "wall-ios"}`}>
      <StatusBar os={os!} light notifs={["msg", "weather", "call"]} sound />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, padding: "16px 12px" }}>
        {APPS.map((a) => (
          <AppIcon key={a} os={os!} app={a} />
        ))}
      </div>
      <div style={{ margin: "0 14px", background: "#fff", borderRadius: 20, padding: "10px 14px", minHeight: 44, fontSize: 17 }}>
        {typing.text || <span style={{ color: "#777" }}>Proovi klaviatuuri (hoia s, o, a…)</span>}
      </div>
      <div style={{ flex: 1 }} />
      <div onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={cancel}>
        <Keyboard state={typing.kb} />
      </div>
      <NavBar os={os!} dark />
    </div>
  );

  return (
    <PhoneStage
      os={os!}
      top={<TopBar title="Avaekraan – telefoni eelvaade" />}
      screen={screen}
      guide={<p style={{ fontWeight: 800 }}>Telefoni raami ja klaviatuuri eelvaade (#10).</p>}
    />
  );
}
