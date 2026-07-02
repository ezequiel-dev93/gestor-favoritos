import { useFavoritesStore } from "@/ui/hooks/useFavoritesStore";
import { Search, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function SearchInput() {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const searchFavorites = useFavoritesStore((s) => s.searchFavorites);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      searchFavorites(query);
    }, 200);
    return () => clearTimeout(delayDebounce);
  }, [query, searchFavorites]);

  useEffect(() => {
    if (isOpen) inputRef.current?.focus();
  }, [isOpen]);

  const handleClose = () => {
    setIsOpen(false);
    setQuery("");
  };

  return (
    <div className="relative flex items-center justify-end">
      {/* Input expandible hacia la izquierda */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: 200 }}
            exit={{ opacity: 0, width: 0 }}
            transition={{ duration: 0.22, ease: "easeInOut" }}
            className="absolute right-14 overflow-hidden"
          >
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none"
                size={14}
              />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Escape" && handleClose()}
                placeholder="Buscar favoritos..."
                className="w-full pl-8 pr-3 py-2.5 rounded-full bg-zinc-800 dark:bg-zinc-700 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-purple-500 shadow-lg"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Boton circular */}
      <button
        onClick={() => (isOpen ? handleClose() : setIsOpen(true))}
        className={[
          "flex items-center justify-center size-11 rounded-full shadow-lg hover:shadow-xl",
          "transition-all hover:scale-105 active:scale-95 cursor-pointer",
          isOpen
            ? "bg-purple-600 hover:bg-purple-500 text-white"
            : "bg-zinc-800 dark:bg-zinc-700 hover:bg-zinc-700 dark:hover:bg-zinc-600 text-zinc-100",
        ].join(" ")}
        aria-label={isOpen ? "Cerrar busqueda" : "Buscar favoritos"}
        title={isOpen ? "Cerrar" : "Buscar"}
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.span
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <X size={18} />
            </motion.span>
          ) : (
            <motion.span
              key="search"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <Search size={18} />
            </motion.span>
          )}
        </AnimatePresence>
      </button>
    </div>
  );
}
