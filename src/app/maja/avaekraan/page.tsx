import { TopBar } from "@/components/ui";
import { RequireOs } from "@/features/os";

/* Placeholder – the Home screen house is built in #12 and #13. */
export default function HomeScreenHousePage() {
  return (
    <RequireOs>
      <TopBar title="Avaekraan" />
      <main style={{ padding: 24 }}>
        <h1>Avaekraan</h1>
      </main>
    </RequireOs>
  );
}
