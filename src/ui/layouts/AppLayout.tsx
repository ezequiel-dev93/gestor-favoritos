import  AsidePanel  from "@/ui/components/AsidePanel";

export function AppLayout() {
  return (
    <main className="overflow-hidden text-zinc-800 dark:text-zinc-100 h-full w-auto">
      <AsidePanel />
    </main>
  );
}
