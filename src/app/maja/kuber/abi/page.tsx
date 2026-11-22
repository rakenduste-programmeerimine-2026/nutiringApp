import { TopBar } from "@/components/ui";
import { VictimHelp } from "@/features/cyber";
import { RequireOs } from "@/features/os";

export default function VictimHelpPage() {
  return (
    <RequireOs>
      <TopBar title="Küberturvalisus · Kui juhtus õnnetus" />
      <VictimHelp />
    </RequireOs>
  );
}
