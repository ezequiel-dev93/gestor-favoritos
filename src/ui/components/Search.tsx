import { useFavorites } from "@/ui/hooks/useFavorites";
import { Search } from "lucide-react";
import { useEffect, useState } from "react";

export function SearchInput() {
  const [query, setQuery] = useState("");
  const { searchFavorites } = useFavorites();

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      searchFavorites(query);
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [query]);

  return (
    <article className="relative w-full max-w-md">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
      <input
        type="text"
        placeholder="Buscar favoritos..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="w-full pl-10 pr-4 py-2 rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm text-zinc-800 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </article>
  );
}
