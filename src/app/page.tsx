"use client";

import { useRouter } from "next/navigation";
import { Button, Logo } from "@/components/ui";
import { useOs } from "@/features/os";
import type { OS } from "@/content/types";

/* Temporary start page for #8: lets you choose a system so the other
   pages can be reached. The designed start page comes in #9. */
export default function StartPage() {
  const { setOs } = useOs();
  const router = useRouter();

  const choose = (os: OS) => {
    setOs(os);
    router.push("/kula");
  };

  return (
    <main style={{ padding: 24, display: "grid", gap: 16, justifyItems: "center" }}>
      <div style={{ fontSize: 84 }}>
        <Logo />
      </div>
      <h1>Nutiküla</h1>
      <p>Aitame sul nutitelefoniga sõbraks saada.</p>
      <Button onClick={() => choose("android")}>Android</Button>
      <Button onClick={() => choose("ios")}>iPhone</Button>
    </main>
  );
}
