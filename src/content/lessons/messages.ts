import type { House, Step, Text } from "../types";

/**
 * Fixed Nutirobo conversation. A step with `enter: "botSay:<index>"` makes Nutirobo
 * send NUTIROBO_REPLIES[index] when the step starts.
 */
export const NUTIROBO_REPLIES = [
  "Tere! Kuidas läheb?",
  "Kuidas ma sind kutsun?",
  "Väga tore sinuga tuttavaks saada! Jätkame õpetusega.",
] as const;


const info = (text: Text, target?: Text, extra: Partial<Step> = {}): Step => ({
  type: "info",
  text,
  ...(target ? { target } : {}),
  ...extra,
});
const act = (
  text: Text,
  target: Text,
  until: string | string[],
  extra: Partial<Step> = {},
): Step => ({ type: "do", text, target, until, ...extra });
/** Keyboard step: card on top so the text field stays visible. */
const kb = (
  text: Text,
  target: Text,
  done: { until: string } | { input: string },
  extra: Partial<Step> = {},
): Step => ({
  type: "do",
  text,
  target,
  show: ".composer",
  cardAt: "top",
  ...("until" in done
    ? { until: done.until }
    : { check: { kind: "input", value: done.input } }),
  ...extra,
});

// Source: prototype „Nutiküla – Nutiring" (MSG.lessons), version 20.11.2026.
export const messages: House = {
  title: "Sõnumid",
  lessons: [
    {
      title: "Vestluste nimekiri",
      steps: [
        info(
          "See on <b>Sõnumite</b> rakendus. Siin on kõik sinu vestlused, uusim kõige ees.",
          ".clist",
        ),
        info(
          "Kui vestlus on <b>paksus kirjas</b> ja selle juures on <b>sinine täpp</b>, on sulle tulnud uus lugemata sõnum.",
          "[data-c=nutirobo]",
        ),
        info(
          "Tavalises kirjas vestlus on juba <b>loetud</b>.",
          "[data-c=mari]",
        ),
        info(
          "Paremal näed, <b>millal</b> viimane sõnum tuli.",
          "[data-c=mari] .tm",
        ),
        info("Selle nupuga alustad <b>uut vestlust</b>.", ".compose"),
      ],
    },
    {
      title: "Uue vestluse alustamine",
      steps: [
        act(
          {
            android: "Vajuta nupule <b>Alusta vestlust</b>.",
            ios: "Vajuta üleval paremal <b>uue sõnumi nupule</b> ✎.",
          },
          ".compose",
          "compose",
        ),
        info(
          "Siia võid kirjutada <b>nime või telefoninumbri</b>.",
          ".to-field",
        ),
        info(
          "Allpool on sinu <b>kontaktid</b>. Inimese saad valida ka siit.",
          ".contact",
        ),
        act(
          "Vali kontakt <b>Tiina Lepp</b>.",
          "[data-contact=tiina]",
          "pickContact",
        ),
        info(
          "Vestlus Tiinaga on avatud. All kastis saad kirjutada sõnumi.",
          ".composer",
        ),
      ],
    },
    {
      title: "Klaviatuuri kasutamine",
      setup: "chat:mari",
      steps: [
        act(
          "Vajuta <b>kirjutamiskastile</b>. Avaneb klaviatuur.",
          ".composer-input",
          "focus",
        ),
        kb("<b>Suure algustähe</b> jaoks vajuta noolt ⇧.", "[data-k=shift]", {
          until: "shift",
        }),
        kb(
          "Kirjuta sõna <b>Tere</b>.",
          ".kb",
          { input: "Tere" },
          {
            hint: "Vajuta tähti T, e, r, e. Kui eksid, vajuta ⌫.",
          },
        ),
        kb(
          "Vajuta <b>tühikut</b>, et sõnad oleksid eraldi.",
          "[data-k=space]",
          { input: "Tere " },
        ),
        {
          type: "info",
          target: ".kb",
          show: ".composer",
          cardAt: "top",
          text: "Nüüd kirjutame <b>õhtust</b>. Klaviatuuril ei ole eraldi tähti <b>õ, ä, ö, ü</b>. Need saad, kui <b>hoiad sõrme</b> tähe <b>o, a</b> või <b>u</b> peal.",
        },
        kb(
          "<b>Hoia sõrme</b> tähel <b>o</b>, kuni tuleb nähtavale väike aken.",
          "[data-base=o]",
          { until: "keyLong" },
          { hint: "Hoia sõrme o-tähel umbes üks sekund." },
        ),
        kb("Vali aknast täht <b>õ</b>.", '.accpop [data-k="ch:õ"]', {
          input: "Tere õ",
        }),
        kb(
          "Kirjuta edasi: <b>htust</b>.",
          ".kb",
          { input: "Tere õhtust" },
          {
            hint: "Vajuta tähti h, t, u, s, t.",
          },
        ),
        kb(
          "Kui kirjutasid valesti, saad tähe <b>kustutada</b>. Vajuta klahvi ⌫.",
          "[data-k=bksp]",
          { until: "bksp" },
        ),
        kb("Kirjuta kustutatud täht <b>t</b> tagasi.", ".kb", {
          input: "Tere õhtust",
        }),
        kb(
          "Numbrid ja märgid on eraldi klaviatuuril. Vajuta <b>123</b>.",
          "[data-k=mode123]",
          { until: "mode123" },
        ),
        kb("Vajuta <b>hüüumärki !</b>", '[data-k="ch:!"]', {
          input: "Tere õhtust!",
        }),
        info(
          "Tubli! Kirjutasid „<b>Tere õhtust!</b>”. Tähtede juurde saad tagasi nupuga <b>ABC</b>.",
          ".composer-input",
        ),
      ],
    },
    {
      title: "Sõnumi saatmine ja vastamine",
      setup: "chat:nutirobo:empty",
      steps: [
        info(
          "See on vestlus <b>Nutirobo</b>ga. Nutirobo on sinu harjutussõber.",
          ".chathead",
          { enter: "botSay:0" },
        ),
        info("Nutirobo saatis sulle sõnumi. Vastame talle!", ".bub.in"),
        act("Vajuta <b>kirjutamiskastile</b>.", ".composer-input", "focus"),
        kb(
          "Kirjuta vastus, näiteks <b>Hästi, aitäh!</b> Siis vajuta <b>saatmisnuppu</b> ➤.",
          ".kb, .send",
          { until: "sent" },
          { hint: "Kirjuta midagi ja vajuta sinist noolt." },
        ),
        kb(
          "Nutirobo küsib, <b>kuidas sind kutsuda</b>. Kirjuta oma nimi või hüüdnimi ja saada sõnum.",
          ".kb, .send",
          { until: "sent" },
          { enter: "botSay:1", hint: "Kirjuta nimi ja vajuta sinist noolt." },
        ),
        info("Väga hea! Sa saatsid kaks sõnumit ja said vastused.", ".thread", {
          enter: "botSay:2",
        }),
      ],
    },
    {
      title: "Häälsõnum",
      setup: "chat:mari",
      steps: [
        info(
          "<b>Häälsõnum</b> on lühike helisalvestis. Kirjutamise asemel saad oma sõnumi lihtsalt öelda.",
          ".composer",
        ),
        act(
          "Vajuta <b>mikrofoni nuppu</b>, et alustada salvestamist.",
          ".sendb.mic",
          "recStart",
          {
            os: "android",
          },
        ),
        act("Vajuta <b>+ nuppu</b>.", ".plus", "attachOpen", { os: "ios" }),
        act(
          "Vali <b>Audio</b> (heli). Salvestamine algab kohe.",
          "[data-att=audio]",
          "recStart",
          { os: "ios" },
        ),
        info(
          "Salvestamine käib. Nüüd räägi telefoni. <i>(Selles harjutuses heli tegelikult ei salvestata.)</i>",
          ".rec",
        ),
        act(
          "Kui oled rääkinud, vajuta <b>stopp-nuppu ■</b>.",
          ".rec-stop",
          "recStop",
        ),
        info(
          "Enne saatmist saad sõnumit <b>kuulata ▶</b>. Kui see ei meeldi, vajuta <b>prügikasti</b> ja salvesta uuesti.",
          ".rec-play, .rec-del",
        ),
        act(
          "Vajuta <b>saatmisnuppu</b>, et häälsõnum saata.",
          ".rec-bar .send",
          "sent",
        ),
        info("Häälsõnum on saadetud! Mari saab seda kuulata.", ".bub.voice"),
      ],
    },
    {
      title: "Emotikoni lisamine",
      setup: "chat:mari:kb",
      steps: [
        info(
          "<b>Emotikonid</b> on väikesed pildid, näiteks 😊 või 👍. Nendega saad näidata oma tundeid.",
          ".composer-input",
        ),
        act(
          {
            android: "Vajuta kirjutamiskastis <b>naerunäo</b> nupule.",
            ios: "Vajuta klaviatuuril <b>naerunäo</b> klahvile.",
          },
          { android: ".emoji-btn", ios: "[data-k=emoji]" },
          "emojiOpen",
        ),
        act("Vali üks <b>emotikon</b>.", ".emojigrid", "emojiPick"),
        act("Vajuta <b>saatmisnuppu</b>.", ".send", "sent"),
        info("Emotikon on saadetud!", ".thread > .bub.out:last-of-type"),
      ],
    },
    {
      title: "Sõnumile reageerimine",
      setup: "chat:mari",
      steps: [
        info(
          "Sõnumile saad vastata ka ilma kirjutamata: lisa sellele <b>reaktsioon</b>, näiteks 👍 või ❤️.",
          ".bub.in",
        ),
        act(
          "<b>Hoia sõrme</b> Mari sõnumil, kuni avaneb menüü.",
          "[data-last-in]",
          "longMsg",
          {
            hint: "Hoia sõrme sõnumil umbes üks sekund.",
          },
        ),
        info(
          "Üleval on <b>reaktsioonid</b>. All on teised valikud, näiteks kopeerimine.",
          ".reactbar",
        ),
        act("Vali üks reaktsioon, näiteks <b>👍</b>.", ".reactbar", "react"),
        info(
          "Reaktsioon on lisatud sõnumi külge. Mari näeb, et sa sõnumit lugesid ja sellele reageerisid.",
          ".bub.in.hasr",
        ),
      ],
    },
    {
      title: "Pildid, kontaktid ja asukoht",
      setup: "chat:mari",
      steps: [
        info(
          "<b>Plussi nupuga +</b> saad sõnumiga kaasa panna muid asju.",
          ".plus",
        ),
        info("Plussi vajutamisel avaneb selline <b>menüü</b>.", ".plus", {
          enter: "attachOpen",
        }),
        info(
          {
            android:
              "<b>Galerii:</b> saada telefonis olevaid <b>pilte ja videoid</b>.",
            ios: "<b>Photos (fotod):</b> saada telefonis olevaid <b>pilte ja videoid</b>.",
          },
          "[data-att=gallery]",
        ),
        info(
          "<b>Camera</b> (kaamera): tee uus pilt ja saada see kohe.",
          "[data-att=camera]",
          {
            os: "ios",
          },
        ),
        info(
          {
            android: "<b>Kontakt:</b> saada kellegi nimi ja telefoninumber.",
            ios: "<b>Contact (kontakt):</b> saada kellegi nimi ja telefoninumber.",
          },
          "[data-att=contact]",
        ),
        info(
          {
            android:
              "<b>Asukoht:</b> näita kaardil, kus sa praegu oled. Kasulik, kui keegi tuleb sulle järele.",
            ios: "<b>Location (asukoht):</b> näita kaardil, kus sa praegu oled. Kasulik, kui keegi tuleb sulle järele.",
          },
          "[data-att=location]",
        ),
      ],
    },
    {
      title: "Koodi kopeerimine sõnumist",
      setup: "chat:kood",
      steps: [
        info(
          "Sulle saadeti <b>kinnituskood</b>. Selliseid koode küsitakse näiteks e-poes sisse logides.",
          ".bub.in",
        ),
        act(
          "<b>Hoia sõrme</b> sõnumil, kuni avaneb menüü.",
          "[data-last-in]",
          "longMsg",
          {
            hint: "Hoia sõrme all umbes üks sekund.",
          },
        ),
        act(
          {
            android: "Vajuta <b>Kopeeri</b>.",
            ios: "Vajuta <b>Copy</b> (kopeeri).",
          },
          "[data-ctx=copy]",
          "copy",
        ),
        info(
          {
            android:
              "Kood on kopeeritud. Kleepimiseks <b>hoia sõrme</b> kastil, kuhu koodi vaja on, ja vali <b>Kleebi</b>.",
            ios: "Kood on kopeeritud. Kleepimiseks <b>hoia sõrme</b> kastil, kuhu koodi vaja on, ja vali <b>Paste</b>.",
          },
          ".composer-input",
        ),
        info(
          "<b>Tähtis!</b> Ära kunagi ütle koodi kellelegi telefonis ega saada seda kellelegi edasi.",
        ),
      ],
    },
    {
      title: "Vestluse kustutamine",
      steps: [
        act(
          "<b>Hoia sõrme</b> Jaan Kase vestlusel, kuni see on valitud.",
          "[data-c=jaan]",
          "longConv",
          { hint: "Hoia sõrme all umbes üks sekund." },
        ),
        act(
          {
            android: "Vajuta üleval <b>prügikasti</b> nupule.",
            ios: "Vajuta <b>Delete</b> (kustuta).",
          },
          ".del-btn",
          "delAsk",
        ),
        act(
          {
            android: "Telefon küsib üle. Vajuta <b>Kustuta</b>.",
            ios: "Telefon küsib üle. Vajuta <b>Delete</b>.",
          },
          ".confirm-del",
          "deleted",
          { cardAt: "bottom" },
        ),
        info("Vestlus on kustutatud.", ".clist"),
      ],
    },
    {
      title: "Saatja blokeerimine",
      setup: "chat:spam",
      steps: [
        info(
          "See sõnum tuli <b>tundmatult välismaa numbrilt</b> ja selles on kahtlane link. Ära vajuta lingile!",
          ".bub.in",
        ),
        act(
          {
            android: "Vajuta üleval paremal <b>kolme täppi ⋮</b>.",
            ios: "Vajuta üleval saatja <b>numbrile</b>.",
          },
          { android: ".more-btn", ios: ".chat-head-name" },
          "chatMenu",
        ),
        act(
          {
            android: "Vali <b>Blokeeri ja teata rämpspostist</b>.",
            ios: "Vali <b>Block this Caller</b> (blokeeri see helistaja).",
          },
          "[data-menu=block]",
          "blockAsk",
        ),
        act(
          "Kinnita, et soovid saatja <b>blokeerida</b>.",
          ".confirm-block",
          "blocked",
          { cardAt: "bottom" },
        ),
        info(
          "Saatja on blokeeritud ja ei saa sulle enam kirjutada. Kelmuste äratundmist saad harjutada majas <b>Küberturvalisus</b>.",
          ".thread",
        ),
      ],
    },
  ],
};
