import { TopBar } from "@/components/ui";
import { CyberHouse } from "@/features/cyber";
import { RequireOs } from "@/features/os";

export default function CyberHousePage() {
  return (
    <RequireOs>
      <TopBar title="Küberturvalisus" />
      <CyberHouse />
    </RequireOs>
  );
}
