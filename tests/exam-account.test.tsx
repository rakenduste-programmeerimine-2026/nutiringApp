import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import type { ReactElement } from "react";
import { beforeEach, expect, it, vi } from "vitest";
import { OS_STORAGE_KEY, OsProvider } from "@/features/os";
import { LoginForm } from "@/features/exam/LoginForm";
import { RegisterForm } from "@/features/exam/RegisterForm";
import { StartScreen } from "@/features/exam/StartScreen";
import { WriteDownScreen } from "@/features/exam/WriteDownScreen";
import { ExamPage } from "@/features/exam/ExamPage";
import {
  readPendingAccount,
  savePendingAccount,
} from "@/features/exam/pending-account";

const push = vi.fn();
const replace = vi.fn();
const refresh = vi.fn();
/* Real Next returns the same router object on every render; keep that here. */
const router = { push, replace, refresh };
vi.mock("next/navigation", () => ({
  useRouter: () => router,
}));

const register = vi.fn();
const login = vi.fn();
const logout = vi.fn();
vi.mock("@/app/eksam/actions", () => ({
  register: (...args: unknown[]) => register(...args),
  login: (...args: unknown[]) => login(...args),
  logout: () => logout(),
}));

beforeEach(() => {
  push.mockClear();
  replace.mockClear();
  register.mockReset();
  login.mockReset();
  logout.mockReset();
  window.sessionStorage.clear();
  window.sessionStorage.setItem(OS_STORAGE_KEY, "android");
});

const renderPage = (ui: ReactElement) => render(<OsProvider>{ui}</OsProvider>);

const type = (label: string | RegExp, value: string) =>
  fireEvent.change(screen.getByLabelText(label), { target: { value } });

it("start page offers creating an account or logging in", async () => {
  renderPage(<StartScreen />);
  expect(
    await screen.findByText(/Tulemuste nägemiseks on vaja kontot/),
  ).toBeInTheDocument();
  expect(screen.getByRole("link", { name: "Loo konto" })).toHaveAttribute(
    "href",
    "/eksam/registreeri",
  );
  expect(screen.getByRole("link", { name: "Logi sisse" })).toHaveAttribute(
    "href",
    "/eksam/logi-sisse",
  );
});

it("register page warns about real names and shows the yellow box", async () => {
  renderPage(<RegisterForm />);
  expect(
    await screen.findByText("Ära kasuta oma päris nime. Mõtle välja hüüdnimi."),
  ).toBeInTheDocument();
  expect(
    screen.getByText(/Kirjuta kasutajanimi ja PIN kindlasti üles/),
  ).toBeInTheDocument();
  expect(
    screen.getByText(/Unustatud PIN-i ei saa taastada/),
  ).toBeInTheDocument();
  expect(screen.getByText("3 kuud")).toBeInTheDocument();
});

it("register inputs have connected labels", async () => {
  renderPage(<RegisterForm />);
  expect(await screen.findByLabelText("Kasutajanimi")).toHaveAttribute(
    "id",
    "username",
  );
  expect(screen.getByLabelText(/^PIN/)).toHaveAttribute("id", "pin");
  expect(screen.getByLabelText("Korda PIN-i")).toHaveAttribute(
    "id",
    "pin-repeat",
  );
});

it("register shows an Estonian message when the PINs do not match", async () => {
  renderPage(<RegisterForm />);
  await screen.findByLabelText("Kasutajanimi");
  type("Kasutajanimi", "kass");
  type(/^PIN/, "123456");
  type("Korda PIN-i", "654321");
  fireEvent.click(screen.getByRole("button", { name: "Loo konto" }));
  expect(await screen.findByRole("alert")).toHaveTextContent(
    "PIN-koodid ei ühti.",
  );
  expect(register).not.toHaveBeenCalled();
});

it("register rejects a PIN that is too short", async () => {
  renderPage(<RegisterForm />);
  await screen.findByLabelText("Kasutajanimi");
  type("Kasutajanimi", "kass");
  type(/^PIN/, "123");
  type("Korda PIN-i", "123");
  fireEvent.click(screen.getByRole("button", { name: "Loo konto" }));
  expect(await screen.findByRole("alert")).toHaveTextContent(/6–20 numbrit/);
});

it("register shows the backend error", async () => {
  register.mockResolvedValue({
    ok: false,
    error: "See kasutajanimi on juba võetud.",
  });
  renderPage(<RegisterForm />);
  await screen.findByLabelText("Kasutajanimi");
  type("Kasutajanimi", "kass");
  type(/^PIN/, "123456");
  type("Korda PIN-i", "123456");
  fireEvent.click(screen.getByRole("button", { name: "Loo konto" }));
  expect(await screen.findByRole("alert")).toHaveTextContent(
    "See kasutajanimi on juba võetud.",
  );
  expect(push).not.toHaveBeenCalled();
});

it("after registering the user goes to the write-down screen", async () => {
  register.mockResolvedValue({ ok: true });
  renderPage(<RegisterForm />);
  await screen.findByLabelText("Kasutajanimi");
  type("Kasutajanimi", " kass ");
  type(/^PIN/, "123456");
  type("Korda PIN-i", "123456");
  fireEvent.click(screen.getByRole("button", { name: "Loo konto" }));
  await waitFor(() => expect(push).toHaveBeenCalledWith("/eksam/ule-kirjuta"));
  expect(register).toHaveBeenCalledWith("kass", "123456", "123456");
  expect(readPendingAccount()).toEqual({ username: "kass", pin: "123456" });
});

it("write-down screen shows username and PIN, then continues and forgets them", async () => {
  savePendingAccount({ username: "kass", pin: "123456" });
  renderPage(<WriteDownScreen />);
  expect(
    await screen.findByRole("heading", { name: "Kirjuta see üles" }),
  ).toBeInTheDocument();
  expect(screen.getByTestId("written-username")).toHaveTextContent("kass");
  expect(screen.getByTestId("written-pin")).toHaveTextContent("123456");
  fireEvent.click(screen.getByRole("button", { name: "Kirjutasin üles" }));
  expect(push).toHaveBeenCalledWith("/eksam/teemad");
  expect(readPendingAccount()).toBeNull();
});

it("write-down screen without a new account sends the user to register", async () => {
  renderPage(<WriteDownScreen />);
  await waitFor(() =>
    expect(replace).toHaveBeenCalledWith("/eksam/registreeri"),
  );
  expect(screen.queryByText("Kirjutasin üles")).not.toBeInTheDocument();
});

it("login has a link to create an account and no forgot-PIN link", async () => {
  renderPage(<LoginForm />);
  expect(
    await screen.findByRole("link", { name: "Mul ei ole kontot – loo konto" }),
  ).toHaveAttribute("href", "/eksam/registreeri");
  expect(screen.queryByText(/unustasin/i)).not.toBeInTheDocument();
});

it("login shows the lockout message from the backend", async () => {
  login.mockResolvedValue({
    ok: false,
    error: "Konto on lukustatud. Proovi uuesti 15 min pärast.",
  });
  renderPage(<LoginForm />);
  await screen.findByLabelText("Kasutajanimi");
  type("Kasutajanimi", "kass");
  type("PIN", "123456");
  fireEvent.click(screen.getByRole("button", { name: "Logi sisse" }));
  expect(await screen.findByRole("alert")).toHaveTextContent(
    "Konto on lukustatud",
  );
});

it("successful login goes to the topics page", async () => {
  login.mockResolvedValue({ ok: true });
  renderPage(<LoginForm />);
  await screen.findByLabelText("Kasutajanimi");
  type("Kasutajanimi", "kass");
  type("PIN", "123456");
  fireEvent.click(screen.getByRole("button", { name: "Logi sisse" }));
  await waitFor(() => expect(push).toHaveBeenCalledWith("/eksam/teemad"));
  expect(login).toHaveBeenCalledWith("kass", "123456");
});

it("pages for logged-in users have a log out button", async () => {
  logout.mockResolvedValue(undefined);
  renderPage(
    <ExamPage title="Eksam" showLogout>
      <p>sisu</p>
    </ExamPage>,
  );
  fireEvent.click(await screen.findByRole("button", { name: "Logi välja" }));
  await waitFor(() => expect(push).toHaveBeenCalledWith("/eksam"));
  expect(logout).toHaveBeenCalled();
});

it("account pages have no log out button", async () => {
  renderPage(<StartScreen />);
  await screen.findByText(/Tulemuste nägemiseks/);
  expect(
    screen.queryByRole("button", { name: "Logi välja" }),
  ).not.toBeInTheDocument();
});
