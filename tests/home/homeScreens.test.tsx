import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { OS } from "@/content/types";
import { homeModule, initialHome, type HomeState } from "@/features/home";

const act = (s: HomeState, action: string, data: Record<string, string> = {}, os: OS = "android") =>
  homeModule.act(s, action, data, os);
const draw = (s: HomeState, os: OS) => render(<div className={`phone ${os}`}>{homeModule.render(s, os)}</div>).container;
const home = initialHome();

/** The selectors must exist, because the lessons point at them. */
const expectParts = (c: HTMLElement, selectors: string[]) => {
  for (const sel of selectors) expect(c.querySelector(sel), sel).not.toBeNull();
};

describe("home screen", () => {
  it("Android: apps on top, dock with the nine-dot button, „Kõik rakendused”", () => {
    const c = draw(home, "android");
    expectParts(c, [
      ".home",
      ".homegrid [data-app=settings]",
      ".homegrid [data-app=contacts]",
      ".dock [data-app=phone]",
      ".dock [data-app=messages]",
      ".dock [data-app=browser]",
      ".dock [data-app=camera]",
      ".apps-btn",
      ".drawerhandle",
      ".wallempty",
      ".nav-home",
      ".sb-notifs",
      ".sb-sound",
    ]);
    expect(screen.getByText("Kõik rakendused")).toBeInTheDocument();
  });

  it("iPhone: page dots instead of the nine-dot button, English app names", () => {
    const c = draw(home, "ios");
    expectParts(c, [".pagedots", ".homeind"]);
    expect(c.querySelector(".apps-btn")).toBeNull();
    expect(screen.getByText("Settings")).toBeInTheDocument();
  });

  it("holding the wallpaper: Android menu, iPhone edit mode; both close", () => {
    const menu = act(home, "longHome", {}, "android").state;
    expect(menu.scr).toBe("longmenu");
    expectParts(draw(menu, "android"), [".lmenu", ".lm-wall", ".lm-widg", ".lm-set", ".menuclose"]);
    expect(act(menu, "closeMenu").state.scr).toBe("home");

    const jiggle = act(home, "longHome", {}, "ios").state;
    expect(jiggle.scr).toBe("jiggle");
    const c = draw(jiggle, "ios");
    expectParts(c, [".jiggle", ".ie-plus", ".ie-edit", ".ie-done"]);
    expect(screen.getByText("Done")).toBeInTheDocument();
  });
});

describe("all apps and search", () => {
  const drawer = act(home, "openDrawer").state;

  it("lists all 12 apps alphabetically; the clock can be held", () => {
    const c = draw(drawer, "android");
    const names = [...c.querySelectorAll(".drawer .appgrid .app span")].map((e) => e.textContent);
    expect(names).toHaveLength(12);
    expect(names).toEqual([...names].sort((a, b) => a!.localeCompare(b!, "et")));
    expect(c.querySelector("[data-dapp=clock]")).toHaveAttribute("data-long", "longApp");
  });

  it("iPhone calls it App Library", () => {
    draw(drawer, "ios");
    expect(screen.getAllByText("App Library").length).toBeGreaterThan(0);
  });

  it("search: typing „kell” finds the clock, opening it gives open:clock", () => {
    let s = act(drawer, "searchFocus").state;
    expect(homeModule.keyboardOpen!(s)).toBe(true);
    for (const ch of "kell") s = act(s, "key", { k: `ch:${ch}` }).state;
    expect(homeModule.check!(s, { kind: "searchQuery", value: "kell" }, "android")).toBe(true);
    const c = draw(s, "android");
    expect(c.querySelector("[data-result=clock]")).not.toBeNull();
    expect(c.querySelector(".kb")).not.toBeNull();
    const r = act(s, "open", { app: "clock" });
    expect(r.event).toBe("open:clock");
    expect(r.state.scr).toBe("app:clock");
  });

  it("iPhone search uses English names („clock”)", () => {
    let s = act(drawer, "searchFocus", {}, "ios").state;
    for (const ch of "clock") s = act(s, "key", { k: `ch:${ch}` }, "ios").state;
    expect(draw(s, "ios").querySelector("[data-result=clock]")).not.toBeNull();
  });

  it("no results → a message instead of an empty list", () => {
    let s = act(drawer, "searchFocus").state;
    for (const ch of "xyz") s = act(s, "key", { k: `ch:${ch}` }).state;
    draw(s, "android");
    expect(screen.getByText("Tulemusi pole")).toBeInTheDocument();
  });

  it("holding the clock → „Lisa avaekraanile” → the clock is on the home screen", () => {
    const withMenu = act(drawer, "longApp", { app: "clock" }).state;
    expect(draw(withMenu, "android").querySelector(".ctx-add")).toHaveTextContent("Lisa avaekraanile");
    const added = act(withMenu, "addHome").state;
    expect(added.scr).toBe("home");
    expect(added.homeApps).toContain("clock");
    expect(draw(added, "android").querySelector(".homegrid [data-app=clock]")).not.toBeNull();
  });
});

describe("Clock app, back / home and open apps (lesson 7)", () => {
  const clock = act(act(home, "openDrawer").state, "open", { app: "clock" }).state;

  it("Alarms page, Android ◀ goes back to the clock page (backClock)", () => {
    const alarms = act(clock, "alarms").state;
    expectParts(draw(alarms, "android"), [".alarms", ".tab-alarm.on"]);
    const back = act(alarms, "navBack");
    expect(back.event).toBe("backClock");
    expect(back.state.clockPage).toBe("clock");
    expectParts(draw(back.state, "android"), [".clkbig", ".clockapp"]);
  });

  it("iPhone: „‹ Clock” goes back", () => {
    const alarms = act(clock, "alarms", {}, "ios").state;
    expect(draw(alarms, "ios").querySelector(".ios-back")).toHaveTextContent("‹ Clock");
    expect(act(alarms, "appBack", {}, "ios").event).toBe("backClock");
  });

  it("● goes home but the clock stays open; ■ shows it; swiping the card closes it", () => {
    const atHome = act(clock, "navHome");
    expect(atHome.event).toBe("goHome");
    expect(atHome.state.recents).toContain("clock");
    const recents = act(atHome.state, "navRecent");
    expect(recents.event).toBe("recents");
    const c = draw(recents.state, "android");
    const card = c.querySelector(".rcard[data-r=clock]");
    expect(card).toHaveAttribute("data-swipe-follow");
    expect(card).toHaveAttribute("data-swipe-act", "closeCard");
    const closed = act(recents.state, "closeCard", { r: "clock" }).state;
    expect(closed.recents).not.toContain("clock");
  });

  it("iPhone: holding the bottom line opens the open apps (openRecents)", () => {
    const c = draw(clock, "ios");
    expect(c.querySelector(".homeind")).toHaveAttribute("data-long", "openRecents");
    expect(act(clock, "openRecents", {}, "ios").state.scr).toBe("recents");
  });

  it("other apps: camera view, and a simple screen with the app's name", () => {
    expectParts(draw(act(home, "open", { app: "camera" }).state, "android"), [".camview", ".shutter"]);
    draw(act(home, "open", { app: "weather" }, "ios").state, "ios");
    expect(screen.getAllByText("Weather").length).toBeGreaterThan(0);
  });
});
