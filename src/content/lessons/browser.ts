import type { House, Step } from "../types";

/** Practice codes and amounts for the Küberbrauser room (all invented). */
export const SMART_KOOD_PIN1 = "1357";
export const SMART_KOOD_PIN2 = "24680";
export const CONTROL_CODE = "4821";
export const PAYMENT = {
  amount: 1250,
  currency: "€",
  to: "Kiirlaen Invest OÜ",
} as const;

/** Invented site names – no real organisations. */
export const SITES = {
  fakeGov: "sootsiaalkindlustusamet.com",
  realGov: "sotsiaalamet.ee",
  bank: "NutiBank",
  smartId: "Smart-KOOD",
  recipes: "kook-retseptid.top",
  spam: "best-slim-deals.xyz",
} as const;

/** Fake spam notifications shown after allowing notifications on the recipe site. */
export const SPAM_NOTIFICATIONS: {
  from: string;
  title: string;
  body: string;
}[] = [
  {
    from: SITES.spam,
    title: "Kaalu kaotus 7 päevaga!",
    body: "Vajuta siia ja tellime sulle imerohu 90% soodsamalt.",
  },
  {
    from: SITES.recipes,
    title: "Sa võitsid auhinna!",
    body: "Vajuta ja küsi oma auhinda kohe.",
  },
  {
    from: SITES.spam,
    title: "Sinu telefon on nakatunud!",
    body: "Puhasta telefon kohe, vajuta siia.",
  },
];

const info = (
  text: Step["text"],
  target?: Step["target"],
  extra: Partial<Step> = {},
): Step => ({
  type: "info",
  text,
  ...(target ? { target } : {}),
  ...extra,
});
const warn = (text: Step["text"], target?: Step["target"]): Step =>
  info(text, target, { warn: true });
const act = (
  text: Step["text"],
  target: Step["target"],
  until: string | string[],
  extra: Partial<Step> = {},
): Step => ({ type: "do", text, target, until, ...extra });

// DRAFT: written from the issue text (prototype `WEB` module was not available).
// Summary "extra points", sign texts and the recipe-site names need client review.
export const browser: House = {
  title: "Küberbrauser",
  intro:
    "See ei ole päris brauser. See on harjutusbrauser, kus saad turvaliselt proovida, kuidas veebis toimida ja kelmustest eemale hoida. Siin ei juhtu midagi päriselt.",
  lessons: [
    {
      title: "Riigi lehe otsimine ja Smart-ID",
      summary: [
        "Kontrolli alati veebilehe aadressi: päris riigi lehed lõpevad „.ee”-ga.",
        "Sponsitud tulemus ei tähenda turvalist lehte.",
        "Smart-ID PIN1 ja PIN2 on eri koodid: PIN2 on allkirjastamiseks ja maksmiseks.",
        "Kontrollkood ekraanil peab olema sama, mis Smart-ID rakenduses.",
        "Ära kinnita makset, mida sa ise ei tellinud.",
      ],
      steps: [
        info(
          "Tahad küsida riigilt toetust. Alustame otsingust.",
          ".browser-search",
        ),
        act(
          "Kirjuta otsingusse <b>toetus</b> ja vajuta otsi.",
          ".browser-search",
          "search:toetus",
          { hint: "Kirjuta sõna toetus ja vajuta otsingunuppu." },
        ),
        info(
          `Tulemuste hulgas on kaks riigi lehte. Üks on <b>${SITES.realGov}</b> ja teine <b>${SITES.fakeGov}</b>.`,
          ".results",
        ),
        warn(
          "<b>OHUMÄRK:</b> Päris riigi lehed lõpevad „.ee”-ga. Aadress, mis lõpeb „.com”, on kahtlane.",
          ".result.fake",
        ),
        act("Vali <b>õige</b> riigi leht.", ".result.real", "pick:real", {
          hint: `Õige aadress lõpeb „.ee”-ga: ${SITES.realGov}.`,
        }),
        info(
          "Sisselogimiseks kasutatakse <b>Smart-ID</b> rakendust. Siin harjutame seda rakenduses nimega Smart-KOOD.",
        ),
        act(
          "Vali sisselogimiseks <b>Smart-ID</b>.",
          ".login-smartid",
          "login:smartid",
        ),
        info(
          `Ekraanil on <b>kontrollkood</b>. Ava ${SITES.smartId} ja kontrolli, et kood oleks sama.`,
          ".control-code",
          { popup: `Harjutuse kontrollkood on <b>${CONTROL_CODE}</b>` },
        ),
        act(
          `Sisesta ${SITES.smartId} rakenduses <b>PIN1</b>.`,
          ".smartid-pad",
          "pin1:ok",
          {
            popup: `Harjutuse PIN1 on <b>${SMART_KOOD_PIN1}</b>`,
            hint: "PIN1 on lühem kood.",
          },
        ),
        info("Oled sisse logitud. Nüüd pakub teine leht sulle <b>makset</b>."),
        warn(
          `<b>OHUMÄRK:</b> Leht palub kinnitada makse <b>${PAYMENT.amount} ${PAYMENT.currency}</b> saajale „${PAYMENT.to}”. Sina ei ole midagi tellinud. Ära sisesta PIN2 koodi!`,
          ".payment",
        ),
        act("Vajuta <b>Katkesta</b>.", ".payment-cancel", "payment:cancel", {
          hint: "Ära kinnita makset. Vajuta Katkesta.",
        }),
        info(
          `Tubli! PIN2 (<b>${SMART_KOOD_PIN2}</b> harjutuses) sisestatakse ainult siis, kui sa ise midagi allkirjastad või maksad.`,
        ),
      ],
    },
    {
      title: "Retsepti otsimine ja rämpsteavitused",
      summary: [
        "Veebileht võib küsida luba teavituste saatmiseks. Vali „Keela”, kui sa pole kindel.",
        "Rämpsteavitused ilmuvad hiljem telefoni ekraanile ja võivad viia kelmuslehtedele.",
        "Kui teavitused juba käivad, saad need telefoni seadetes ära keelata.",
        "Ära vajuta kahtlase teavituse peale.",
      ],
      steps: [
        info("Tahad leida koogiretsepti. Otsime selle internetist."),
        act(
          "Kirjuta otsingusse <b>koogi retsept</b>.",
          ".browser-search",
          "search:koogi retsept",
        ),
        act("Ava esimene tulemus.", ".result:first-child", "pick:recipe"),
        info(
          `Leht <b>${SITES.recipes}</b> avaneb. Ülal hüppab välja aken.`,
          ".permission",
        ),
        warn(
          "<b>OHUMÄRK:</b> Leht küsib luba <b>teavituste</b> saatmiseks. Kui lubad, hakkab leht saatma sulle teateid ka siis, kui sa seda ei vaata.",
          ".permission",
        ),
        act(
          "Vali <b>Luba</b>, et näha, mis juhtub.",
          ".permission-allow",
          "permission:allow",
          {
            hint: "Selles harjutuses võid julgelt Luba valida.",
          },
        ),
        info(
          "Mõne aja pärast hakkavad telefoni ilmuma <b>rämpsteavitused</b>.",
          ".notif",
        ),
        warn(
          `<b>OHUMÄRK:</b> Need teavitused tulevad lehtedelt ${SITES.recipes} ja ${SITES.spam}. Nad lubavad auhindu ja imerohte. Ära vajuta neile!`,
          ".notif",
        ),
        act(
          "Ava telefoni <b>seaded</b>, et teavitused ära keelata.",
          "[data-app=settings]",
          "open:settings",
        ),
        act("Keela lehe teavitused.", ".notif-toggle", "notif:off"),
        info("Rämpsteavitused on keelatud. Nii saad neist alati lahti."),
      ],
    },
    {
      title: "Investeerimispettused",
      soon: true,
      steps: [],
    },
  ],
};
