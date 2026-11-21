import { createElement, Fragment, type ReactNode } from "react";

/* Safe display of lesson texts with simple formatting.
   Only these tags become real HTML elements; anything else (e.g. <script>,
   <img onerror=…>) is shown as plain text and can never run.
   To allow a new tag, add it here. */
const ALLOWED = ["b", "i", "p", "h3", "br"] as const;
type Tag = (typeof ALLOWED)[number];

const TAG_RE = new RegExp(`<(/?)(${ALLOWED.join("|")})\\s*/?>`, "gi");

type Node = { tag: Tag | null; children: (Node | string)[] };

/** Turn the text into a small tree of allowed tags and plain strings. */
export function parseRichText(text: string): Node {
  const root: Node = { tag: null, children: [] };
  const stack: Node[] = [root];
  let last = 0;

  for (const m of text.matchAll(TAG_RE)) {
    const top = stack[stack.length - 1];
    if (m.index! > last) top.children.push(text.slice(last, m.index));
    last = m.index! + m[0].length;

    const closing = m[1] === "/";
    const tag = m[2].toLowerCase() as Tag;
    if (tag === "br") {
      top.children.push({ tag: "br", children: [] });
    } else if (!closing) {
      const node: Node = { tag, children: [] };
      top.children.push(node);
      stack.push(node);
    } else {
      // close the nearest open tag with this name; ignore stray closing tags
      const i = stack.map((n) => n.tag).lastIndexOf(tag);
      if (i > 0) stack.length = i;
    }
  }
  if (last < text.length) stack[stack.length - 1].children.push(text.slice(last));
  return root;
}

function toReact(node: Node | string, key: number): ReactNode {
  if (typeof node === "string") return node;
  const children = node.children.map(toReact);
  if (node.tag === null) return createElement(Fragment, { key }, ...children);
  if (node.tag === "br") return createElement("br", { key });
  return createElement(node.tag, { key }, ...children);
}

/** Show a lesson text such as "Vajuta <b>OK</b>." safely. */
export function RichText({ text }: { text: string }) {
  return <>{toReact(parseRichText(text), 0)}</>;
}
