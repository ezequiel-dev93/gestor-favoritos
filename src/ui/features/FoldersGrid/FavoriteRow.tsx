import { useState } from "react";
import { FiEdit3, FiX } from "react-icons/fi";
import { RxDragHandleDots2 } from "react-icons/rx";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useFavoritesStore } from "@/ui/hooks/useFavoritesStore";
import { notifySuccess, notifyError } from "@/core/utils/notify";
import type { Favorite } from "@/core/favorites/entities/Favorite";

interface FavoriteRowProps {
  fav: Favorite;
  onDelete: (id: string, title: string) => void;
}

/*
 - FavoriteRow — SRP: fila de favorito sortable con edicion inline del titulo.
 - Maneja su propio estado de edicion, el handle de drag y las acciones de
   guardar/cancelar. No conoce nada de carpetas ni del grid.
*/
export function FavoriteRow({ fav, onDelete }: FavoriteRowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: fav.id });

  const [isEditing, setIsEditing] = useState(false);
  const [newTitle, setNewTitle] = useState(fav.title);
  const updateFavoriteTitle = useFavoritesStore((s) => s.updateFavoriteTitle);

  const handleSave = async () => {
    const trimmed = newTitle.trim();
    if (!trimmed) {
      notifyError("El titulo no puede estar vacio");
      setNewTitle(fav.title);
      setIsEditing(false);
      return;
    }
    if (trimmed !== fav.title) {
      try {
        await updateFavoriteTitle(fav.id, trimmed);
        notifySuccess("Titulo actualizado");
      } catch {
        notifyError("No se pudo actualizar el titulo");
        setNewTitle(fav.title);
      }
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setNewTitle(fav.title);
    setIsEditing(false);
  };

  return (
    <li
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0 : 1,
      }}
      className="flex items-center gap-1.5 group/fav min-w-0"
      {...attributes}
    >

      <button
        {...listeners}
        aria-label="Arrastrar favorito"
        title="Arrastrar para reordenar"
        className="p-0.5 text-zinc-300 hover:text-zinc-500 dark:hover:text-zinc-400 cursor-grab active:cursor-grabbing opacity-0 group-hover/fav:opacity-100 transition-opacity shrink-0"
      >
        <RxDragHandleDots2 size={11} />
      </button>

      <img
        src={`https://www.google.com/s2/favicons?domain=${encodeURIComponent(fav.url)}&sz=16`}
        alt=""
        aria-hidden="true"
        className="size-4 shrink-0 rounded-sm"
      />

      {isEditing ? (
        <input
          autoFocus
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSave();
            if (e.key === "Escape") handleCancel();
          }}
          onBlur={handleSave}
          className="flex-1 text-sm bg-transparent border-b border-purple-500 focus:outline-none text-zinc-800 dark:text-zinc-100 pb-0.5 min-w-0"
          aria-label="Editar titulo del favorito"
        />
      ) : (
        <>
          <a
            href={fav.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-zinc-700 dark:text-zinc-300 hover:text-purple-500 dark:hover:text-purple-400 truncate flex-1 transition-colors"
            title={fav.url}
            aria-label={`Abrir ${fav.title}`}
          >
            {fav.title}
          </a>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsEditing(true);
            }}
            aria-label={`Editar ${fav.title}`}
            title="Editar nombre"
            className="p-0.5 text-zinc-300 hover:text-blue-500 opacity-0 group-hover/fav:opacity-100 transition-opacity shrink-0"
          >
            <FiEdit3 size={11} />
          </button>
          <button
            onClick={() => onDelete(fav.id, fav.title)}
            aria-label={`Eliminar ${fav.title}`}
            className="p-0.5 text-zinc-300 hover:text-red-500 opacity-0 group-hover/fav:opacity-100 transition-opacity shrink-0"
          >
            <FiX size={11} />
          </button>
        </>
      )}
    </li>
  );
}
