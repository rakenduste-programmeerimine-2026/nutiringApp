import { describe, expect, it } from "vitest";
import {
  browser,
  CONTROL_CODE,
  PAYMENT,
  SMART_KOOD_PIN1,
  SMART_KOOD_PIN2,
  SPAM_NOTIFICATIONS,
} from "@/content/lessons/browser";
import type { Text } from "@/content/types";

const asList = (t: Text | undefined): Text[] => (t === undefined ? [] : [t]);

describe("browser content", () => {
  it("has an intro and 3 lessons, the last one is soon", () => {
    expect(browser.intro).toContain("See ei ole päris brauser");
    expect(browser.lessons).toHaveLength(3);
    expect(browser.lessons[2].soon).toBe(true);
    expect(browser.lessons[2].steps).toHaveLength(0);
  });

  it("every non-soon lesson has steps and a summary", () => {
    for (const l of browser.lessons.filter((x) => !x.soon)) {
      expect(l.steps.length).toBeGreaterThan(0);
      expect(l.summary?.length).toBeGreaterThan(0);
    }
  });

  it("every do step has until or check", () => {
    for (const l of browser.lessons)
      for (const s of l.steps)
        if (s.type === "do") expect(Boolean(s.until || s.check)).toBe(true);
  });

  it("every Text object has android and ios", () => {
    for (const l of browser.lessons)
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

  it("warn is only used on info steps", () => {
    for (const l of browser.lessons)
      for (const s of l.steps) if (s.warn) expect(s.type).toBe("info");
  });

  it("has the agreed constants", () => {
    expect(SMART_KOOD_PIN1).toBe("1357");
    expect(SMART_KOOD_PIN2).toBe("24680");
    expect(CONTROL_CODE).toBe("4821");
    expect(PAYMENT.amount).toBe(1250);
    expect(PAYMENT.to).toBe("Kiirlaen Invest OÜ");
    expect(SPAM_NOTIFICATIONS.length).toBeGreaterThan(0);
  });
});
