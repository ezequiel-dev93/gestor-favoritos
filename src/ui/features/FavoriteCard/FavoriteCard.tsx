import { FiEdit3, FiTrash } from "react-icons/fi";
import { useState } from "react";
import { useFavoritesStore } from "@/ui/hooks/useFavoritesStore";
import { toast } from "sonner";

interface Favorite {
  id: string;
  title: string;
  url: string;
  folder?: string;
}

interface FavoriteCardProps {
  favorite: Favorite;
}

export function FavoriteCard({ favorite }: FavoriteCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [newTitle, setNewTitle] = useState(favorite.title);
  const updateFavoriteTitle = useFavoritesStore(s => s.updateFavoriteTitle);
  const deleteFavorite = useFavoritesStore(s => s.deleteFavorite);

  const handleEdit = () => {
    if (newTitle.trim() === "") {
      toast.error("El título no puede estar vacío");
      return;
    }

    if (newTitle !== favorite.title) {
      updateFavoriteTitle(favorite.id, newTitle);
      toast.success("Título actualizado");
    }

    setIsEditing(false);
  };

  const handleDelete = () => {
    deleteFavorite(favorite.id);
    toast.success("Favorito eliminado");
  };

  return (
    <article
      className="bg-white dark:bg-zinc-800 rounded-lg p-4 shadow transition-shadow hover:shadow-md focus-within:ring-2 focus-within:ring-blue-400 flex items-center gap-3"
    >
      <img
        src={`https://www.google.com/s2/favicons?domain=${encodeURIComponent(favorite.url)}`}
        alt="favicon"
        className="w-6 h-6 rounded"
        style={{ minWidth: 24, minHeight: 24 }}
      />

      <div className="flex-1">
        {isEditing ? (
          <div className="flex items-center gap-2">
            <input
              type="text"
              className="w-full rounded border border-zinc-300 dark:border-zinc-700 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleEdit();
                if (e.key === "Escape") {
                  setIsEditing(false);
                  setNewTitle(favorite.title);
                }
              }}
              aria-label="Editar título del favorito"
              autoFocus
            />
            <button
              onClick={handleEdit}
              className="text-sm text-blue-600 hover:underline"
              aria-label="Guardar título"
            >
              Guardar
            </button>
          </div>
        ) : (
          <a
            href={favorite.url}
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-sm text-white hover:underline flex items-center gap-1 focus:outline-none focus:ring-2 focus:ring-blue-400 rounded"
            aria-label={`Abrir ${favorite.title}`}
            onKeyDown={(e) => {
              if (e.key === "Enter") window.open(favorite.url, "_blank", "noopener,noreferrer");
            }}
            tabIndex={0}
            role="link"
          >
            {favorite.title}
            <button
              onClick={(e) => {
                e.preventDefault();
                setIsEditing(true);
              }}
              title="Editar título"
              aria-label="Editar título"
            >
              <FiEdit3 className="text-zinc-400 hover:text-blue-500" />
            </button>
          </a>
        )}

        <div className="mt-2 flex justify-between text-xs text-zinc-500 dark:text-zinc-400">
          <span className="truncate">{new URL(favorite.url).hostname}</span>
          <button
            onClick={handleDelete}
            className="hover:text-red-600"
            title="Eliminar favorito"
            aria-label="Eliminar favorito"
          >
            <FiTrash />
          </button>
        </div>
      </div>
    </article>
  );
}
