"use client";

import type { House } from "@/content/types";
import { RequireOs, useOs } from "@/features/os";
import { LessonHouse, type HouseModule } from "@/features/lessons";
import {
  AppIcon,
  Keyboard,
  NavBar,
  StatusBar,
  applyKey,
  initialKeyboard,
  t,
  type AppKey,
  type KeyboardState,
} from "@/features/phone";

/* TEMPORARY demo of the lesson engine (#11) on top of the phone shell (#10).
   The real Home screen house (module + 9 lessons) replaces this in #12 / #13. */
export default function HomeScreenHousePage() {
  return (
    <RequireOs>
      <Demo />
    </RequireOs>
  );
}

function Demo() {
  const { os } = useOs();
  return <LessonHouse house={demoHouse} module={demoModule} os={os!} />;
}

type DemoState = { text: string; kb: KeyboardState; opened: AppKey | null };
const APPS: AppKey[] = ["settings", "contacts", "clock", "weather"];

const demoModule: HouseModule<DemoState> = {
  initial: (os) => ({ text: "", kb: initialKeyboard(os === "ios"), opened: null }),
  act: (s, action, data) => {
    if (action === "key" && data.k) {
      const r = applyKey(data.k, s.text, s.kb);
      return { state: { ...s, text: r.text, kb: r.state } };
    }
    if (action === "emojiPick" && data.e) return { state: { ...s, text: s.text + data.e } };
    if (action === "open" && data.app) return { state: { ...s, opened: data.app as AppKey }, event: `open:${data.app}` };
    if (action === "navHome") return { state: { ...s, opened: null }, event: "goHome" };
    return { state: s };
  },
  check: (s, c) => c.kind === "text" && s.text.trim().toLowerCase() === String(c.value),
  render: (s, os) => (
    <div className={`ph ${os === "android" ? "wall" : "wall-ios"}`}>
      <StatusBar os={os} light notifs={["msg", "weather", "call"]} sound />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, padding: "16px 12px" }}>
        {APPS.map((a) => (
          <AppIcon key={a} os={os} app={a} attrs={{ "data-act": "open" }} />
        ))}
      </div>
      <div className="demo-field" style={{ margin: "0 14px", background: "#fff", borderRadius: 20, padding: "10px 14px", minHeight: 44, fontSize: 17 }}>
        {s.opened ? `${t(os, "Avatud", "Opened")}: ${s.opened}` : s.text || <span style={{ color: "#777" }}>…</span>}
      </div>
      <div style={{ flex: 1 }} />
      <Keyboard state={s.kb} />
      <NavBar os={os} dark />
    </div>
  ),
};

const demoHouse: House = {
  title: "Avaekraan (proov)",
  lessons: [
    {
      title: "Õppemootori proov",
      steps: [
        { type: "info", text: "See on <b>kellaaeg</b>. LOE-kaardil vajuta <b>Edasi →</b>.", target: ".sb-time" },
        {
          type: "do",
          text: { android: "Ava rakendus <b>Seaded</b>.", ios: "Ava rakendus <b>Settings</b> (seaded)." },
          target: "[data-app=settings]",
          until: "open:settings",
          hint: "Vajuta hammasratta ikoonile.",
        },
        { type: "info", warn: true, text: "See on <b>OHUMÄRK</b>-kaart (punane). Proovi ka nuppu <b>‹ Tagasi</b>.", target: ".sb-batt" },
        {
          type: "do",
          text: "Kirjuta klaviatuuril sõna <b>tere</b>.",
          target: ".kb",
          show: ".demo-field",
          cardAt: "top",
          popup: "Harjutus: kirjuta <b>tere</b>",
          check: { kind: "text", value: "tere" },
          hint: "Vajuta tähti t, e, r, e.",
        },
        { type: "do", os: "android", text: "Vajuta ringi <b>●</b>.", target: ".nav-home", until: "goHome" },
        { type: "do", os: "ios", text: "Vajuta alumist joont.", target: ".homeind", until: "goHome" },
        { type: "info", text: "Tubli! Mootor töötab. Pikk vajutus, pühkimine ja lohistamine tulevad sammus b." },
      ],
    },
    { title: "Tulekul tund", soon: true, steps: [] },
  ],
};
