import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, expect, it, vi } from "vitest";
import StartPage from "@/app/page";
import { OsProvider, OS_STORAGE_KEY } from "@/features/os";

const push = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push, replace: vi.fn() }),
}));

beforeEach(() => {
  push.mockClear();
  window.sessionStorage.clear();
});

it("shows the app name Nutiküla", () => {
  render(
    <OsProvider>
      <StartPage />
    </OsProvider>,
  );
  expect(screen.getByRole("heading", { name: "Nutiküla" })).toBeInTheDocument();
});

it("saves the chosen system for this tab and opens the village", () => {
  render(
    <OsProvider>
      <StartPage />
    </OsProvider>,
  );
  fireEvent.click(screen.getByRole("button", { name: "iPhone" }));
  expect(window.sessionStorage.getItem(OS_STORAGE_KEY)).toBe("ios");
  expect(push).toHaveBeenCalledWith("/kula");
});
