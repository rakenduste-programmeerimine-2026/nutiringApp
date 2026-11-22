import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { CALL_TASKS, CHECKLIST, PHONE_NUMBERS, SAFE_SMS, SCAM_SMS, WEB_TASKS, type CyberTask } from "@/content/cyber";
import { Checklist, TiiaTasks, VictimHelp, VICTIM_PATH } from "@/features/cyber";
import {
  isCorrect,
  isGoodSign,
  nextLabel,
  signLabel,
  signMarks,
  verdictText,
} from "@/features/cyber/answerFlow";
import { CALL_SECONDS } from "@/features/cyber/TaskViews";
import { ROUND_END_PATH } from "@/features/cyber/TiiaTasks";

const push = vi.fn();
const router = { push, replace: vi.fn(), refresh: vi.fn() };
vi.mock("next/navigation", () => ({ useRouter: () => router }));

const byKind = (list: CyberTask[], kind: CyberTask["kind"]) => list.find((t) => t.kind === kind)!;
const omniva = SCAM_SMS.find((t) => t.id === "omniva") ?? SCAM_SMS[0];
const monefit = SAFE_SMS.find((t) => t.signs.some((s) => s.tone === "warn"))!;
const serp = byKind(WEB_TASKS, "serp");
const bank = byKind(WEB_TASKS, "bank");
const call = CALL_TASKS[0];

const click = (name: string | RegExp) => fireEvent.click(screen.getByRole("button", { name }));
const card = () => screen.getByRole("region", { name: "Märk" });
const verdict = () => screen.getByRole("status");
const mood = () => screen.getByRole("img", { name: /^Tiia/ }).getAttribute("data-mood");
const answerButtons = () => screen.queryAllByRole("button", { name: /^(Kelmus|Pole kelmus|Võlts|Päris)$/ });
const marker = (ref: number) => screen.getByTestId("mini-phone").querySelector(`[data-s="${ref}"]`)!;

/** Click „Järgmine märk →” until the last sign of the task is shown. */
const stepToLastSign = (task: CyberTask) => {
  for (let i = 0; i < task.signs.length; i++) {
    const next = screen.queryByRole("button", { name: "Järgmine märk →" });
    if (!next) break;
    fireEvent.click(next);
  }
  expect(card()).toHaveTextContent(`${task.signs.length}/${task.signs.length}`);
};

beforeEach(() => {
  push.mockClear();
  window.scrollTo = vi.fn() as unknown as typeof window.scrollTo;
});

afterEach(() => {
  vi.useRealTimers();
});

describe("answer rules", () => {
  it("checks the answer against the task", () => {
    expect(isCorrect(omniva, "scam")).toBe(true);
    expect(isCorrect(omniva, "safe")).toBe(false);
    expect(isCorrect(serp, "real")).toBe(true);
    expect(isCorrect(serp, "fake")).toBe(false);
  });

  it("says what the right answer was", () => {
    expect(verdictText(omniva)).toBe("See sõnum on kelmus.");
    expect(verdictText(monefit)).toBe("See sõnum ei ole kelmus.");
    expect(verdictText(bank)).toBe("See veebileht on võlts.");
    expect(verdictText(call)).toBe("See kõne oli kelmus.");
    expect(verdictText(serp)).toBe("Õige on alumine tulemus.");
  });

  it("labels and colours the sign cards", () => {
    const plain = { ref: 1, title: "t", body: "b" };
    expect(signLabel(omniva, plain)).toBe("OHUMÄRK");
    expect(signLabel(monefit, plain)).toBe("MIKS SEE ON PÄRIS");
    expect(signLabel(omniva, { ...plain, tone: "warn" })).toBe("HOIATUS");
    expect(signLabel(omniva, { ...plain, tone: "tip" })).toBe("NÕUANNE");
    expect(signLabel(omniva, { ...plain, tone: "ok" })).toBe("TURVALINE");

    expect(isGoodSign(omniva, plain)).toBe(false);
    expect(isGoodSign(omniva, { ...plain, tone: "tip" })).toBe(true);
    expect(isGoodSign(monefit, plain)).toBe(true);
    expect(isGoodSign(monefit, { ...plain, tone: "warn" })).toBe(false);
  });

  it("keeps earlier signs highlighted and marks the current one", () => {
    const marks = signMarks(omniva, 1);
    const [first, second] = omniva.signs;
    expect(marks.get(first.ref)).toEqual({ ok: false, current: false });
    expect(marks.get(second.ref)).toEqual({ ok: false, current: true });
    expect(marks.size).toBe(2);
  });

  it("names the next step", () => {
    expect(nextLabel(omniva, 0, 0, 4)).toBe("Järgmine märk →");
    expect(nextLabel(omniva, omniva.signs.length - 1, 0, 4)).toBe("Järgmine ülesanne →");
    expect(nextLabel(call, call.signs.length - 1, 3, 4)).toBe("Vaata kokkuvõtet →");
  });
});

describe("after answering", () => {
  it("a right answer makes Tiia happy, shows the verdict and allows no retry", () => {
    render(<TiiaTasks os="android" tasks={[omniva]} />);
    expect(mood()).toBe("neutral");
    click("Kelmus");

    expect(mood()).toBe("happy");
    expect(screen.getByText("Aitäh! Hea, et sa mind aitasid.")).toBeInTheDocument();
    expect(verdict()).toHaveTextContent("Õige! See sõnum on kelmus.");
    expect(answerButtons()).toHaveLength(0);
  });

  it("a wrong answer makes Tiia worried", () => {
    render(<TiiaTasks os="android" tasks={[omniva]} />);
    click("Pole kelmus");
    expect(mood()).toBe("worried");
    expect(screen.getByText("Oi! Hea, et me selle koos läbi vaatame.")).toBeInTheDocument();
    expect(verdict()).toHaveTextContent("Vale vastus. See sõnum on kelmus.");
  });

  it("steps through the scam signs one by one in red", () => {
    render(<TiiaTasks os="android" tasks={[omniva, monefit]} />);
    const [first, second] = omniva.signs;
    expect(marker(first.ref)).not.toHaveAttribute("data-mark");

    click("Kelmus");
    expect(card()).toHaveTextContent(`OHUMÄRK 1/${omniva.signs.length}`);
    expect(within(card()).getByRole("heading", { name: first.title })).toBeInTheDocument();
    expect(card()).toHaveAttribute("data-tone", "bad");
    expect(marker(first.ref)).toHaveAttribute("data-mark", "bad");
    expect(marker(second.ref)).not.toHaveAttribute("data-mark");

    click("Järgmine märk →");
    expect(card()).toHaveTextContent(`OHUMÄRK 2/${omniva.signs.length}`);
    expect(marker(first.ref)).toHaveAttribute("data-mark", "bad");
    expect(marker(second.ref)).toHaveAttribute("data-mark", "bad");
    expect(marker(second.ref).className).toMatch(/current/);
    expect(marker(first.ref).className).not.toMatch(/current/);

    stepToLastSign(omniva);
    click("Järgmine ülesanne →");
    expect(screen.getByRole("progressbar", { name: "Ülesanne" })).toHaveAttribute("aria-valuenow", "2");
    expect(mood()).toBe("neutral");
    expect(answerButtons()).toHaveLength(2);
  });

  it("shows the signs of a real message in green, with a HOIATUS card for the warning", () => {
    render(<TiiaTasks os="android" tasks={[monefit]} />);
    click("Pole kelmus");
    expect(card()).toHaveTextContent("MIKS SEE ON PÄRIS 1/");
    expect(card()).toHaveAttribute("data-tone", "good");
    expect(marker(monefit.signs[0].ref)).toHaveAttribute("data-mark", "ok");

    const warnAt = monefit.signs.findIndex((s) => s.tone === "warn");
    for (let i = 0; i < warnAt; i++) click("Järgmine märk →");
    expect(card()).toHaveTextContent("HOIATUS");
    expect(card()).toHaveAttribute("data-tone", "bad");
  });

  it("search: tapping a result answers, and the last card is the Küberbrauser tip", () => {
    render(<TiiaTasks os="android" tasks={[serp]} />);
    const fake = screen.getAllByRole("button", { name: /cooppank\.ee/ })[0];
    fireEvent.click(fake);
    expect(verdict()).toHaveTextContent("Vale vastus. Õige on alumine tulemus.");
    expect(fake.className).toMatch(/picked/);
    expect(fake).toBeDisabled();

    const okAt = serp.signs.findIndex((s) => s.tone === "ok");
    for (let i = 0; i < okAt; i++) click("Järgmine märk →");
    expect(card()).toHaveTextContent("TURVALINE");
    expect(marker(serp.signs[okAt].ref)).toHaveAttribute("data-mark", "ok");

    stepToLastSign(serp);
    expect(card()).toHaveTextContent("NÕUANNE");
    expect(card()).toHaveTextContent("Küberbrauseri");
    expect(within(card()).getByText("Küberbrauseri").tagName).toBe("B");
  });

  it("call: lists the signs on the call screen as they are explained", () => {
    vi.useFakeTimers();
    render(<TiiaTasks os="android" tasks={[call]} />);
    click("Kuula kõnet");
    act(() => {
      vi.advanceTimersByTime(CALL_SECONDS * 1000);
    });
    click("Kelmus");
    const list = () => screen.getByRole("list", { name: "Ohumärgid kõnes" });
    expect(within(list()).getAllByRole("listitem")).toHaveLength(1);
    click("Järgmine märk →");
    expect(within(list()).getAllByRole("listitem").map((li) => li.textContent)).toEqual(
      call.signs.slice(0, 2).map((s) => s.title),
    );
  });

  it("after the 4th task goes to the checklist", () => {
    vi.useFakeTimers();
    render(<TiiaTasks os="android" tasks={[omniva, monefit, bank, call]} />);
    for (const [task, choice] of [
      [omniva, "Kelmus"],
      [monefit, "Pole kelmus"],
      [bank, "Võlts"],
    ] as const) {
      click(choice);
      stepToLastSign(task);
      click("Järgmine ülesanne →");
    }
    click("Kuula kõnet");
    act(() => {
      vi.advanceTimersByTime(CALL_SECONDS * 1000);
    });
    click("Kelmus");
    stepToLastSign(call);
    expect(push).not.toHaveBeenCalled();
    click("Vaata kokkuvõtet →");
    expect(push).toHaveBeenCalledWith(ROUND_END_PATH);
    expect(ROUND_END_PATH).toBe("/maja/kuber/kokkuvote");
  });
});

describe("end pages", () => {
  it("checklist: 9 questions, screenshot help for the chosen system, then onwards", () => {
    const { unmount } = render(<Checklist os="android" />);
    const list = screen.getByRole("region", { name: "Kas see võib olla kelmus?" });
    expect(within(list).getAllByRole("listitem").map((li) => li.textContent)).toEqual(CHECKLIST);
    expect(CHECKLIST).toHaveLength(9);
    expect(screen.getByRole("img", { name: /Android/ })).toBeInTheDocument();
    expect(screen.getByText(/toitenuppu/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Edasi →" })).toHaveAttribute("href", VICTIM_PATH);
    unmount();

    render(<Checklist os="ios" />);
    expect(screen.getByRole("img", { name: /iPhone/ })).toBeInTheDocument();
    expect(screen.getByText(/külgnuppu/)).toBeInTheDocument();
  });

  it("victim help: 4 steps, callable phone numbers and back to the village", () => {
    render(<VictimHelp />);
    expect(screen.getByRole("heading", { name: "Mis teha, kui oled petta saanud?" })).toBeInTheDocument();
    const steps = screen.getAllByRole("list")[0];
    expect(within(steps).getAllByRole("listitem")).toHaveLength(4);
    expect(screen.getByText("kelmused@politsei.ee").tagName).toBe("B");
    for (const c of PHONE_NUMBERS) {
      expect(screen.getByRole("link", { name: c.number })).toHaveAttribute("href", `tel:${c.number.replace(/\s/g, "")}`);
    }
    expect(screen.getByRole("link", { name: /Tagasi külasse/ })).toHaveAttribute("href", "/kula");
  });
});
