"use client";

import { TopBar } from "@/components/ui";
import { TiiaTasks } from "@/features/cyber";
import { RequireOs, useOs } from "@/features/os";

function TiiaRoom() {
  const { os } = useOs();
  return os ? <TiiaTasks os={os} /> : null;
}

export default function TiiaPage() {
  return (
    <RequireOs>
      <TopBar title="Küberturvalisus · Aita Tiiat" />
      <TiiaRoom />
    </RequireOs>
  );
}
