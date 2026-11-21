"use client";

import { useOs, RequireOs } from "@/features/os";

/* Placeholder – the village is built in #9. */
export default function VillagePage() {
  return (
    <RequireOs>
      <VillagePlaceholder />
    </RequireOs>
  );
}

function VillagePlaceholder() {
  const { os } = useOs();
  return (
    <main style={{ padding: 24 }}>
      <h1>Tere tulemast Nutikülla!</h1>
      <p>Valitud: {os === "android" ? "Android" : "iPhone"}</p>
    </main>
  );
}
