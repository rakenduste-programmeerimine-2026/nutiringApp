import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AppIcon, NavBar, PhoneStage, StatusBar, appName, appNameForText } from "@/features/phone";

describe("StatusBar", () => {
  it("has the parts the status-bar lesson points at", () => {
    const { container } = render(<StatusBar os="android" notifs={["msg", "weather", "call"]} sound />);
    for (const sel of [".sb-time", ".sb-notifs", ".sb-sound", ".sb-signal", ".sb-wifi", ".sb-batt"]) {
      expect(container.querySelector(sel), sel).not.toBeNull();
    }
    expect(screen.getByText("10:24")).toBeInTheDocument();
    expect(screen.getByText("85%")).toBeInTheDocument();
  });

  it("iPhone: no notification icons and no battery percentage", () => {
    const { container } = render(<StatusBar os="ios" notifs={["msg"]} />);
    expect(container.querySelector(".sb-notifs")).toBeNull();
    expect(screen.queryByText("85%")).toBeNull();
  });

  it("adds swipe-down actions for the lesson engine", () => {
    const { container } = render(<StatusBar os="ios" swipe={{ left: "openNotif", right: "openQS" }} />);
    expect(container.querySelector(".sbl")).toHaveAttribute("data-swipe-act", "openNotif");
    expect(container.querySelector(".sbr")).toHaveAttribute("data-swipe", "down");
  });
});

describe("NavBar", () => {
  it("Android has three buttons ◀ ● ■", () => {
    const { container } = render(<NavBar os="android" />);
    expect(container.querySelector(".nav-back")).toHaveAttribute("data-act", "navBack");
    expect(container.querySelector(".nav-home")).toHaveAttribute("data-act", "navHome");
    expect(container.querySelector(".nav-recent")).toHaveAttribute("data-act", "navRecent");
  });

  it("iPhone has the home line: swipe up, optional long press", () => {
    const { container } = render(<NavBar os="ios" iosLongPress />);
    const line = container.querySelector(".homeind");
    expect(line).toHaveAttribute("data-swipe", "up");
    expect(line).toHaveAttribute("data-long", "openRecents");
    expect(container.querySelector(".navbar")).toBeNull();
  });
});

describe("apps", () => {
  it("Android names are Estonian, iPhone names English", () => {
    expect(appName("android", "browser")).toBe("Google Chrome");
    expect(appName("ios", "browser")).toBe("Safari");
    expect(appName("android", "camera")).toBe("Kaamera");
    expect(appName("ios", "camera")).toBe("Camera");
  });

  it("instruction texts name iPhone apps in English with the Estonian meaning", () => {
    expect(appNameForText("ios", "clock")).toBe("Clock (kell)");
    expect(appNameForText("android", "clock")).toBe("Kell");
    expect(appNameForText("ios", "browser")).toBe("Safari");
  });

  it("AppIcon has data-app and extra attributes", () => {
    const { container } = render(<AppIcon os="ios" app="settings" attrs={{ "data-act": "open" }} />);
    const el = container.querySelector("[data-app=settings]");
    expect(el).toHaveAttribute("data-act", "open");
    expect(screen.getByText("Settings")).toBeInTheDocument();
  });
});

describe("PhoneStage", () => {
  it("renders the phone in the chosen system's style", () => {
    render(<PhoneStage os="ios" screen={<p>ekraan</p>} guide={<p>juhend</p>} />);
    expect(screen.getByTestId("phone")).toHaveClass("phone", "ios");
    expect(screen.getByText("ekraan")).toBeInTheDocument();
    expect(screen.getByText("juhend")).toBeInTheDocument();
  });
});
