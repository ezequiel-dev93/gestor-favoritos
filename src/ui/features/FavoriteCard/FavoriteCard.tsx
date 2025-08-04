import { useState } from "react";
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import type { Favorite } from "@/core/favorites/entities/Favorite";
import { FiExternalLink, FiTrash2, FiEdit3 } from "react-icons/fi";
import { RxDragHandleDots2 } from "react-icons/rx";
import { useFavoritesStore } from "@/ui/hooks/useFavoritesStore";
import { motion } from "framer-motion";
import { toast } from "sonner";

interface Props {
  favorite: Favorite;
  isNew?: boolean;
}

export function FavoriteCard({ favorite, isNew = false }: Props) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: favorite.id,
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.5 : 1,
    cursor: "grab",
  };

  const updateFavoriteTitle = useFavoritesStore(s => s.updateFavoriteTitle);
  const deleteFavorite = useFavoritesStore(s => s.deleteFavorite);

  const [isEditing, setIsEditing] = useState(isNew);
  const [title, setTitle] = useState(favorite.title);

  const handleRename = async () => {
    if (title.trim() === "") {
      toast.error("El título no puede estar vacío");
      return;
    }
    await updateFavoriteTitle(favorite.id, title.trim());
    setIsEditing(false);
    toast.success("Título actualizado");
  };

  const handleDelete = async () => {
    await deleteFavorite(favorite.id);
    toast.success("Favorito eliminado");
  };

  return (
    <motion.section
      ref={setNodeRef}
      style={style}
      layout
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.95, opacity: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      className="select-none p-3 rounded-md shadow-sm bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-600 transition-all"
      {...listeners}
      {...attributes}
      role="listitem"
      tabIndex={0}
    >
      <section className="flex justify-between items-start gap-2">
        <article className="flex-1">
          {isEditing ? (
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={handleRename}
              onKeyDown={(e) => e.key === "Enter" && handleRename()}
              autoFocus
              aria-label="Editar título"
              className="w-full text-sm font-semibold text-blue-600 bg-transparent border-b border-blue-300 focus:outline-none focus:ring-0"
            />
          ) : (
            <p className="font-semibold text-sm text-blue-600 flex items-center gap-1">
              {favorite.title}
              <button
                onClick={() => setIsEditing(true)}
                title="Editar título"
                aria-label="Editar título"
              >
                <FiEdit3 className="text-zinc-400 hover:text-blue-500" />
              </button>
            </p>
          )}
        </article>

        <article className="flex items-center gap-2">
          <button
            onClick={handleDelete}
            title="Eliminar favorito"
            aria-label="Eliminar favorito"
          >
            <FiTrash2 className="text-red-500 hover:text-red-600" />
          </button>
          <RxDragHandleDots2
            className="text-zinc-400 text-lg"
            aria-hidden="true"
          />
        </article>
      </section>

      <a
        href={favorite.url}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-1 mt-1 text-xs text-gray-500 hover:underline"
        onKeyDown={(e) => {
          if (e.key === "Enter") window.open(favorite.url, "_blank", "noopener,noreferrer");
        }}
        tabIndex={0}
        role="link"
        aria-label={`Abrir ${favorite.title}`}
      >
        <FiExternalLink /> {favorite.url}
      </a>
    </motion.section>
  );
}
