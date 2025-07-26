
import { useFavorites } from "@/ui/hooks/useFavorites";
import { useEffect } from "react";

interface Props {
  folder: string;
}

export function HoverFavoritesPreview({ folder }: Props) {
  const {
    favorites,
    setSelectedFolder,
    loadFavoritesByFolder,
    selectedFolder,
  } = useFavorites();

  useEffect(() => {
    setSelectedFolder(folder);
    loadFavoritesByFolder();
  }, [folder, selectedFolder]);;

  return (
    <article className="absolute left-[120px] top-0 z-50 w-[300px] bg-white dark:bg-zinc-800 rounded-lg shadow-xl p-4 space-y-2">
      <h4 className="text-sm font-semibold text-zinc-600 dark:text-zinc-300">
        Favoritos de {folder}
      </h4>
      {favorites.length === 0 && (
        <p className="text-zinc-400 italic">(Carpeta Vacia)</p>
      )}
      
      <ul className="space-y-1 max-h-60 overflow-y-auto pr-1">
        {favorites.map((fav) => (
          <li
            key={fav.id}
            className="flex items-center gap-2 text-sm hover:bg-zinc-100 dark:hover:bg-zinc-700 px-2 py-1 rounded transition"
          >
            <img
              src={`chrome://favicon/${fav.url}`}
              alt=""
              className="w-4 h-4"
            />
            <span className="truncate">{fav.title}</span>
          </li>
        ))}
      </ul>
    </article>
  );
}
