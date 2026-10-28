import { useState } from "react";
import { FiEdit3, FiMove } from "react-icons/fi";
import { TfiTrash } from "react-icons/tfi";
import { useFavoritesStore } from "@/ui/hooks/useFavoritesStore";
import { notifySuccess, notifyError } from "@/core/utils/notify";
import type { Favorite } from "@/core/favorites/entities/Favorite";

interface FavoriteCardProps {
  favorite: Favorite;
  dragHandleProps?: any;
}

export function FavoriteCard({ favorite, dragHandleProps }: FavoriteCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [newTitle, setNewTitle] = useState(favorite.title);
  const updateFavoriteTitle = useFavoritesStore((s) => s.updateFavoriteTitle);
  const deleteFavorite = useFavoritesStore((s) => s.deleteFavorite);

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
      className="bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 rounded-lg px-2.5 py-1.5 shadow-sm transition-shadow hover:shadow-md focus-within:ring-2 focus-within:ring-cyan-400 flex items-center gap-2.5"
    >
      <button
        {...dragHandleProps}
        className="min-w-[24px] min-h-[24px] flex items-center justify-center rounded cursor-grab active:cursor-grabbing text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
        aria-label={`Arrastrar favorito ${favorite.title}`}
      >
        <FiMove aria-hidden="true" />
      </button>

      <picture className="shrink-0">
        <img
          src={`https://www.google.com/s2/favicons?domain=${encodeURIComponent(favorite.url)}`}
          alt=""
          aria-hidden="true"
          className="size-4 rounded-sm"
        />
      </picture>

      <section className="flex-1 min-w-0">
        {isEditing ? (
          <article className="flex items-center gap-2">
            <input
              type="text"
              className="w-full rounded border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-100 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400"
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
              className="text-sm text-cyan-600 dark:text-cyan-400 hover:underline px-2 py-1"
              aria-label="Guardar título"
            >
              Guardar
            </button>
          </article>
        ) : (
          <article className="flex items-center justify-between gap-2">
            <a
              href={favorite.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-zinc-800 dark:text-zinc-100 hover:text-cyan-600 dark:hover:text-cyan-400 hover:underline truncate flex-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 rounded"
              aria-label={`Abrir ${favorite.title}`}
            >
              {favorite.title}
            </a>

            <div className="flex items-center gap-1 shrink-0">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsEditing(true);
                }}
                title="Editar título"
                aria-label={`Editar título de ${favorite.title}`}
                className="min-w-[24px] min-h-[24px] flex items-center justify-center rounded text-zinc-400 hover:text-blue-500 cursor-pointer"
              >
                <FiEdit3 aria-hidden="true" />
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete();
                }}
                className="min-w-[24px] min-h-[24px] flex items-center justify-center rounded text-zinc-400 hover:text-red-500 cursor-pointer"
                title="Eliminar favorito"
                aria-label={`Eliminar favorito ${favorite.title}`}
              >
                <TfiTrash aria-hidden="true" />
              </button>
            </div>
          </article>
        )}
      </section>
    </section>
  );
}
