import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, expect, it, vi } from "vitest";
import VillagePage from "@/app/kula/page";
import { OS_STORAGE_KEY, OsProvider } from "@/features/os";

const push = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push, replace: vi.fn() }),
}));

beforeEach(() => {
  push.mockClear();
  window.sessionStorage.clear();
});

const renderVillage = (os: "android" | "ios") => {
  window.sessionStorage.setItem(OS_STORAGE_KEY, os);
  render(
    <OsProvider>
      <VillagePage />
    </OsProvider>,
  );
};

it("greets the user and shows the chosen system", async () => {
  renderVillage("ios");
  expect(
    await screen.findByRole("heading", { name: /Tere tulemast Nutikülla!/ }),
  ).toBeInTheDocument();
  expect(screen.getByText("iPhone")).toBeInTheDocument();
});

it("links the four houses in order to their pages", async () => {
  renderVillage("android");
  await screen.findByRole("heading", { name: /Tere tulemast/ });
  const expected = [
    ["Avaekraan", "/maja/avaekraan"],
    ["Sõnumid", "/maja/sonumid"],
    ["Küberturvalisus", "/maja/kuber"],
    ["Eksam", "/eksam"],
  ];
  const links = screen.getAllByRole("link");
  expect(links.map((l) => [l.getAttribute("aria-label"), l.getAttribute("href")])).toEqual(expected);
});

it("„Vaheta” goes back to the start page", async () => {
  renderVillage("android");
  fireEvent.click(await screen.findByRole("button", { name: "Vaheta" }));
  expect(push).toHaveBeenCalledWith("/");
});
