import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import type { ReactElement } from "react";
import { beforeEach, expect, it, vi } from "vitest";
import { EXAM } from "@/content/exam";
import type { OS } from "@/content/types";
import { ExamRunner } from "@/features/exam/ExamRunner";
import { TopicsScreen } from "@/features/exam/TopicsScreen";
import { resultMessage } from "@/features/exam/result";
import { OS_STORAGE_KEY, OsProvider } from "@/features/os";

const push = vi.fn();
const router = { push, replace: vi.fn(), refresh: vi.fn() };
vi.mock("next/navigation", () => ({ useRouter: () => router }));

const saveExamResult = vi.fn();
const getMyResults = vi.fn();
vi.mock("@/app/eksam/actions", () => ({
  saveExamResult: (...args: unknown[]) => saveExamResult(...args),
  getMyResults: () => getMyResults(),
  logout: vi.fn(),
}));

beforeEach(() => {
  push.mockClear();
  saveExamResult.mockReset();
  saveExamResult.mockResolvedValue({ ok: true, score: 0 });
  getMyResults.mockReset();
  getMyResults.mockResolvedValue([]);
  window.sessionStorage.clear();
});

const renderPage = (ui: ReactElement, os: OS = "android") => {
  window.sessionStorage.setItem(OS_STORAGE_KEY, os);
  return render(<OsProvider>{ui}</OsProvider>);
};

const text = (value: string | { android: string; ios: string }, os: OS) =>
  typeof value === "string" ? value : value[os];

/** Answer the whole exam; the first `right` questions correctly, the rest wrongly. */
async function takeExam(
  topic: "home" | "messages" | "cyber",
  right: number,
  os: OS = "android",
) {
  const questions = EXAM[topic];
  for (let i = 0; i < questions.length; i++) {
    const q = questions[i];
    await screen.findByText(`Küsimus ${i + 1}/${questions.length}`);
    const option = i < right ? q.answer : (q.answer + 1) % q.options.length;
    fireEvent.click(screen.getByText(text(q.options[option], os)));
    fireEvent.click(
      screen.getByRole("button", {
        name:
          i === questions.length - 1
            ? "Vaata tulemust →"
            : "Järgmine küsimus →",
      }),
    );
  }
}

it("topic page lists the three topics with 10 questions each", async () => {
  renderPage(<TopicsScreen />);
  for (const [name, href] of [
    ["Avaekraan", "/eksam/teemad/home"],
    ["Sõnumid", "/eksam/teemad/messages"],
    ["Küberturvalisus", "/eksam/teemad/cyber"],
  ]) {
    const link = await screen.findByRole("link", { name: new RegExp(name) });
    expect(link).toHaveAttribute("href", href);
    expect(link).toHaveTextContent("10 küsimust");
  }
  expect(
    screen.getByRole("button", { name: "Logi välja" }),
  ).toBeInTheDocument();
});

it("topic page shows the latest saved result per topic", async () => {
  getMyResults.mockResolvedValue([
    { topic: "messages", score: 7, created_at: "2026-11-22" },
  ]);
  renderPage(<TopicsScreen />);
  expect(await screen.findByText(/viimane tulemus 7\/10/)).toBeInTheDocument();
});

it("shows progress and the first question", async () => {
  renderPage(<ExamRunner topic="home" />);
  expect(await screen.findByText("Küsimus 1/10")).toBeInTheDocument();
  expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "1");
  expect(
    screen.getByText(text(EXAM.home[0].question, "android")),
  ).toBeInTheDocument();
});

it("a right answer shows „Õige!” with the explanation and the next button", async () => {
  renderPage(<ExamRunner topic="home" />);
  await screen.findByText("Küsimus 1/10");
  const q = EXAM.home[0];
  fireEvent.click(screen.getByText(text(q.options[q.answer], "android")));
  expect(screen.getByRole("status")).toHaveTextContent("Õige!");
  expect(screen.getByRole("status")).toHaveTextContent(
    text(q.explanation, "android"),
  );
  expect(
    screen.getByRole("button", { name: "Järgmine küsimus →" }),
  ).toBeInTheDocument();
});

it("a wrong answer shows „Vale vastus.” and locks the options", async () => {
  renderPage(<ExamRunner topic="home" />);
  await screen.findByText("Küsimus 1/10");
  const q = EXAM.home[0];
  fireEvent.click(
    screen.getByText(
      text(q.options[(q.answer + 1) % q.options.length], "android"),
    ),
  );
  expect(screen.getByRole("status")).toHaveTextContent("Vale vastus.");
  expect(screen.getByText(text(q.options[q.answer], "android"))).toBeDisabled();
});

it("questions follow the chosen system (Chrome vs Safari)", async () => {
  const q = EXAM.home[0];
  const answer = (os: OS) => text(q.explanation, os);
  expect(answer("android")).not.toBe(answer("ios"));
  renderPage(<ExamRunner topic="home" />, "ios");
  await screen.findByText("Küsimus 1/10");
  fireEvent.click(screen.getByText(text(q.options[q.answer], "ios")));
  expect(screen.getByRole("status")).toHaveTextContent(answer("ios"));
  expect(screen.getByRole("status")).not.toHaveTextContent("Chrome");
});

it("cyber questions show the SMS above the question", async () => {
  renderPage(<ExamRunner topic="cyber" />);
  await screen.findByText("Küsimus 1/10");
  const image = EXAM.cyber[0].image;
  expect(image?.kind).toBe("sms");
  if (image?.kind === "sms")
    expect(screen.getByText(image.from)).toBeInTheDocument();
});

it("10 right answers: 10/10, „Väga tubli!” and the result is saved", async () => {
  renderPage(<ExamRunner topic="home" />);
  await takeExam("home", 10);
  expect(await screen.findByText("10/10")).toBeInTheDocument();
  expect(screen.getByText("õiget vastust")).toBeInTheDocument();
  expect(screen.getByText("Väga tubli!")).toBeInTheDocument();
  await waitFor(() => expect(saveExamResult).toHaveBeenCalledTimes(1));
  const input = saveExamResult.mock.calls[0][0];
  expect(input.topic).toBe("home");
  expect(input.os).toBe("android");
  expect(input.answers).toEqual(EXAM.home.map((q) => q.answer));
});

it("6 right answers: „Hea töö!”", async () => {
  renderPage(<ExamRunner topic="messages" />);
  await takeExam("messages", 6);
  expect(await screen.findByText("6/10")).toBeInTheDocument();
  expect(screen.getByText("Hea töö!")).toBeInTheDocument();
});

it("2 right answers: „Harjuta veel!” with a link back to the house", async () => {
  renderPage(<ExamRunner topic="cyber" />);
  await takeExam("cyber", 2);
  expect(await screen.findByText("2/10")).toBeInTheDocument();
  expect(screen.getByText("Harjuta veel!")).toBeInTheDocument();
  expect(
    screen.getByRole("link", { name: /Mine majja „Küberturvalisus”/ }),
  ).toHaveAttribute("href", "/maja/kuber");
});

it("result buttons: try again, other topic, back to the village", async () => {
  renderPage(<ExamRunner topic="home" />);
  await takeExam("home", 10);
  await screen.findByText("10/10");
  expect(
    screen.getByRole("link", { name: "Vali teine teema" }),
  ).toHaveAttribute("href", "/eksam/teemad");
  // The top bar has a „Tagasi külasse” link too: both lead to the village.
  const villageLinks = screen.getAllByRole("link", { name: /Tagasi külasse/ });
  expect(villageLinks).toHaveLength(2);
  for (const link of villageLinks)
    expect(link).toHaveAttribute("href", "/kula");
  fireEvent.click(screen.getByRole("button", { name: "Proovi uuesti" }));
  expect(await screen.findByText("Küsimus 1/10")).toBeInTheDocument();
});

it("trying again saves the new result as a second attempt", async () => {
  renderPage(<ExamRunner topic="home" />);
  await takeExam("home", 10);
  await waitFor(() => expect(saveExamResult).toHaveBeenCalledTimes(1));
  fireEvent.click(await screen.findByRole("button", { name: "Proovi uuesti" }));
  await takeExam("home", 3);
  await waitFor(() => expect(saveExamResult).toHaveBeenCalledTimes(2));
});

it("shows a message when the result could not be saved", async () => {
  saveExamResult.mockResolvedValue({
    ok: false,
    error: "Tulemuse salvestamiseks pead olema sisse logitud.",
  });
  renderPage(<ExamRunner topic="home" />);
  await takeExam("home", 5);
  expect(await screen.findByRole("alert")).toHaveTextContent(
    "pead olema sisse logitud",
  );
});

it("result messages for every range", () => {
  for (const score of [8, 9, 10])
    expect(resultMessage(score, "X").title).toBe("Väga tubli!");
  for (const score of [5, 6, 7])
    expect(resultMessage(score, "X").title).toBe("Hea töö!");
  for (const score of [0, 1, 2, 3, 4])
    expect(resultMessage(score, "X").title).toBe("Harjuta veel!");
  expect(resultMessage(10, "X").revisitHouse).toBe(false);
  expect(resultMessage(7, "X").revisitHouse).toBe(true);
  expect(resultMessage(0, "Sõnumid").text).toContain("„Sõnumid”");
});
