import { render, screen } from "@testing-library/react";
import { expect, it } from "vitest";
import { BackButton, TopBar } from "@/components/ui";

it("links back to the village by default", () => {
  render(<BackButton />);
  const link = screen.getByRole("link", { name: "Tagasi külasse" });
  expect(link).toHaveAttribute("href", "/kula");
});

it("has both the long and the short (phone) label", () => {
  render(<BackButton />);
  expect(screen.getByText("Tagasi külasse")).toBeInTheDocument();
  expect(screen.getByText("Küla")).toBeInTheDocument();
});

it("TopBar shows the back button and the title", () => {
  render(<TopBar title="Avaekraan" />);
  expect(screen.getByRole("link", { name: "Tagasi külasse" })).toBeInTheDocument();
  expect(screen.getByText("Avaekraan")).toBeInTheDocument();
});
