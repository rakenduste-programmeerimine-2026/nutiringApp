import type { House, Step } from "../types";

/** Fixed Nutirobo conversation (order matters). */
export const NUTIROBO_REPLIES = [
  "Tere! Kuidas läheb?",
  "Kuidas ma sind kutsun?",
  "Väga tore sinuga tuttavaks saada! Jätkame õpetusega.",
] as const;

const info = (text: Step["text"], target?: Step["target"], extra: Partial<Step> = {}): Step => ({
  type: "info",
  text,
  ...(target ? { target } : {}),
  ...extra,
});
const act = (
  text: Step["text"],
  target: Step["target"],
  until: string | string[],
  extra: Partial<Step> = {},
): Step => ({ type: "do", text, target, until, ...extra });
const typed = (
  text: Step["text"],
  value: string,
  extra: Partial<Step> = {},
): Step => ({
  type: "do",
  text,
  target: ".kb",
  show: ".composer",
  cardAt: "top",
  check: { kind: "input", value },
  ...extra,
});

// Source: prototype „Nutiküla – Nutiring" (MSG.lessons) + client feedback 20.11.2026.
// NB: lesson 3 („õ" via long press on „o") and the new lesson 7 (reactions) follow the issue,
// their texts need client review.
export const messages: House = {
  title: "Sõnumid",
  lessons: [
    {
      title: "Vestluste nimekiri",
      steps: [
        info("See on <b>Sõnumite</b> rakendus. Siin on kõik sinu vestlused, uusim kõige ees.", ".clist"),
        info(
          "Kui vestlus on <b>paksus kirjas</b> ja selle juures on <b>sinine täpp</b>, on sulle tulnud uus lugemata sõnum.",
          "[data-c=nutirobo]",
        ),
        info("Tavalises kirjas vestlus on juba <b>loetud</b>.", "[data-c=mari]"),
        info("Paremal näed, <b>millal</b> viimane sõnum tuli.", "[data-c=mari] .tm"),
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
        info("Siia võid kirjutada <b>nime või telefoninumbri</b>.", ".to-field"),
        info("Allpool on sinu <b>kontaktid</b>. Inimese saad valida ka siit.", ".contact"),
        act("Vali kontakt <b>Tiina Lepp</b>.", "[data-contact=tiina]", "pickContact"),
        info("Vestlus Tiinaga on avatud. All kastis saad kirjutada sõnumi.", ".composer"),
      ],
    },
    {
      title: "Klaviatuuri kasutamine",
      setup: "chat:mari",
      steps: [
        act("Vajuta <b>kirjutamiskastile</b>. Avaneb klaviatuur.", ".composer-input", "focus"),
        act("<b>Suure algustähe</b> jaoks vajuta noolt ⇧.", "[data-k=shift]", "shift", {
          show: ".composer",
          cardAt: "top",
        }),
        typed("Kirjuta sõna <b>Tere</b>.", "Tere", { hint: "Vajuta tähti T, e, r, e. Kui eksid, vajuta ⌫." }),
        typed("Vajuta <b>tühikut</b>, et sõnad oleksid eraldi.", "Tere ", { target: "[data-k=space]" }),
        act(
          "Täht <b>õ</b> peidab end klahvi <b>o</b> taha. <b>Hoia sõrme</b> klahvil <b>o</b>, kuni avaneb valik.",
          "[data-k=o]",
          "longKey:o",
          { show: ".composer", cardAt: "top", hint: "Hoia sõrme all umbes üks sekund." },
        ),
        typed("Vali valikust <b>õ</b> ja kirjuta sõna <b>õhtust</b>.", "Tere õhtust", {
          hint: "Pärast õ-d vajuta tähti h, t, u, s, t.",
        }),
        act("Kui kirjutasid valesti, saad tähe <b>kustutada</b>. Vajuta klahvi ⌫.", "[data-k=bksp]", "bksp", {
          show: ".composer",
          cardAt: "top",
        }),
        typed("Kirjuta kustutatud täht <b>t</b> tagasi.", "Tere õhtust"),
        act("Numbrid ja märgid on eraldi klaviatuuril. Vajuta <b>123</b>.", "[data-k=mode123]", "mode123", {
          show: ".composer",
          cardAt: "top",
        }),
        typed("Vajuta <b>hüüumärki !</b>", "Tere õhtust!", { target: '[data-k="ch:!"]' }),
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
          { enter: "botSay", popup: NUTIROBO_REPLIES[0] },
        ),
        info("Nutirobo saatis sulle sõnumi. Vastame talle!", ".bub.in"),
        act("Vajuta <b>kirjutamiskastile</b>.", ".composer-input", "focus"),
        act(
          "Kirjuta vastus, näiteks <b>Hästi, aitäh!</b> Siis vajuta <b>saatmisnuppu</b> ➤.",
          ".kb, .send",
          "sent",
          { show: ".composer", cardAt: "top", hint: "Kirjuta midagi ja vajuta sinist noolt." },
        ),
        act(
          "Nutirobo küsib: „Kuidas ma sind kutsun?” Kirjuta <b>oma nimi</b> ja saada sõnum.",
          ".kb, .send",
          "sent",
          {
            show: ".composer",
            cardAt: "top",
            enter: "botSay",
            popup: NUTIROBO_REPLIES[1],
            hint: "Kirjuta oma nimi ja vajuta sinist noolt.",
          },
        ),
        info("Väga hea! Sa saatsid kaks sõnumit ja said vastused.", ".thread", {
          enter: "botSay",
          popup: NUTIROBO_REPLIES[2],
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
        act("Vajuta <b>mikrofoni nuppu</b>, et alustada salvestamist.", ".sendb.mic", "recStart", {
          os: "android",
        }),
        act("Vajuta <b>+ nuppu</b>.", ".plus", "attachOpen", { os: "ios" }),
        act("Vali <b>Heli</b>. Salvestamine algab kohe.", "[data-att=audio]", "recStart", { os: "ios" }),
        info(
          "Salvestamine käib. Nüüd räägi telefoni. <i>(Selles harjutuses heli tegelikult ei salvestata.)</i>",
          ".rec",
        ),
        act("Kui oled rääkinud, vajuta <b>stopp-nuppu ■</b>.", ".rec-stop", "recStop"),
        info(
          "Enne saatmist saad sõnumit <b>kuulata ▶</b>. Kui see ei meeldi, vajuta <b>prügikasti</b> ja salvesta uuesti.",
          ".rec-play, .rec-del",
        ),
        act("Vajuta <b>saatmisnuppu</b>, et häälsõnum saata.", ".rec-bar .send", "sent"),
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
        info("Emotikon on saadetud!", ".bub.out:last-of-type"),
      ],
    },
    {
      title: "Sõnumile reageerimine",
      setup: "chat:mari",
      steps: [
        info(
          "Sõnumile saad vastata ka <b>reaktsiooniga</b>, näiteks 👍 või ❤️. Nii ei pea sa midagi kirjutama.",
          ".thread",
        ),
        act("<b>Hoia sõrme</b> Mari sõnumil, kuni avaneb menüü.", "[data-last-in]", "longMsg", {
          hint: "Hoia sõrme all umbes üks sekund.",
        }),
        act("Vali üks <b>reaktsioon</b>.", ".reactions", "react"),
        info("Sõnumi juures on nüüd sinu reaktsioon. Mari näeb seda kohe.", "[data-last-in]"),
      ],
    },
    {
      title: "Pildid, kontaktid ja asukoht",
      setup: "chat:mari",
      steps: [
        info("<b>Plussi nupuga +</b> saad sõnumiga kaasa panna muid asju.", ".plus"),
        info("Plussi vajutamisel avaneb selline <b>menüü</b>.", ".plus", { enter: "attachOpen" }),
        info(
          {
            android: "<b>Galerii:</b> saada telefonis olevaid <b>pilte ja videoid</b>.",
            ios: "<b>Fotod:</b> saada telefonis olevaid <b>pilte ja videoid</b>.",
          },
          "[data-att=gallery]",
        ),
        info("<b>Kaamera:</b> tee uus pilt ja saada see kohe.", "[data-att=camera]", { os: "ios" }),
        info("<b>Kontakt:</b> saada kellegi nimi ja telefoninumber.", "[data-att=contact]"),
        info(
          "<b>Asukoht:</b> näita kaardil, kus sa praegu oled. Kasulik, kui keegi tuleb sulle järele.",
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
        act("<b>Hoia sõrme</b> sõnumil, kuni avaneb menüü.", "[data-last-in]", "longMsg", {
          hint: "Hoia sõrme all umbes üks sekund.",
        }),
        act("Vajuta <b>Kopeeri</b>.", "[data-ctx=copy]", "copy"),
        info(
          "Kood on kopeeritud. Kleepimiseks <b>hoia sõrme</b> kastil, kuhu koodi vaja on, ja vali <b>Kleebi</b>.",
          ".composer-input",
        ),
        info("<b>Tähtis!</b> Ära kunagi ütle koodi kellelegi telefonis ega saada seda kellelegi edasi."),
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
            ios: "Vajuta <b>Kustuta</b>.",
          },
          ".del-btn",
          "delAsk",
        ),
        act("Telefon küsib üle. Vajuta <b>Kustuta</b>.", ".confirm-del", "deleted", { cardAt: "bottom" }),
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
            ios: "Vali <b>Blokeeri see helistaja</b>.",
          },
          "[data-menu=block]",
          "blockAsk",
        ),
        act("Kinnita, et soovid saatja <b>blokeerida</b>.", ".confirm-block", "blocked", { cardAt: "bottom" }),
        info(
          "Saatja on blokeeritud ja ei saa sulle enam kirjutada. Kelmuste äratundmist saad harjutada majas <b>Küberturvalisus</b>.",
          ".thread",
        ),
      ],
    },
  ],
};
