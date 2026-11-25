import { render } from "@testing-library/react";
import { expect, it } from "vitest";
import { RichText } from "@/features/lessons/RichText";

const html = (text: string) => render(<div data-testid="t"><RichText text={text} /></div>).container.innerHTML;

it("keeps the allowed formatting", () => {
  expect(html("Vajuta <b>OK</b>.")).toContain("Vajuta <b>OK</b>.");
  expect(html("Rida<br>teine")).toContain("Rida<br>teine");
  expect(html("<i>vaikne</i>")).toContain("<i>vaikne</i>");
  expect(html("<h3>Pealkiri</h3><p>Tekst</p>")).toContain("<h3>Pealkiri</h3><p>Tekst</p>");
});

it("supports nested tags", () => {
  expect(html("<p>See on <b>väga</b> tähtis</p>")).toContain("<p>See on <b>väga</b> tähtis</p>");
});

it("never runs other HTML – it is shown as text", () => {
  const out = html('<img src=x onerror="alert(1)"><script>alert(2)</script>');
  expect(out).not.toContain("<img");
  expect(out).not.toContain("<script");
  expect(out).toContain("&lt;img");
});

it("closes tags that were left open and ignores stray closing tags", () => {
  expect(html("<b>pool")).toContain("<b>pool</b>");
  expect(html("tekst</b>")).toContain("tekst");
});
