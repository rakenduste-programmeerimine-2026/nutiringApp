import type { House, Step } from "../types";

export const NUTIROBO_REPLIES = [
  "Tere! Kuidas läheb?",
  "Kuidas ma sind kutsun?",
  "Väga tore sinuga tuttavaks saada! Jätkame õpetusega.",
] as const;

const info = (text: Step["text"], extra: Partial<Step> = {}): Step => ({ type: "info", text, ...extra });
const tap = (text: Step["text"], target: string, until: string, extra: Partial<Step> = {}): Step => ({
  type: "do",
  text,
  target,
  until,
  ...extra,
});

// NB: draft texts and selectors – to be aligned with the client prototype „Nutiküla – Nutiring".
export const messages: House = {
  title: "Sõnumid",
  intro: "Siin õpid sõnumeid lugema, kirjutama ja nendega suhtlema. Sinu abiline on Nutirobo.",
  lessons: [
    {
      title: "Sõnumirakenduse avamine",
      steps: [
        info("Sõnumirakenduses loed ja kirjutad lühisõnumeid."),
        tap("Ava rakendus „Sõnumid”.", "[data-app='messages']", "openApp:messages"),
      ],
    },
    {
      title: "Sõnumi lugemine",
      steps: [
        info("Uued sõnumid on loendis paksus kirjas."),
        tap("Ava Nutirobo vestlus.", "[data-chat='nutirobo']", "openChat:nutirobo", { enter: "botSay" }),
      ],
    },
    {
      title: "Klaviatuur ja kirjutamine",
      steps: [
        info("Kirjutamiseks puuduta sõnumi välja. Klaviatuur ilmub ekraani alaossa."),
        tap("Puuduta sõnumi välja.", "[data-compose]", "focusCompose"),
        {
          type: "do",
          text: "Kirjuta sõna „tõde”. Täht „õ” tuleb, kui hoiad klahvi „o” pikalt all.",
          target: "[data-key='o']",
          check: { kind: "composeText", value: "tõde" },
          hint: "Hoia klahvi „o” all, kuni ilmuvad lisatähed, ja vali „õ”.",
        },
      ],
    },
    {
      title: "Sõnumi saatmine",
      steps: [
        info({
          android: "Saada-nupp on sõnumi välja kõrval.",
          ios: "Send (saada) nupp on sõnumi välja kõrval.",
        }),
        tap(`Kirjuta „${NUTIROBO_REPLIES[0]}” ja saada.`, "[data-send]", "sendMessage", { enter: "botSay" }),
        tap(`Vasta küsimusele „${NUTIROBO_REPLIES[1]}”.`, "[data-send]", "sendMessage"),
        info(NUTIROBO_REPLIES[2]),
      ],
    },
    {
      title: "Emotikonid",
      steps: [
        info("Emotikonid aitavad tunnet väljendada."),
        tap("Ava emotikonide klaviatuur.", "[data-key='emoji']", "openEmoji"),
        tap("Vali üks emotikon.", "[data-emoji]", "pickEmoji"),
      ],
    },
    {
      title: "Pildi saatmine",
      steps: [
        info("Sõnumiga saad saata ka pildi."),
        tap("Puuduta kirjaklambri ikooni.", "[data-attach]", "openAttach"),
        tap("Vali galeriist pilt.", "[data-gallery-item]", "pickPhoto"),
        tap(
          { android: "Puuduta saada-nuppu.", ios: "Puuduta Send (saada)." },
          "[data-send]",
          "sendMessage",
        ),
      ],
    },
    {
      title: "Sõnumile reageerimine",
      steps: [
        info("Sõnumile saad reageerida ilma vastust kirjutamata."),
        tap("Hoia sõrme sõnumil.", "[data-message]", "longPress:message"),
        tap("Vali reaktsioon, näiteks pöial püsti.", "[data-reaction]", "react"),
      ],
    },
    {
      title: "Vestluse kustutamine",
      steps: [
        info("Mittevajaliku vestluse saad ära kustutada."),
        tap("Hoia sõrme vestlusel.", "[data-chat]", "longPress:chat"),
        tap(
          { android: "Vali „Kustuta”.", ios: "Vali Delete (kustuta)." },
          "[data-delete]",
          "deleteChat",
        ),
      ],
    },
    {
      title: "Kontakti lisamine",
      steps: [
        info("Kontaktidesse salvestad inimeste numbrid nimega."),
        tap("Ava rakendus „Kontaktid”.", "[data-app='contacts']", "openApp:contacts"),
        tap("Puuduta plussi.", "[data-add-contact]", "addContactOpen"),
        tap(
          { android: "Salvesta kontakt.", ios: "Puuduta Done (valmis)." },
          "[data-save]",
          "saveContact",
        ),
      ],
    },
    {
      title: "Kahtlased sõnumid",
      steps: [
        info("Kõik sõnumid ei ole ausad. Ära ava tundmatuid linke."),
        tap("Ava kahtlane sõnum.", "[data-message='suspicious']", "openSuspicious"),
        tap("Vajuta „Blokeeri”.", "[data-block]", "blockSender"),
      ],
    },
    {
      title: "Kokkuvõte",
      steps: [info("Oled õppinud sõnumeid lugema, kirjutama, saatma ja kahtlaseid tuvastama. Tubli!")],
      summary: [
        "Sõnumi lugemine ja saatmine",
        "Täht „õ” pika vajutusega",
        "Sõnumile reageerimine",
        "Kahtlaste sõnumite blokeerimine",
      ],
    },
  ],
};
