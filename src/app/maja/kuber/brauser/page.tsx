import { TopBar } from "@/components/ui";
import { RequireOs } from "@/features/os";

/* Placeholder – the Küberbrauser room is built in #26 and #27. */
export default function BrowserRoomPage() {
  return (
    <RequireOs>
      <TopBar title="Küberturvalisus · Küberbrauser" />
      <main style={{ padding: 24 }}>
        <h1>Küberbrauser</h1>
      </main>
    </RequireOs>
  );
}
