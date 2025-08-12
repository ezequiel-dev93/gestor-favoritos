import { useState } from "react";
import { FiEdit3 } from "react-icons/fi";
import { TfiTrash } from "react-icons/tfi";
import { useFavoritesStore } from "@/ui/hooks/useFavoritesStore";
import { notifySuccess, notifyError } from "@/core/utils/notify";

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
      notifyError("El título no puede estar vacío");
      return;
    }

    if (newTitle !== favorite.title) {
      updateFavoriteTitle(favorite.id, newTitle);
      notifySuccess("Título actualizado");
    }

    setIsEditing(false);
  };

  const handleDelete = async () => {
    try {
      await deleteFavorite(favorite.id);
      notifySuccess("Favorito eliminado");
    } catch (error) {
      notifyError("No se pudo eliminar el favorito");
      console.error(error);
    }
  };
 
  return (
    <section
      className="bg-white dark:bg-zinc-800 rounded-lg p-0.5 shadow transition-shadow hover:shadow-md focus-within:ring-2 focus-within:ring-blue-400 flex items-center gap-3"
    >
      <picture>
          <img
            src={`https://www.google.com/s2/favicons?domain=${encodeURIComponent(favorite.url)}`}
            alt="favicon"
            className="size-6 rounded"
            style={{ minWidth: 24, minHeight: 24 }}
          />
      </picture>

      <section className="flex-1">
        {isEditing ? (
          <article className="flex items-center gap-2">
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
          </article>
        ) : (
          <article className="flex items-center justify-between">
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
            </a>
            
            <div className="flex items-center gap-4">
              <button
                onClick={e => {
                  e.stopPropagation();
                  setIsEditing(true);
                }}
                title="Editar título"
                aria-label="Editar título"
                className="ml-2 cursor-pointer"
              >
                <FiEdit3 className="text-zinc-400 hover:text-blue-500" />
              </button>

              <button
                onClick={e => {
                  e.stopPropagation();
                  handleDelete();
                }}
                className="hover:text-red-600 cursor-pointer"
                title="Eliminar favorito"
                aria-label="Eliminar favorito"
              >
                <TfiTrash />
              </button>
            </div>
          </article>
        )}
      </section>
    </section>
  );
}
