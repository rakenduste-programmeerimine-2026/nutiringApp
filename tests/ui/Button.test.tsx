import { fireEvent, render, screen } from "@testing-library/react";
import { expect, it, vi } from "vitest";
import { Button } from "@/components/ui";

it("renders a clickable button", () => {
  const onClick = vi.fn();
  render(<Button onClick={onClick}>Edasi</Button>);
  fireEvent.click(screen.getByRole("button", { name: "Edasi" }));
  expect(onClick).toHaveBeenCalledOnce();
});

it("is type=button by default so it never submits a form by accident", () => {
  render(<Button>Edasi</Button>);
  expect(screen.getByRole("button")).toHaveAttribute("type", "button");
});

it("combines variant classes", () => {
  render(
    <Button variant="ghost" block small>
      Vali
    </Button>,
  );
  const cls = screen.getByRole("button").className;
  expect(cls).toMatch(/ghost/);
  expect(cls).toMatch(/block/);
  expect(cls).toMatch(/small/);
});
