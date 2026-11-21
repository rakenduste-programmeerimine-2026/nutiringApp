import type { Text } from "./types";

/**
 * Exam content: 3 topics × 10 questions.
 * Source: prototype „Nutiküla – Nutiring" (EXAM) + client feedback 20.11.2026.
 * `image` describes what the UI should draw above the question.
 */
export type QuestionImage =
  | { kind: "app"; app: "browser" | "camera" | "settings" | "contacts" }
  | { kind: "icon"; icon: string } // battery, wifi, plane, home-button, pencil, send, mic, shift, backspace, plus
  | { kind: "sms"; from: string; text: string };

export type ExamQuestion = {
  image?: QuestionImage;
  question: Text;
  options: Text[];
  /** index into options */
  answer: number;
  explanation: Text;
};

export type ExamTopicId = "home" | "messages" | "cyber";

export const EXAM_TOPICS: ExamTopicId[] = ["home", "messages", "cyber"];

export const EXAM_TOPIC_TITLES: Record<ExamTopicId, string> = {
  home: "Avaekraan",
  messages: "Sõnumid",
  cyber: "Küberturvalisus",
};

const WHAT_FOR = "Milleks seda rakendust kasutatakse?";
const YES_NO = ["Jah, see on kelmus", "Ei, see ei ole kelmus"];
const IS_SCAM = "Kas see sõnum on kelmus?";

export const EXAM: Record<ExamTopicId, ExamQuestion[]> = {
  home: [
    {
      image: { kind: "app", app: "browser" },
      question: WHAT_FOR,
      options: [
        "Pildistamiseks",
        "Internetis veebilehtede vaatamiseks",
        "Helistamiseks",
        "Telefoni seadete muutmiseks",
      ],
      answer: 1,
      explanation: {
        android: "Chrome on brauser: sellega pääsed internetti.",
        ios: "Safari on brauser: sellega pääsed internetti.",
      },
    },
    {
      image: { kind: "app", app: "camera" },
      question: WHAT_FOR,
      options: [
        "Piltide ja videote tegemiseks",
        "Sõnumite saatmiseks",
        "Kellaaja vaatamiseks",
        "Internetis käimiseks",
      ],
      answer: 0,
      explanation: "Kaameraga teed pilte ja videoid.",
    },
    {
      image: { kind: "app", app: "settings" },
      question: WHAT_FOR,
      options: [
        "Sõnumite lugemiseks",
        "Telefoninumbrite hoidmiseks",
        "Telefoni seadete muutmiseks",
        "Muusika kuulamiseks",
      ],
      answer: 2,
      explanation: "Seadetes muudad näiteks teksti suurust ja Wi-Fi ühendust.",
    },
    {
      image: { kind: "app", app: "contacts" },
      question: WHAT_FOR,
      options: [
        "Pildistamiseks",
        "Inimeste nimede ja telefoninumbrite hoidmiseks",
        "Ilma vaatamiseks",
        "Rakenduste otsimiseks",
      ],
      answer: 1,
      explanation: "Kontaktid on sinu telefoniraamat.",
    },
    {
      image: { kind: "icon", icon: "battery" },
      question: "Mida näitab see ikoon ekraani ülaosas?",
      options: [
        "Mobiililevi tugevust",
        "Kui palju akut on alles",
        "Kas Wi-Fi on sees",
        "Kellaaega",
      ],
      answer: 1,
      explanation: "See on aku. Kui see on peaaegu tühi, pane telefon laadima.",
    },
    {
      image: { kind: "icon", icon: "wifi" },
      question: "Mida tähendab see ikoon ekraani ülaosas?",
      options: [
        "Telefon on ühendatud Wi-Fi ehk traadita internetiga",
        "Telefon on lennurežiimis",
        "Aku on tühi",
        "Sulle tuli sõnum",
      ],
      answer: 0,
      explanation: "Wi-Fi märk näitab, et oled traadita internetis.",
    },
    {
      question: "Millal küsib telefon SIM-kaardi PIN-koodi?",
      options: [
        "Iga kord, kui saadad sõnumi",
        "Kui telefon sisse lülitatakse",
        "Kui avad kaamera",
        "Mitte kunagi",
      ],
      answer: 1,
      explanation: "SIM-kaardi PIN-koodi küsitakse telefoni sisselülitamisel.",
    },
    {
      question: "Kuidas avada teavitused?",
      options: [
        "Vajutada pikalt avaekraanil",
        "Pühkida ekraani ülaservast alla",
        "Pühkida ekraanil vasakule",
        "Raputada telefoni",
      ],
      answer: 1,
      explanation: "Teavitused avanevad, kui pühid ekraani ülaservast alla.",
    },
    {
      image: { kind: "icon", icon: "home-button" },
      question: {
        android: "Mida teeb see nupp ekraani all keskel?",
        ios: "Kuidas jõuad rakendusest tagasi avakuvale?",
      },
      options: [
        { android: "Läheb sammu tagasi", ios: "Vajutad helitugevuse nuppu" },
        {
          android: "Viib avaekraanile",
          ios: "Pühid ekraani alumisest servast üles",
        },
        { android: "Lülitab telefoni välja", ios: "Pühid ekraanil paremale" },
        { android: "Avab kaamera", ios: "Ootad, kuni rakendus ise sulgub" },
      ],
      answer: 1,
      explanation: {
        android: "Ringikujuline nupp viib alati avaekraanile.",
        ios: "Pühi ekraani alumisest servast üles.",
      },
    },
    {
      image: { kind: "icon", icon: "plane" },
      question: "Mida teeb lennurežiim?",
      options: [
        "Teeb ekraani heledamaks",
        "Lülitab välja kõned, interneti ja Wi-Fi",
        "Paneb taskulambi põlema",
        "Suurendab teksti",
      ],
      answer: 1,
      explanation: "Lennurežiim lülitab välja kõik ühendused.",
    },
  ],
  messages: [
    {
      question:
        "Vestluste nimekirjas on üks vestlus paksus kirjas ja sinise täpiga. Mida see tähendab?",
      options: [
        "Vestlus on kustutatud",
        "Sulle on tulnud uus lugemata sõnum",
        "Saatja on blokeeritud",
        "Sõnum ei läinud kohale",
      ],
      answer: 1,
      explanation: "Paks kiri ja täpp tähendavad lugemata sõnumit.",
    },
    {
      image: { kind: "icon", icon: "pencil" },
      question: "Milleks on see nupp Sõnumite rakenduses?",
      options: [
        "Uue vestluse alustamiseks",
        "Sõnumi kustutamiseks",
        "Helistamiseks",
        "Pildi saatmiseks",
      ],
      answer: 0,
      explanation: "Selle nupuga alustad uut vestlust.",
    },
    {
      image: { kind: "icon", icon: "send" },
      question: "Mida teeb see nupp?",
      options: [
        "Kustutab sõnumi",
        "Saadab sõnumi",
        "Avab klaviatuuri",
        "Lisab emotikoni",
      ],
      answer: 1,
      explanation: "Noolega nupp saadab sõnumi.",
    },
    {
      image: { kind: "icon", icon: "mic" },
      question: "Milleks kasutatakse mikrofoni nuppu sõnumi kirjutamisel?",
      options: [
        "Häälsõnumi salvestamiseks",
        "Helitugevuse muutmiseks",
        "Telefoni lukustamiseks",
        "Pildi tegemiseks",
      ],
      answer: 0,
      explanation: "Mikrofoniga saad salvestada häälsõnumi.",
    },
    {
      image: { kind: "icon", icon: "shift" },
      question: "Mida teeb see klaviatuuri klahv?",
      options: [
        "Kustutab tähe",
        "Teeb järgmise tähe suureks",
        "Saadab sõnumi",
        "Lisab tühiku",
      ],
      answer: 1,
      explanation: "Noolega klahv teeb järgmise tähe suureks.",
    },
    {
      image: { kind: "icon", icon: "backspace" },
      question: "Mida teeb see klaviatuuri klahv?",
      options: [
        "Kustutab viimase tähe",
        "Teeb tähe suureks",
        "Avab emotikonid",
        "Sulgeb klaviatuuri",
      ],
      answer: 0,
      explanation: "Selle klahviga kustutad viimase tähe.",
    },
    {
      question: "Kuidas kirjutada telefoni klaviatuuril tähte „õ”?",
      options: [
        "Seda ei saa telefonis kirjutada",
        "Hoia sõrme o-tähel ja vali avanevast aknast õ",
        "Tuleb kirjutada „o” ja „~”",
        "Tuleb vajutada 123",
      ],
      answer: 1,
      explanation:
        "Hoia sõrme o-tähel, siis avaneb aken, kust saad valida õ või ö.",
    },
    {
      image: { kind: "icon", icon: "plus" },
      question: "Mida saab sõnumi juures teha plussi nupuga?",
      options: [
        "Lisada pilte, kontakte või asukohta",
        "Suurendada teksti",
        "Helistada",
        "Kustutada vestluse",
      ],
      answer: 0,
      explanation: "Plussi nupuga saad sõnumile midagi kaasa panna.",
    },
    {
      question:
        "Tundmatu välismaa number saatis sulle kahtlase lingiga sõnumi. Mida teha?",
      options: [
        "Vajutada lingile ja vaadata",
        "Vastata ja küsida, kes see on",
        "Blokeerida saatja ja teatada rämpspostist",
        "Saata sõnum sõpradele edasi",
      ],
      answer: 2,
      explanation: "Kahtlase saatja blokeeri ja ära vajuta lingile.",
    },
    {
      question: "Kuidas kustutada terve vestlus?",
      options: [
        "Hoida sõrme vestlusel ja valida „Kustuta”",
        "Raputada telefoni",
        "Lülitada telefon välja",
        "Vajutada saatmisnuppu",
      ],
      answer: 0,
      explanation: "Hoia sõrme vestlusel ja vali kustutamine.",
    },
  ],
  cyber: [
    {
      image: {
        kind: "sms",
        from: "Telegram",
        text: "Your Telegram account has violated platform rules and will be closed if not verified within 6 hours. Go to https://telergmao.top to verify now.",
      },
      question: IS_SCAM,
      options: YES_NO,
      answer: 0,
      explanation:
        "Kiirustamine („6 tunni jooksul”) ja vale link telergmao.top näitavad kelmust.",
    },
    {
      image: {
        kind: "sms",
        from: "AK24.ee",
        text: "Autokaubad24 tellimus TEE2542650 on valmis. Tulge tellimusele järele aadressile Hundipea 5 E-R 09.00-18.00. Vajalik isikut tõendav dokument.",
      },
      question:
        "Sa tellisid hiljuti midagi Autokaubad24 e-poest. Kas see sõnum on kelmus?",
      options: YES_NO,
      answer: 1,
      explanation:
        "See ei ole kelmus: sõnumis on tellimuse number ja aadress, pole linki ega rahasoovi.",
    },
    {
      image: {
        kind: "sms",
        from: "+66 96-630",
        text: "Hea lapsevanem! Sinu laps on vanuses, mil ootame teda perearsti juurde laste plaanilisse tervisekontrolli. Broneeri aeg juba täna: www.terviseportaal.ee. Tervisekassa",
      },
      question: IS_SCAM,
      options: YES_NO,
      answer: 0,
      explanation:
        "Number +66 ei ole Eesti number. Eesti numbrid algavad +372-ga.",
    },
    {
      image: {
        kind: "sms",
        from: "PARKIMINE",
        text: "Tere, Teie sõidukile on registreeritud (02.01.2026) maksmata parkimistrahv, vaata trahvi siit https://s.id/PARKIMINE-EE",
      },
      question: IS_SCAM,
      options: YES_NO,
      answer: 0,
      explanation:
        "Pole sõiduki numbrimärki ja link on lühendatud. Need on kelmuse tunnused.",
    },
    {
      question:
        "Helistaja ütleb, et on pangast, ja küsib sinu PIN-koode. Mida teed?",
      options: [
        "Ütlen koodid, sest ta on pangast",
        "Lõpetan kõne ja helistan ise panga ametlikule numbrile",
        "Saadan koodid sõnumiga",
        "Ütlen ainult PIN1",
      ],
      answer: 1,
      explanation: "Pank ei küsi kunagi PIN-koode telefoni teel.",
    },
    {
      question: "Millise numbriga algavad Eesti telefoninumbrid?",
      options: ["+66", "+44", "+372", "+7"],
      answer: 2,
      explanation: "Eesti suunakood on +372.",
    },
    {
      question: "Kuidas kontrollida, et helistaja on päriselt sinu lähedane?",
      options: [
        "Küsin tema sünniaastat",
        "Kasutame peres kokku lepitud koodsõna",
        "Usun, kui hääl on sarnane",
        "Saadan talle raha proovimiseks",
      ],
      answer: 1,
      explanation:
        "Kokku lepitud koodsõna aitab. Hääle saab arvutiga järele teha.",
    },
    {
      question: "Kas internetipanka sisse logides tuleb sisestada PIN2?",
      options: [
        "Jah, alati",
        "Ei, sisselogimisel PIN2 koodi ei sisestata",
        "Ainult nädalavahetusel",
        "Ainult siis, kui pank palub sõnumiga",
      ],
      answer: 1,
      explanation: "Sisselogimisel PIN2 koodi kunagi ei sisestata.",
    },
    {
      question: "Sa andsid kelmile oma kaardi andmed. Mida teha kõigepealt?",
      options: [
        "Oodata, kas midagi juhtub",
        "Sulgeda kaart ja helistada kohe pangale",
        "Kustutada kõik sõnumid",
        "Mitte kellelegi rääkida",
      ],
      answer: 1,
      explanation:
        "Kõigepealt sulge kaart ja helista pangale. Ära kustuta tõendeid.",
    },
    {
      question: "Mis numbril saad küsida nõu, kui ei tea, mida teha?",
      options: ["112", "1247", "1524", "1182"],
      answer: 1,
      explanation: "Riigiinfo nõuandeliin on 1247.",
    },
  ],
};
