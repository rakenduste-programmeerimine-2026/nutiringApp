import { TopBar } from "@/components/ui";
import { RequireOs } from "@/features/os";

/* Placeholder – the Messages house is built in #14 and #15. */
export default function MessagesHousePage() {
  return (
    <RequireOs>
      <TopBar title="Sõnumid" />
      <main style={{ padding: 24 }}>
        <h1>Sõnumid</h1>
      </main>
    </RequireOs>
  );
}
