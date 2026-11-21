"use client";

import type { House } from "@/content/types";
import { RequireOs, useOs } from "@/features/os";
import { LessonHouse, type HouseModule } from "@/features/lessons";
import {
  AppIcon,
  Keyboard,
  NavBar,
  StatusBar,
  initialKeyboard,
  keyboardAction,
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

type DemoState = {
  text: string;
  kb: KeyboardState;
  message: string;
  bright: number;
  notif: boolean;
  /** notification panel: open, and how far the finger is pulling it right now (px) */
  shadeOpen: boolean;
  shadePull: number;
};
const APPS: AppKey[] = ["settings", "contacts", "clock", "weather"];

const demoModule: HouseModule<DemoState> = {
  initial: (os) => ({
    text: "",
    kb: initialKeyboard(os === "ios"),
    message: "",
    bright: 65,
    notif: true,
    shadeOpen: false,
    shadePull: 0,
  }),
  act: (s, action, data, os) => {
    const k = keyboardAction(action, data, s.text, s.kb);
    if (k) return { state: { ...s, text: k.text, kb: k.state, message: "" } };
    switch (action) {
      case "open":
        return { state: { ...s, message: `${t(os, "Avatud", "Opened")}: ${data.app}` }, event: `open:${data.app}` };
      case "longApp":
        return { state: { ...s, message: t(os, "Pikk vajutus!", "Long press!") } };
      case "unlock":
        return { state: { ...s, message: t(os, "Pühkisid üles!", "Swiped up!") } };
      case "dismiss":
        return { state: { ...s, notif: false } };
      case "slide":
        return { state: { ...s, bright: Number(data.v) } };
      // the engine reports how far the finger pulls the panel
      case "swipeDrag":
        return { state: { ...s, shadePull: Number(data.dy) } };
      case "swipeDragEnd":
        return { state: { ...s, shadePull: 0 } };
      case "openShade":
        return { state: { ...s, shadeOpen: true } };
      case "closeShade":
        return { state: { ...s, shadeOpen: false } };
      case "navHome":
        return { state: { ...s, message: "" }, event: "goHome" };
      default:
        return { state: s };
    }
  },
  check: (s, c) => {
    if (c.kind === "text") return s.text.trim().toLowerCase() === String(c.value);
    if (c.kind === "endsWith") return s.text.endsWith(String(c.value));
    if (c.kind === "brightChanged") return Math.abs(s.bright - 65) >= 15;
    return false;
  },
  keyboardOpen: () => true,
  render: (s, os) => (
    <div className={`ph ${os === "android" ? "wall" : "wall-ios"}`}>
      <div data-swipe="down" data-swipe-act="openShade" data-swipe-drag="">
        <StatusBar os={os} light notifs={["msg", "weather", "call"]} sound />
      </div>
      {s.notif && (
        <div
          className="demo-notif"
          data-swipe="side"
          data-swipe-act="dismiss"
          data-swipe-follow=""
          style={{ margin: "6px 12px", background: "#fff", borderRadius: 16, padding: "10px 14px", fontSize: 15, fontWeight: 600 }}
        >
          🔔 {t(os, "Teavitus – libista kõrvale", "Notification – swipe sideways")}
        </div>
      )}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, padding: "10px 12px" }}>
        {APPS.map((a) => (
          <AppIcon
            key={a}
            os={os}
            app={a}
            attrs={a === "clock" ? { "data-act": "open", "data-long": "longApp" } : { "data-act": "open" }}
          />
        ))}
      </div>
      <div className="demo-bright" style={{ margin: "4px 14px", padding: 10, background: "#3b4152", borderRadius: 16 }}>
        <div data-slide="h" style={{ height: 16, borderRadius: 8, background: "#5c6378", position: "relative" }}>
          <i style={{ position: "absolute", inset: 0, width: `${s.bright}%`, background: "#a8c7fa", borderRadius: 8 }} />
        </div>
      </div>
      <div className="demo-field" style={{ margin: "6px 14px", background: "#fff", borderRadius: 20, padding: "10px 14px", minHeight: 44, fontSize: 17 }}>
        {s.message || s.text || <span style={{ color: "#777" }}>…</span>}
      </div>
      <div
        className="demo-swipe"
        data-swipe="up"
        data-swipe-act="unlock"
        style={{ margin: "4px auto", padding: "6px 30px", color: "#fff", fontWeight: 700, fontSize: 14 }}
      >
        ↑ {t(os, "Pühi üles", "Swipe up")}
      </div>
      <div style={{ flex: 1 }} />
      <Keyboard state={s.kb} />
      <NavBar os={os} dark />
      <DemoShade os={os} open={s.shadeOpen} pull={s.shadePull} />
      {/* brightness slider really dims the screen */}
      <div style={{ position: "absolute", inset: 0, background: "#000", opacity: ((100 - s.bright) / 100) * 0.6, pointerEvents: "none" }} />
    </div>
  ),
};

/** Notification panel that slides down from the top as far as the finger pulls. */
function DemoShade({ os, open, pull }: { os: "android" | "ios"; open: boolean; pull: number }) {
  const dragging = pull !== 0;
  // closed: hidden above the screen, pulled down by `pull` px; open: in place, pushed up by `pull` px
  const transform = open ? `translateY(${Math.min(0, pull)}px)` : `translateY(calc(-100% + ${Math.max(0, pull)}px))`;
  return (
    <div
      className="demo-shade"
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        top: 0,
        height: "55%",
        zIndex: 20,
        background: "rgba(32,36,48,.95)",
        color: "#fff",
        padding: "40px 14px 0",
        display: "flex",
        flexDirection: "column",
        gap: 10,
        transform,
        transition: dragging ? "none" : "transform .25s ease",
        borderRadius: "0 0 24px 24px",
      }}
    >
      {[t(os, "Mari Tamm: Kas tuled lõunale?", "Mari Tamm: Coming to lunch?"), t(os, "Ilm: täna sajab vihma", "Weather: rain today")].map((n) => (
        <div key={n} style={{ background: "rgba(255,255,255,.95)", color: "#111", borderRadius: 16, padding: "10px 12px", fontSize: 15 }}>
          {n}
        </div>
      ))}
      <div style={{ flex: 1 }} />
      <div
        className="demo-shade-handle"
        data-swipe="up"
        data-swipe-act="closeShade"
        data-swipe-drag=""
        style={{ display: "flex", justifyContent: "center", padding: "14px 0 10px" }}
      >
        <i style={{ width: 60, height: 5, borderRadius: 3, background: "rgba(255,255,255,.7)" }} />
      </div>
    </div>
  );
}

const demoHouse: House = {
  title: "Avaekraan (proov)",
  intro:
    "<h3>Õppemootori proov</h3><p>See on <b>ajutine</b> proovimaja. Siin saad järele proovida kõik kaardid, žestid ja lõpulehed.</p><p>Päris avaekraani tunnid tulevad siia peagi.</p>",
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
        { type: "do", text: "<b>Hoia sõrme</b> Kella ikoonil umbes üks sekund.", target: "[data-app=clock]", until: "longApp" },
        { type: "do", text: "<b>Pühi üles</b> noolega kohas.", target: ".demo-swipe", until: "unlock" },
        { type: "do", text: "Pane sõrm ekraani <b>ülaserva</b> ja <b>tõmba alla</b>. Paneel liigub sõrmega kaasa.", target: ".sb", until: "openShade" },
        { type: "do", text: "Lükka paneel <b>alumisest joonest üles</b> tagasi.", target: ".demo-shade-handle", until: "closeShade" },
        { type: "do", text: "<b>Libista teavitust</b> sõrmega kõrvale.", target: ".demo-notif", until: "dismiss" },
        { type: "do", text: "<b>Lohista heledusriba</b>, et ekraan muutuks heledamaks või tumedamaks.", target: ".demo-bright", check: { kind: "brightChanged" } },
        { type: "info", warn: true, text: "See on <b>OHUMÄRK</b>-kaart (punane). Proovi ka nuppu <b>Tagasi</b>.", target: ".sb-batt" },
        {
          type: "do",
          text: "Kirjuta klaviatuuril sõna <b>tere</b>. (Arvutis võid kasutada ka päris klaviatuuri.)",
          target: ".kb",
          show: ".demo-field",
          cardAt: "top",
          popup: "Harjutus: kirjuta <b>tere</b>",
          check: { kind: "text", value: "tere" },
          hint: "Vajuta tähti t, e, r, e.",
        },
        { type: "do", text: "<b>Hoia sõrme</b> tähel <b>o</b>, kuni tuleb nähtavale väike aken.", target: "[data-base=o]", show: ".demo-field", cardAt: "top", until: "keyLong" },
        {
          type: "do",
          text: "<b>Libista sõrm</b> tähele <b>õ</b> ja lase lahti.",
          target: '.accpop [data-k="ch:õ"]',
          show: ".demo-field",
          cardAt: "top",
          check: { kind: "endsWith", value: "õ" },
          hint: "Ära tõsta sõrme üles: libista see õ peale ja alles siis lase lahti.",
        },
        { type: "do", os: "android", text: "Vajuta ringi <b>●</b>.", target: ".nav-home", until: "goHome" },
        { type: "do", os: "ios", text: "<b>Pühi alumisest joonest üles</b> (või vajuta joonele).", target: ".homeind", until: "goHome" },
        { type: "info", text: "Tubli! Kõik žestid töötavad." },
      ],
    },
    {
      title: "Kokkuvõtte proov",
      summary: [
        "Kokkuvõttelehel on tunni <b>peamised punktid</b>.",
        "All on koht kliendi <b>lisapunktidele</b>.",
        "Järgmine tund on „Tulekul”, seega nuppu <b>Järgmine õppetund</b> siin ei ole.",
      ],
      steps: [{ type: "info", text: "Selle tunni lõpus näed lehte <b>Peamised punktid</b>." }],
    },
    { title: "Tulekul tund", soon: true, steps: [] },
  ],
};
