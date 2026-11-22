import type { ExamTopicId } from "@/content/exam";

/** Link back to the house that teaches the topic. */
export const TOPIC_HOUSE: Record<ExamTopicId, string> = {
  home: "/maja/avaekraan",
  messages: "/maja/sonumid",
  cyber: "/maja/kuber",
};

export type ResultMessage = {
  /** Headline: 8–10 „Väga tubli!”, 5–7 „Hea töö!”, 0–4 „Harjuta veel!” */
  title: string;
  /** One sentence under it. */
  text: string;
  /** Suggest going back to the topic's house (everything under 8). */
  revisitHouse: boolean;
};

export function resultMessage(
  score: number,
  topicTitle: string,
): ResultMessage {
  if (score >= 8)
    return {
      title: "Väga tubli!",
      text: "Sa tead sellest teemast väga palju.",
      revisitHouse: false,
    };
  if (score >= 5)
    return {
      title: "Hea töö!",
      text: "Enamik vastuseid oli õiged. Vaata maja õppetunnid veel kord üle.",
      revisitHouse: true,
    };
  return {
    title: "Harjuta veel!",
    text: `Mine tagasi majja „${topicTitle}” ja proovi siis uuesti.`,
    revisitHouse: true,
  };
}
