import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { CALL_TASKS, SAFE_SMS, SCAM_SMS, WEB_TASKS, type CyberTask } from "@/content/cyber";
import type { OS } from "@/content/types";
import { CyberHouse, TiiaFace, TiiaTasks, parseSigns, plainText } from "@/features/cyber";
import { CALL_SECONDS, metaFor } from "@/features/cyber/TaskViews";
import { ROUND_END_PATH } from "@/features/cyber/TiiaTasks";

const push = vi.fn();
const router = { push, replace: vi.fn(), refresh: vi.fn() };
vi.mock("next/navigation", () => ({ useRouter: () => router }));

const byKind = (list: CyberTask[], kind: CyberTask["kind"]) => list.find((t) => t.kind === kind)!;
const scamSms = SCAM_SMS[0];
const safeSms = SAFE_SMS[0];
const serp = byKind(WEB_TASKS, "serp");
const bank = byKind(WEB_TASKS, "bank");
const call = CALL_TASKS[0];

const renderTasks = (tasks: CyberTask[], os: OS = "android") =>
  render(<TiiaTasks os={os} tasks={tasks} />);

const answerButtons = () => screen.queryAllByRole("button", { name: /^(Kelmus|Pole kelmus|Võlts|Päris)$/ });
const progress = () => screen.getByRole("progressbar", { name: "Ülesanne" });

beforeEach(() => {
  push.mockClear();
  // jsdom has no scrolling
  window.scrollTo = vi.fn() as unknown as typeof window.scrollTo;
});

afterEach(() => {
  vi.useRealTimers();
});

describe("house page", () => {
  it("links to both rooms", () => {
    render(<CyberHouse />);
    expect(screen.getByRole("heading", { name: "Küberturvalisuse maja" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Aita Tiiat" })).toHaveAttribute("href", "/maja/kuber/tiia");
    expect(screen.getByRole("link", { name: "Küberbrauser" })).toHaveAttribute("href", "/maja/kuber/brauser");
  });
});

describe("Tiia's face", () => {
  it.each([
    ["neutral", "Tiia"],
    ["happy", "Tiia on rõõmus"],
    ["worried", "Tiia on mures"],
  ] as const)("shows the %s mood", (mood, label) => {
    render(<TiiaFace mood={mood} />);
    expect(screen.getByRole("img", { name: label })).toHaveAttribute("data-mood", mood);
  });
});

describe("sign markers", () => {
  it("splits [[n|text]] markers from plain text", () => {
    expect(parseSigns("Tere [[2|kiiresti]] nüüd")).toEqual([
      { text: "Tere " },
      { text: "kiiresti", sign: 2 },
      { text: " nüüd" },
    ]);
    expect(plainText("[[1|Telegram]] kirjutas")).toBe("Telegram kirjutas");
  });

  it("marks signs in the message and shows addresses as links", () => {
    renderTasks([scamSms]);
    const phone = screen.getByTestId("mini-phone");
    const marked = phone.querySelectorAll("[data-s]");
    const refs = new Set(Array.from(marked, (el) => Number(el.getAttribute("data-s"))));
    for (const s of scamSms.signs.filter((s) => s.ref > 0)) expect(refs).toContain(s.ref);
    expect(within(phone).getByText("https://omneva.cc/ee")).toHaveClass(/link/);
    expect(phone.textContent).not.toContain("[[");
  });
});

describe("task views", () => {
  it("shows an SMS with sender, meta line and the scam / not scam buttons", () => {
    renderTasks([scamSms, safeSms]);
    const phone = screen.getByTestId("mini-phone");
    expect(within(phone).getByText("rexdpyegf@outlook.com")).toBeInTheDocument();
    expect(within(phone).getByText(scamSms.meta!)).toBeInTheDocument();
    expect(screen.getByText("Mulle tuli selline sõnum. Kas see on kelmus?")).toBeInTheDocument();
    expect(answerButtons().map((b) => b.textContent)).toEqual(["Kelmus", "Pole kelmus"]);
  });

  it("shows the meta line in English on iPhone", () => {
    expect(metaFor("ios", "Tekstsõnum · reede 12:53")).toBe("Text Message · Friday 12:53");
    expect(metaFor("android", "Tekstsõnum · reede 12:53")).toBe("Tekstsõnum · reede 12:53");
    renderTasks([safeSms], "ios");
    expect(screen.getByText(metaFor("ios", safeSms.meta!))).toBeInTheDocument();
  });

  it("shows two search results to tap instead of answer buttons", () => {
    renderTasks([serp, call]);
    const results = screen.getAllByRole("button", { name: /cooppank\.ee/ });
    expect(results).toHaveLength(2);
    expect(answerButtons()).toHaveLength(0);
    expect(screen.getByText("Vajuta tulemusele, millele Tiia peaks vajutama.")).toBeInTheDocument();
    expect(screen.getByText(serp.question!)).toBeInTheDocument();
  });

  it("shows the bank page with fake / real buttons", () => {
    renderTasks([bank]);
    expect(screen.getByText("https://jillniyomoto.com/seb/logon=set&3e9bdf4")).toBeInTheDocument();
    expect(screen.getByText("Login sisse")).toBeInTheDocument();
    expect(answerButtons().map((b) => b.textContent)).toEqual(["Võlts", "Päris"]);
  });

  it("shows the caller as on the chosen system", () => {
    const { unmount } = renderTasks([call], "android");
    expect(screen.getByText(call.caller!)).toBeInTheDocument();
    expect(screen.getByText(`${call.num} · kõne`)).toBeInTheDocument();
    unmount();
    renderTasks([call], "ios");
    expect(screen.getByText("Unknown Caller")).toBeInTheDocument();
    expect(screen.getByText(`${call.num} · mobile`)).toBeInTheDocument();
  });
});

describe("call", () => {
  it("shows the answer buttons only after the recording has been played", () => {
    vi.useFakeTimers();
    renderTasks([call]);
    expect(answerButtons()).toHaveLength(0);
    expect(screen.getByText("Vajuta ▶, et kõnet kuulata.")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Kuula kõnet" }));
    act(() => {
      vi.advanceTimersByTime((CALL_SECONDS - 1) * 1000);
    });
    expect(answerButtons()).toHaveLength(0);
    expect(screen.getByRole("progressbar", { name: "Kõne kulg" })).toHaveAttribute(
      "aria-valuenow",
      String(CALL_SECONDS - 1),
    );

    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(answerButtons().map((b) => b.textContent)).toEqual(["Kelmus", "Pole kelmus"]);
    expect(screen.getByText(`0:0${CALL_SECONDS}`)).toBeInTheDocument();
  });

  it("stops the timer when the page is left mid-call", () => {
    vi.useFakeTimers();
    const { unmount } = renderTasks([call]);
    fireEvent.click(screen.getByRole("button", { name: "Kuula kõnet" }));
    unmount();
    expect(vi.getTimerCount()).toBe(0);
  });
});

describe("round of four tasks", () => {
  it("goes through all four tasks and then back to the house", () => {
    vi.useFakeTimers();
    renderTasks([scamSms, safeSms, serp, call]);
    expect(progress()).toHaveAttribute("aria-valuenow", "1");

    fireEvent.click(screen.getByRole("button", { name: "Kelmus" }));
    expect(progress()).toHaveAttribute("aria-valuenow", "2");
    expect(screen.getByText("Nüüd tuli veel üks sõnum. Kas see on kelmus?")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Pole kelmus" }));
    expect(progress()).toHaveAttribute("aria-valuenow", "3");

    fireEvent.click(screen.getAllByRole("button", { name: /cooppank\.ee/ })[1]);
    expect(progress()).toHaveAttribute("aria-valuenow", "4");
    expect(answerButtons()).toHaveLength(0);

    fireEvent.click(screen.getByRole("button", { name: "Kuula kõnet" }));
    act(() => {
      vi.advanceTimersByTime(CALL_SECONDS * 1000);
    });
    expect(push).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "Kelmus" }));
    expect(push).toHaveBeenCalledWith(ROUND_END_PATH);
  });

  it("picks a fresh round of four when no tasks are given", () => {
    render(<TiiaTasks os="android" />);
    expect(progress()).toHaveAttribute("aria-valuemax", "4");
  });
});
