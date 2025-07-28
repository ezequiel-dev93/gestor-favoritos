import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { FiX, FiFolder } from "react-icons/fi";
import { Header } from "@/ui/components/Header";
import { Footer } from "@/ui/components/Footer";
import { SearchInput } from "@/ui/components/Search";
import { FolderSelector } from "@/ui/features/FolderSelector/FolderSelector";
import { FavoriteManager } from "@/pages/FavoriteManager";
import { useFolderContext } from "@/ui/features/FolderContext/useFolderContext";

export function AsidePanel() {
  const [open, setOpen] = useState(true);
  const { folders } = useFolderContext();
  const hasFavorites = true;

  const panelRef = useRef(null);

  const handleOutsideClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (panelRef.current && !(panelRef.current as any).contains(e.target)) {
      setOpen(false);
    }
  };

  return (
    open && (
      <section
        className="fixed inset-0 bg-black/30 z-40 flex items-start justify-center"
        onClick={handleOutsideClick}
      >
        <motion.section
          ref={panelRef}
          initial={{ y: "-100%", opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: "-100%", opacity: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
          className="bg-zinc-100 dark:bg-zinc-800 h-screen w-full max-w-[460px] shadow-lg relative overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >

          <button
            onClick={() => setOpen(false)}
            className="absolute top-4 right-4 z-10 w-8 h-8 bg-zinc-300 dark:bg-zinc-700 
            text-zinc-800 dark:text-zinc-200 rounded-full flex items-center justify-center shadow cursor-pointer"
          >
            <FiX size={18} />
          </button>

          <section className="flex flex-col h-full pt-16 pb-4">
            <section className="px-4">
              <Header />
            </section>

            <section className="flex-1 overflow-y-auto px-4 py-2 flex flex-col gap-4">
              <article>
                <SearchInput />
              </article>

              <section>
                <h3 className="text-xs font-bold text-zinc-500 dark:text-zinc-300 uppercase mt-4 mb-2 tracking-widest">
                  Carpetas
                </h3>

                {folders.length === 0 ? (
                  <div className="flex items-center gap-2 text-zinc-400 dark:text-zinc-300 text-sm px-2 py-1">
                    <FiFolder className="text-lg" />
                    <span>Sin carpetas</span>
                  </div>
                ) : (
                  <FolderSelector />
                )}
              </section>

              {hasFavorites && <FavoriteManager />}
            </section>

            <section className="p-2 border-t border-zinc-300 dark:border-zinc-700">
              <Footer />
            </section>
          </section>
        </motion.section>
      </section>
    )
  );
}
