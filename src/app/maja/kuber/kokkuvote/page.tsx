"use client";

import { TopBar } from "@/components/ui";
import { Checklist } from "@/features/cyber";
import { RequireOs, useOs } from "@/features/os";

function ChecklistForOs() {
  const { os } = useOs();
  return os ? <Checklist os={os} /> : null;
}

export default function ChecklistPage() {
  return (
    <RequireOs>
      <TopBar title="Küberturvalisus · Kokkuvõte" />
      <ChecklistForOs />
    </RequireOs>
  );
}
