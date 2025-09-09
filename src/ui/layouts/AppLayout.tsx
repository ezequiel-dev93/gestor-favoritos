
import { useState } from "react";
import AsidePanel from "@/ui/components/AsidePanel";

export function AppLayout() {
  const [asideOpen, setAsideOpen] = useState(true);
  return (
    <main className="overflow-hidden text-zinc-800 dark:text-zinc-100 h-full w-auto">
      <AsidePanel open={asideOpen} onOpenChange={setAsideOpen} />
    </main>
  );
}
