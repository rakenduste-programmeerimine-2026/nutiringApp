import { render, screen } from "@testing-library/react";
import { expect, it } from "vitest";
import Home from "@/app/page";

it("renders the app heading", () => {
  render(<Home />);
  expect(
    screen.getByRole("heading", { name: "nutiringApp" }),
  ).toBeInTheDocument();
});
