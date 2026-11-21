import { describe, expect, it } from "vitest";
import { home, SCREEN_LOCK, SIM_PIN } from "@/content/lessons/home";
import { messages, NUTIROBO_REPLIES } from "@/content/lessons/messages";
import type { Text } from "@/content/types";

const houses = { home, messages };

const asList = (t: Text | undefined): Text[] => (t === undefined ? [] : [t]);

describe("lesson content", () => {
  it("has 9 home and 11 message lessons", () => {
    expect(home.lessons).toHaveLength(9);
    expect(messages.lessons).toHaveLength(11);
  });

  for (const [name, house] of Object.entries(houses)) {
    describe(name, () => {
      it("every non-soon lesson has at least one step", () => {
        for (const l of house.lessons.filter((x) => !x.soon))
          expect(l.steps.length).toBeGreaterThan(0);
      });

      it("every do step has until or check", () => {
        for (const l of house.lessons)
          for (const s of l.steps)
            if (s.type === "do") expect(Boolean(s.until || s.check)).toBe(true);
      });

      it("every Text object has android and ios", () => {
        for (const l of house.lessons)
          for (const s of l.steps)
            for (const t of [
              ...asList(s.text),
              ...asList(s.target),
              ...asList(s.popup),
              ...asList(s.hint),
            ])
              if (typeof t === "object") {
                expect(t.android).toBeTruthy();
                expect(t.ios).toBeTruthy();
              }
      });
    });
  }

  it("uses the agreed practice codes and bot replies", () => {
    expect(SIM_PIN).toBe("1234");
    expect(SCREEN_LOCK).toBe("2580");
    expect(NUTIROBO_REPLIES).toEqual([
      "Tere! Kuidas läheb?",
      "Kuidas ma sind kutsun?",
      "Väga tore sinuga tuttavaks saada! Jätkame õpetusega.",
    ]);
  });

  it("messages has the reaction lesson as lesson 7", () => {
    expect(messages.lessons[6].title).toBe("Sõnumile reageerimine");
  });
});

describe("Nutirobo steps", () => {
  it("every botSay step points at a fixed reply", async () => {
    const { NUTIROBO_REPLIES } = await import("@/content/lessons/messages");
    const idx: number[] = [];
    for (const l of messages.lessons)
      for (const s of l.steps)
        if (s.enter?.startsWith("botSay:"))
          idx.push(Number(s.enter.split(":")[1]));
    expect(idx).toEqual([0, 1, 2]);
    for (const i of idx) expect(NUTIROBO_REPLIES[i]).toBeTruthy();
  });
});
