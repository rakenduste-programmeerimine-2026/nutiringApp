import { render, screen, waitFor } from "@testing-library/react";
import { beforeEach, expect, it, vi } from "vitest";
import { OS_STORAGE_KEY, OsProvider, RequireOs } from "@/features/os";

const replace = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace, push: vi.fn() }),
}));

beforeEach(() => {
  replace.mockClear();
  window.sessionStorage.clear();
});

const page = (
  <OsProvider>
    <RequireOs>
      <p>Küla sisu</p>
    </RequireOs>
  </OsProvider>
);

it("sends the user to the start page when no system is chosen", async () => {
  render(page);
  await waitFor(() => expect(replace).toHaveBeenCalledWith("/"));
  expect(screen.queryByText("Küla sisu")).not.toBeInTheDocument();
});

it("shows the page when a system was chosen earlier in this tab", async () => {
  window.sessionStorage.setItem(OS_STORAGE_KEY, "android");
  render(page);
  expect(await screen.findByText("Küla sisu")).toBeInTheDocument();
  expect(replace).not.toHaveBeenCalled();
});

it("ignores an invalid saved value", async () => {
  window.sessionStorage.setItem(OS_STORAGE_KEY, "windows");
  render(page);
  await waitFor(() => expect(replace).toHaveBeenCalledWith("/"));
});
