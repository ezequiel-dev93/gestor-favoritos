import { FiFolder } from "react-icons/fi";
import type { Favorite } from "@/core/favorites/entities/Favorite";

/* FolderDragPreview — SRP: preview visual de una carpeta durante el drag. */
export function FolderDragPreview({ name }: { name: string }) {
  return (
    <div className="flex items-center gap-2 bg-zinc-50 dark:bg-zinc-800 rounded-xl border border-purple-400 px-3 py-2 shadow-2xl shadow-black/30 cursor-grabbing select-none">
      <FiFolder size={14} className="text-purple-500 shrink-0" />
      <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-200 truncate max-w-[160px]">
        {name}
      </span>
    </div>
  );
}

/* FavoriteDragPreview — SRP: preview visual de un favorito durante el drag. */
export function FavoriteDragPreview({ fav }: { fav: Favorite }) {
  return (
    <div className="flex items-center gap-2 bg-white dark:bg-zinc-800 rounded-lg border border-purple-400 px-2 py-1.5 shadow-2xl shadow-black/30 cursor-grabbing select-none max-w-[220px]">
      <img
        src={`https://www.google.com/s2/favicons?domain=${encodeURIComponent(fav.url)}&sz=16`}
        alt=""
        className="size-4 rounded-sm shrink-0"
      />
      <span className="text-sm text-zinc-700 dark:text-zinc-200 truncate">
        {fav.title}
      </span>
    </div>
  );
}
