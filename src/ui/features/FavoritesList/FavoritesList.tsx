import { useEffect } from "react";
import { useFavorites } from "@/ui/hooks/useFavorites";
import { FavoriteCard } from "@/ui/features/FavoriteCard/FavoriteCard";
import { motion, AnimatePresence } from "framer-motion";

export function FavoriteList() {
  const {
    favorites,
    isLoading,
    selectedFolder,
    loadAllFavorites,
    loadFavoritesByFolder,
  } = useFavorites();

  useEffect(() => {
    if (selectedFolder) {
      loadFavoritesByFolder();
    } else {
      loadAllFavorites();
    }
  }, [selectedFolder]);

  const shouldRender =
    isLoading || favorites.length > 0 || selectedFolder !== null;

  if (!shouldRender) return null;

  return (
    <section className="px-4 py-6">
      <h2 className="text-xl font-bold mb-4 text-zinc-800 dark:text-white">
        Favoritos
      </h2>

      {isLoading && (
        <p className="text-zinc-500 dark:text-zinc-400">Cargando favoritos...</p>
      )}

      {!isLoading && favorites.length === 0 && (
        <p className="text-zinc-500 italic dark:text-zinc-400">
          No hay favoritos en esta carpeta
        </p>
      )}

      <AnimatePresence>
        {!isLoading && favorites.length > 0 && (
          <motion.ul
            className="grid gap-4 sm:grid-cols-2 md:grid-cols-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {favorites.map((fav) => (
              <motion.li key={fav.id} layout>
                <FavoriteCard favorite={fav} />
              </motion.li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </section>
  );
}
