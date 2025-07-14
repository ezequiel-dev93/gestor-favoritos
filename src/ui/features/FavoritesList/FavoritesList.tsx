import { useEffect } from "react";
import { useFavorites } from "@/ui/hooks/useFavorites";
import { FavoriteCard } from "../FavoriteCard/FavoriteCard";

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

  return (
    <aside className="w-72 bg-white dark:bg-zinc-900 p-4 border-r border-zinc-200 dark:border-zinc-700 h-screen overflow-y-auto">
      <h2 className="text-xl font-bold mb-4 text-zinc-800 dark:text-white">Favoritos</h2>

      {isLoading && <p className="text-zinc-500">Cargando favoritos...</p>}

      {!isLoading && favorites.length === 0 && (
        <p className="text-zinc-500 italic">No hay favoritos en esta carpeta</p>
      )}

      {!isLoading && favorites.length > 0 && (
        <ul className="space-y-3">
          {favorites.map((fav) => (
            <li key={fav.id}>
              <FavoriteCard favorite={fav} />
            </li>
          ))}
        </ul>
      )}
    </aside>
  );
}
