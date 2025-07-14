
import { Header } from "@/ui/components/Header"
import { Footer } from "@/ui/components/Footer";
import type { ReactNode } from "react";

interface Props {
  children: ReactNode;
}

export function AppLayout({ children }: Props) {
  return (
    <section  className="min-h-screen flex flex-col bg-zinc-50 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-100">
      <Header />

      <main className="flex-1 p-4">{children}</main>
      
      <Footer />
    </section>
  );
}
