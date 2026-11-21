/**
 * Cyber security content for the „Aita Tiiat" room: task pool, checklist, victim help.
 * Source: prototype „Nutiküla – Nutiring" (CY tasks, CHECK, viewVictim) + client feedback 20.11.2026.
 * Malvi and Kalev are replaced by one character, Tiia. The LKF (Russian) message is removed.
 */

export type SignTone = "ok" | "warn" | "tip";

/** `ref` is the number of the marker in the message text ([[ref|text]]); 0 = no marker. */
export type Sign = {
  ref: number;
  title: string;
  body: string;
  tone?: SignTone;
};

export type TaskKind = "sms" | "serp" | "bank" | "call";
/** scam / safe: the message or call is a scam or not. real: pick the real search result. */
export type TaskAnswer = "scam" | "safe" | "real";

export type CyberTask = {
  id: string;
  kind: TaskKind;
  answer: TaskAnswer;
  /** Tiia's question; SMS tasks have none, use taskQuestion() */
  question?: string;
  /** sender / meta / text may contain [[n|text]] sign markers */
  from?: string;
  meta?: string;
  text?: string;
  caller?: string;
  num?: string;
  signs: Sign[];
};

const KUBER_TIP: Sign = {
  ref: 0,
  title: "Õpi rohkem",
  body: "Kuidas internetis turvaliselt liikuda, saad harjutada <b>Küberbrauseri</b> tundides siinsamas majas.",
  tone: "tip",
};

export const SCAM_SMS: CyberTask[] = [
  {
    id: "omniva",
    kind: "sms",
    answer: "scam",
    from: "[[1|rexdpyegf@outlook.com]]",
    meta: "iMessage · teisipäev 14:46",
    text: "Hea klient,\n\nVabandame ebamugavuste pärast. [[2|Teie pakk on saabunud kohalikku lattu, kuid aadressiteave on puudulik]] ja seda ei saa kohale toimetada.\n\n[[3|Vastake Y-le 24 tunni jooksul]], et kinnitada, et olete aadressi muutmiseks valmis, ja klõpsake järgmisel lingil: [[4|https://omneva.cc/ee]]\n\n[[5|Töödelge seda esimesel võimalusel, et vältida paki tagastamist.]]\n\nHead päeva!",
    signs: [
      {
        ref: 1,
        title: "Kahtlane saatja",
        body: "Sõnum tuli juhuslikult e-posti aadressilt, mitte pakifirmalt.",
      },
      {
        ref: 2,
        title: "Paki saatmisel on aadress olemas",
        body: "Kui pakk saadetakse, on saaja aadress alati teada. Pakifirma ei küsi seda hiljem sõnumiga.",
      },
      {
        ref: 3,
        title: "Ajaline surve",
        body: "Sind kiirustatakse: „24 tunni jooksul”. Kelmid tahavad, et sa ei jõuaks järele mõelda.",
      },
      {
        ref: 4,
        title: "Kahtlane link",
        body: "Õige aadress oleks omniva.ee. Siin on „omneva.cc”: üks täht on vale ja lõpp on võõras.",
      },
      {
        ref: 5,
        title: "Vigane keelekasutus",
        body: "Laused on kohmakad, nagu masinaga tõlgitud. Päris ettevõtted kirjutavad korrektselt.",
      },
    ],
  },
  {
    id: "ppa-trahv",
    kind: "sms",
    answer: "scam",
    from: "[[1|shannonwitte6889@gloriatlittle.com]]",
    meta: "iMessage · neljapäev 10:03",
    text: "PPA: Registreerisime 01.09.2025 kell 11:09 kiiruseületamise Tallinn-Tartu teel. Kiiruspiirang 90 km/h. Teie kiirus 109 km/h. [[2|Teie kui sõiduki omanikule]] on määratud trahv. Palun vaadake trahv kohe üle, külastades allolevat linki: [[3|ria.etoimik-ee-tatru.com]] Lingi aktiveerimiseks vastake PPA-ga või kleepige link oma brauserisse. [[4|Selle teate ignoreerimine on ebaseaduslik.]]",
    signs: [
      {
        ref: 1,
        title: "Kahtlane saatja",
        body: "Politsei ei saada trahve juhuslikult e-posti aadressilt.",
      },
      {
        ref: 2,
        title: "Pole sõiduki numbrimärki",
        body: "Päris trahviteates on alati kirjas auto numbrimärk.",
      },
      {
        ref: 3,
        title: "Kahtlane link",
        body: "Aadress on segane ega lõpe „.ee”-ga. Riigi lehed on näiteks politsei.ee.",
      },
      {
        ref: 4,
        title: "Ähvardamine",
        body: "Sind hirmutatakse seadusega, et kiiresti tegutseksid.",
      },
    ],
  },
  {
    id: "telegram",
    kind: "sms",
    answer: "scam",
    from: "[[1|Telegram]]",
    meta: "Tekstsõnum · täna 8:31",
    text: "[[2|Your Telegram account has violated platform rules]] and will be closed if not verified [[3|within 6 hours]]. Go to [[4|https://telergmao.top]] to verify now.",
    signs: [
      {
        ref: 1,
        title: "Saatja nimi võib olla võlts",
        body: "Saatja nimeks saab kirjutada ükskõik mida. Telegram ei sulge kontosid SMS-i teel.",
      },
      {
        ref: 2,
        title: "Võõras keel ja hirmutamine",
        body: "Sõnum on inglise keeles ja ähvardab konto sulgemisega.",
      },
      {
        ref: 3,
        title: "Ajaline surve",
        body: "„6 tunni jooksul”: sind kiirustatakse, et sa ei jõuaks järele mõelda.",
      },
      {
        ref: 4,
        title: "Vale link",
        body: "„telergmao.top”: tähed on segamini ja lõpp on võõras. See ei ole Telegrami leht.",
      },
    ],
  },
  {
    id: "tervisekassa",
    kind: "sms",
    answer: "scam",
    from: "[[1|+66 96-630]]",
    meta: "Tekstsõnum · eile 17:20",
    text: "[[3|Hea lapsevanem!]] Sinu laps on vanuses, mil ootame teda perearsti juurde laste plaanilisse tervisekontrolli. Broneeri aeg juba täna: [[2|www.terviseportaal.ee]]. Tervisekassa",
    signs: [
      {
        ref: 1,
        title: "Välismaa number",
        body: "+66 on Tai suunakood. Eesti numbrid algavad +372-ga ja Eesti asutused ei saada sõnumeid välismaa numbrilt.",
      },
      {
        ref: 2,
        title: "Ära vajuta lingile",
        body: "Kui tahad aega broneerida, mine ise ametlikule lehele või helista oma perearstile.",
      },
      {
        ref: 3,
        title: "Üldine pöördumine",
        body: "„Hea lapsevanem” tähendab, et sama sõnum saadeti paljudele korraga.",
      },
    ],
  },
  {
    id: "parkimine",
    kind: "sms",
    answer: "scam",
    from: "[[1|PARKIMINE]]",
    meta: "Tekstsõnum · täna 12:05",
    text: "Tere, Teie sõidukile on registreeritud (02.01.2026) [[2|maksmata parkimistrahv]], vaata trahvi siit [[3|https://s.id/PARKIMINE-EE]]",
    signs: [
      {
        ref: 1,
        title: "Üldine saatja",
        body: "Pole kirjas, mis firma või omavalitsus trahvi tegi.",
      },
      {
        ref: 2,
        title: "Pole numbrimärki ega summat",
        body: "Päris trahviteates on auto numbrimärk, summa ja koht.",
      },
      {
        ref: 3,
        title: "Lühendatud link",
        body: "„s.id/…” peidab tegeliku aadressi. Sa ei näe, kuhu link viib.",
      },
    ],
  },
];

export const SAFE_SMS: CyberTask[] = [
  {
    id: "autokaubad24",
    kind: "sms",
    answer: "safe",
    from: "[[1|AK24.ee]]",
    meta: "Tekstsõnum · reede 12:53",
    text: "Autokaubad24 tellimus [[2|TEE2542650]] on valmis. Tulge tellimusele järele [[3|aadressile Hundipea 5 E-R 09.00-18.00]]. Vajalik isikut tõendav dokument.",
    signs: [
      {
        ref: 1,
        title: "Tuttav saatja",
        body: "Sõnum tuli poe nimega, kust Tiia oli just midagi tellinud.",
      },
      {
        ref: 2,
        title: "Tellimuse number",
        body: "Sõnumis on konkreetne tellimuse number, mida saab poe kodulehel kontrollida.",
      },
      {
        ref: 3,
        title: "Selge aadress ja kellaajad",
        body: "Kirjas on, kuhu ja millal minna. Kohapeal tuleb näidata dokumenti.",
      },
      {
        ref: 0,
        title: "Pole linki ega rahasoovi",
        body: "Sind ei suunata lingile ega paluta maksta ega andmeid sisestada.",
      },
    ],
  },
  {
    id: "monefit",
    kind: "sms",
    answer: "safe",
    from: "[[1|Monefit]]",
    meta: "Tekstsõnum · 19. dets 13:01",
    text: "Tiia, Sulle nüüd uus intressimäär alla 25%. Sinu konto on kasutusvalmis. Lisainfo: [[2|monefit.ee]] [[3|SMS loobumiseks: +3726888222]]",
    signs: [
      {
        ref: 1,
        title: "Tuttav saatja",
        body: "Sõnum tuli ettevõttelt, kelle klient Tiia on, ja pöördub tema poole nimega.",
      },
      {
        ref: 2,
        title: "Õige aadress",
        body: "monefit.ee on ettevõtte päris koduleht ja lõpeb „.ee”-ga.",
      },
      {
        ref: 3,
        title: "Eesti number",
        body: "Loobumiseks antakse Eesti telefoninumber (+372).",
      },
      {
        ref: 0,
        title: "Ole siiski ettevaatlik!",
        body: "Hiljem saatis sama ettevõte loobumiseks lühendatud lingi (shorturl.at). Lühendatud lingile ära vajuta: sa ei näe, kuhu see viib.",
        tone: "warn",
      },
    ],
  },
];

export const WEB_TASKS: CyberTask[] = [
  {
    id: "coop-search",
    kind: "serp",
    answer: "real",
    question: "Tahan internetipanka minna. Kummale neist peaksin vajutama?",
    signs: [
      {
        ref: 1,
        title: "Võlts aadress",
        body: "Aadress on „cooppank.ee.rhinolodgechitwan.com”. Pärast „.ee” tuleb veel midagi: see on hoopis teine veebileht.",
      },
      {
        ref: 2,
        title: "Õige aadress",
        body: "Päris panga aadress on „cooppank.ee”. Aadress lõpeb kohe pärast „.ee”.",
        tone: "ok",
      },
      {
        ref: 3,
        title: "Mida tähendab „Sponsitud”?",
        body: "Sponsitud on <b>reklaam</b>: keegi maksis, et tema leht oleks otsingus eespool. Siin olid sponsitud <b>mõlemad</b> tulemused, ka päris Coop Panga oma. Kelmid kasutavad sponsitud reklaame, et oma võltslehte esile tõsta. Seega ära usalda tulemust ainult sellepärast, et see on kõige ees.",
      },
      {
        ref: 0,
        title: "Pea meeles",
        body: "Internetipanka sisse logides ei sisestata kunagi PIN2 koodi.",
      },
      KUBER_TIP,
    ],
  },
  {
    id: "seb-login",
    kind: "bank",
    answer: "scam",
    question: "Avasin internetipanga lehe. Kas see on päris või võlts?",
    signs: [
      {
        ref: 1,
        title: "Vale aadress",
        body: "Aadressiribal on „jillniyomoto.com”, mitte „seb.ee”. Vaata alati veebilehe aadressi!",
      },
      {
        ref: 2,
        title: "Kahtlane teade",
        body: "Lehel palutakse teha „proovi-ülekanne” võõrale kontole. Pank ei palu kunagi raha „testiks” üle kanda.",
      },
      {
        ref: 3,
        title: "Kirjaviga",
        body: "„Login sisse” on vigane eesti keel. Päris pank kirjutab „Logi sisse”.",
      },
      {
        ref: 0,
        title: "Pea meeles",
        body: "Internetipanka sisse logides ei sisestata kunagi PIN2 koodi.",
      },
      KUBER_TIP,
    ],
  },
];

export const CALL_TASKS: CyberTask[] = [
  {
    id: "grandchild-accident",
    kind: "call",
    answer: "scam",
    question: "Mulle helistati! Kuula kõnet. Kas see oli kelmus?",
    caller: "Tundmatu number",
    num: "+372 5555 0147",
    signs: [
      {
        ref: 0,
        title: "Hirmutamine ja kiirustamine",
        body: "Helistaja ütleb, et lähedasega juhtus õnnetus ja raha on kohe vaja.",
      },
      {
        ref: 0,
        title: "Rahasoov",
        body: "Palutakse kiiresti raha üle kanda või anda see võõrale inimesele.",
      },
      {
        ref: 0,
        title: "Tundmatu number",
        body: "Lähedane helistab nagu „uuelt” numbrilt. Hääle saab tänapäeval arvutiga järele teha.",
      },
      {
        ref: 0,
        title: "Mida teha?",
        body: "Lõpeta kõne ja helista ise lähedasele tema tavalisel numbril. Leppige peres kokku koodsõna.",
      },
    ],
  },
  {
    id: "bank-security",
    kind: "call",
    answer: "scam",
    question: "Mulle helistati pangast. Kuula kõnet. Kas see oli kelmus?",
    caller: "Tundmatu number",
    num: "+372 600 4410",
    signs: [
      {
        ref: 0,
        title: "Esinetakse pangatöötajana",
        body: "Helistaja ütleb, et on panga turvaosakonnast. Ekraanil näidatav number võib olla võltsitud.",
      },
      {
        ref: 0,
        title: "Küsitakse Smart-ID koode",
        body: "Pank ei küsi kunagi PIN-koode ega Smart-ID kinnitust telefoni teel.",
      },
      {
        ref: 0,
        title: "Survet avaldatakse",
        body: "„Ära katkesta kõnet”, „ära räägi kellelegi”: need on kelmi võtted.",
      },
      {
        ref: 0,
        title: "Mida teha?",
        body: "Lõpeta kõne. Helista ise panga ametlikule numbrile, mis on panga kodulehel või kaardi tagaküljel.",
      },
    ],
  },
];

export const TASK_POOL: CyberTask[] = [
  ...SCAM_SMS,
  ...SAFE_SMS,
  ...WEB_TASKS,
  ...CALL_TASKS,
];

const pickOne = <T>(list: T[], rng: () => number): T =>
  list[Math.floor(rng() * list.length)];

/**
 * Four tasks for one play-through: one scam SMS and one real SMS in random order,
 * then one web task, then one call.
 */
export function pickTasks(rng: () => number = Math.random): CyberTask[] {
  const sms = [pickOne(SCAM_SMS, rng), pickOne(SAFE_SMS, rng)];
  if (rng() < 0.5) sms.reverse();
  return [...sms, pickOne(WEB_TASKS, rng), pickOne(CALL_TASKS, rng)];
}

/** What Tiia says when a task starts. SMS tasks depend on their position in the round. */
export function taskQuestion(task: CyberTask, index: number): string {
  return (
    task.question ??
    (index === 0
      ? "Mulle tuli selline sõnum. Kas see on kelmus?"
      : "Nüüd tuli veel üks sõnum. Kas see on kelmus?")
  );
}

/** How to take a screenshot of the checklist page, per system. */
export const SCREENSHOT_HELP = {
  title: "Tee sellest lehest kuvatõmmis",
  intro: "Nii jääb nimekiri sinu telefoni pildina alles.",
  android:
    "Vajuta <b>korraga</b> toitenuppu (1) ja helitugevuse vähendamise nuppu (2). Ekraan vilgatab ja pilt salvestub galeriisse.",
  ios: "Vajuta <b>korraga</b> külgnuppu (1) ja helitugevuse suurendamise nuppu (2). Ekraan vilgatab ja pilt salvestub rakendusse Fotod.",
  computer:
    "Kui kasutad arvutit, vaata pilti ja proovi seda hiljem oma telefonis.",
} as const;

export const CHECKLIST: string[] = [
  "Kas sõnum tuli ootamatult?",
  "Kas palutakse tegutseda kohe? (kiirustamine ja surve)",
  "Kas küsitakse PIN-koode, paroole või kinnitust? („Vajuta NÕUSTUN”)",
  "Kas link on kahtlane? (näiteks s3b.ee või swedbank-turvaline.info)",
  "Kas palutakse raha üle kanda või andmeid sisestada?",
  "Kas väidetakse, et ollakse pangast, politseist või riigiasutusest?",
  "Kas saatja on imelik, pika nimega või tundmatu?",
  "Kas tekstis, nimes või lingis on kirjavigu?",
  "Kas sul tekkis ebamugav tunne, hirm või halb sisetunne?",
];

export const VICTIM_STEPS: { title: string; body: string }[] = [
  {
    title: "Võta kohe ühendust oma pangaga",
    body: "Sulge kaart panga äpis või internetipangas. Helista panga klienditoele ja palu makse peatada, kaart sulgeda või konto ajutiselt blokeerida.",
  },
  {
    title: "Räägi lähedasele",
    body: "Lähedane aitab sul teha avalduse politseile ja tegeleda tagajärgedega.",
  },
  {
    title: "Hoia kõik alles",
    body: "Sõnumid, kirjad, maksekinnitused, veebilehe aadress, kuupäevad ja kellaajad. Ära kustuta midagi, isegi kui see tundub piinlik.",
  },
  {
    title: "Teata politseile",
    body: "Pärast kaardi sulgemist kirjuta aadressile kelmused@politsei.ee",
  },
];

export const VICTIM_EMAIL = "kelmused@politsei.ee";

export const PHONE_NUMBERS: { name: string; number: string; hours: string }[] =
  [
    { name: "SEB Pank", number: "665 5100", hours: "24/7" },
    { name: "Swedbank", number: "6310 310", hours: "24/7" },
    { name: "LHV Pank", number: "680 0400", hours: "24/7" },
    { name: "Luminor", number: "628 3300", hours: "E–R 9–18, L 10–18" },
    { name: "Coop Pank", number: "669 0966", hours: "24/7" },
    { name: "Smart-ID klienditugi", number: "+372 715 1606", hours: "24/7" },
    {
      name: "Riigiinfo nõuandeliin",
      number: "1247",
      hours: "Kui ei tea, mida teha",
    },
  ];
