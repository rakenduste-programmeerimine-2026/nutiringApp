import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { OS } from "@/content/types";
import { homeModule, initialHome, type HomeState } from "@/features/home";

const act = (s: HomeState, action: string, data: Record<string, string> = {}, os: OS = "android") =>
  homeModule.act(s, action, data, os);
const draw = (s: HomeState, os: OS) => render(<div className={`phone ${os}`}>{homeModule.render(s, os)}</div>).container;
const setup = (name: string, os: OS = "android") => homeModule.setup!(initialHome(), name, os);
const shade = (c: HTMLElement) => c.querySelector(".shadewrap") as HTMLElement | null;

describe("opening a panel only by pulling the status bar down", () => {
  it("Android: the whole status bar pulls the notification panel (and follows the finger)", () => {
    const sb = draw(setup("sb:openNotif"), "android").querySelector(".sb");
    expect(sb).toHaveAttribute("data-swipe", "down");
    expect(sb).toHaveAttribute("data-swipe-act", "openNotif");
    expect(sb).toHaveAttribute("data-swipe-drag");
    expect(sb).not.toHaveAttribute("data-act"); // a tap does nothing
  });

  it("iPhone: left half = notifications, right half = Control Center", () => {
    expect(draw(setup("sb:openNotif", "ios"), "ios").querySelector(".sbl")).toHaveAttribute("data-swipe-act", "openNotif");
    expect(draw(setup("sb:openQS", "ios"), "ios").querySelector(".sbr")).toHaveAttribute("data-swipe-act", "openQS");
  });

  it("no panel without a pull; while pulling, the panel slides down with the finger", () => {
    const s = setup("sb:openNotif");
    expect(shade(draw(s, "android"))).toBeNull();
    const pulling = act(s, "swipeDrag", { dy: "120", swipeAct: "openNotif" }).state;
    expect(shade(draw(pulling, "android"))!.style.transform).toBe("translateY(calc(-100% + 120px))");
  });

  it("released far enough → open, the home screen stays underneath", () => {
    const open = act(setup("sb:openNotif"), "openNotif").state;
    expect(open.scr).toBe("notif");
    const c = draw(open, "android");
    expect(shade(c)!.style.transform).toBe("translateY(0px)");
    expect(c.querySelector(".home")).not.toBeNull();
  });
});

describe("notifications (lesson 3)", () => {
  const open = (os: OS = "android") => act(setup("sb:openNotif", os), "openNotif", {}, os).state;

  it("newest first, each with a time; the missed call can be swiped away", () => {
    const c = draw(open(), "android");
    const ids = [...c.querySelectorAll(".notif")].map((n) => n.getAttribute("data-n"));
    expect(ids).toEqual(["call", "weather", "msg"]);
    expect(c.querySelectorAll(".ntime")).toHaveLength(3);
    const call = c.querySelector(".notif[data-n=call]");
    expect(call).toHaveAttribute("data-swipe", "side");
    expect(call).toHaveAttribute("data-swipe-follow");
    expect(screen.getByText("Vastamata kõne")).toBeInTheDocument();
  });

  it("dismissing one removes it; „Kustuta kõik” removes the rest", () => {
    const one = act(open(), "dismiss", { n: "call" }).state;
    expect(one.notifs).toEqual(["msg", "weather"]);
    const none = act(one, "clearNotif").state;
    draw(none, "android");
    expect(screen.getByText("Teavitusi pole")).toBeInTheDocument();
  });

  it("iPhone texts are English: Missed Call, Clear All", () => {
    draw(open("ios"), "ios");
    expect(screen.getByText("Missed Call")).toBeInTheDocument();
    expect(screen.getByText("Clear All")).toBeInTheDocument();
  });

  it("Android: a handle at the bottom to push the panel up", () => {
    const handle = draw(open(), "android").querySelector(".shadehandle");
    expect(handle).toHaveAttribute("data-swipe", "up");
    expect(handle).toHaveAttribute("data-swipe-act", "navHome");
  });

  it("closing goes home (goHome) and the panel slides up before it disappears", () => {
    const r = act(open(), "navHome");
    expect(r.event).toBe("goHome");
    expect(r.state.scr).toBe("home");
    expect(r.state.shadeClosing).toBe("notif");
    expect(shade(draw(r.state, "android"))!.style.transform).toBe("translateY(-100%)");
    // the engine runs this later: the panel is then gone
    const after = r.effects![0];
    expect("after" in after && after.after).toBeGreaterThan(0);
    expect(after.apply(r.state).shadeClosing).toBe("");
  });
});

describe("quick settings / Control Center (lesson 4)", () => {
  const open = (os: OS = "android") => act(setup("sb:openQS", os), "openQS", {}, os).state;

  it("Android: tiles with Sees / Väljas and a horizontal brightness bar", () => {
    const c = draw(open(), "android");
    for (const k of ["wifi", "data", "torch", "silent", "rotate", "plane"]) {
      expect(c.querySelector(`[data-tile=${k}]`), k).not.toBeNull();
    }
    expect(c.querySelector("[data-tile=wifi]")).toHaveTextContent("Sees");
    expect(c.querySelector("[data-tile=torch]")).toHaveTextContent("Väljas");
    expect(c.querySelector(".t-bright [data-slide=h]")).not.toBeNull();
  });

  it("iPhone: English tiles and a vertical brightness bar", () => {
    const c = draw(open("ios"), "ios");
    expect(screen.getByText("Flashlight")).toBeInTheDocument();
    expect(c.querySelector(".t-bright")).toHaveAttribute("data-slide", "v");
  });

  it("the torch goes on and off (event tile:torch) and lights up the panel", () => {
    const on = act(open(), "tile", { tile: "torch" });
    expect(on.event).toBe("tile:torch");
    expect(on.state.qs.torch).toBe(true);
    expect(draw(on.state, "android").querySelector(".torchglow")).not.toBeNull();
    expect(act(on.state, "tile", { tile: "torch" }).state.qs.torch).toBe(false);
  });

  it("Android: a handle to push quick settings up and close them", () => {
    const handle = draw(open(), "android").querySelector(".shadehandle");
    expect(handle).toHaveAttribute("data-swipe", "up");
    expect(handle).toHaveAttribute("data-swipe-act", "navHome");
  });

  it("asks the engine to put the card at the far edge while quick settings are open", () => {
    const step = { type: "info" as const, text: "x" };
    expect(homeModule.cardAt!(open(), step, "android")).toBe("far");
    expect(homeModule.cardAt!(initialHome(), step, "android")).toBeUndefined();
  });

  it("dragging brightness changes it and dims the screen", () => {
    const darker = act(open(), "slide", { v: "30" }).state;
    expect(homeModule.check!(darker, { kind: "brightnessChanged", value: 15 }, "android")).toBe(true);
    const c = draw(darker, "android");
    expect(Number((c.querySelector(".dimmer") as HTMLElement).style.opacity)).toBeCloseTo(0.42);
  });
});
