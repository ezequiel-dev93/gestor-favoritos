import { useFavorites } from "@/ui/hooks/useFavorites";
import { Search, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function SearchInput() {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const { searchFavorites } = useFavorites();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      searchFavorites(query);
    }, 200);

    return () => clearTimeout(delayDebounce);
  }, [query]);

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    }
  }, [isOpen]);

  return (
    <article className="relative w-full max-w-md">
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="flex p-2 rounded-md hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors cursor-pointer"
        >
          <Search className="text-zinc-500 dark:text-zinc-400" size={20} />
        </button>
      )}

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, width: 0 }}
            animate={{ opacity: 1, scale: 1, width: "100%" }}
            exit={{ opacity: 0, scale: 0.95, width: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="w-full overflow-hidden"
          >
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar favoritos..."
                className=" pl-10 pr-10 py-2 rounded-md bg-zinc-200 dark:bg-zinc-700 text-sm placeholder:text-zinc-500 dark:placeholder:text-zinc-400 focus:outline-none focus:ring-2"
              />
              <button
                onClick={() => {
                  setIsOpen(false);
                  setQuery("");
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 "
              >
                <X size={16} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </article>
  );
}
