import { useState } from "react";
import { motion } from "framer-motion";
import { FiEdit3, FiX, FiPlus } from "react-icons/fi";
import type { FolderNode } from "@/core/favorites/entities/FolderNode";
import type { Favorite } from "@/core/favorites/entities/Favorite";
import { AddFavoriteModal } from "@/ui/features/AddFavoriteModal/AddFavoriteModal";
import { useFavoritesStore } from "@/ui/hooks/useFavoritesStore";
import { notifySuccess, notifyError } from "@/core/utils/notify";

interface FolderCardProps {
  folder: FolderNode;
  /** Ruta de carpetas padre (para carpetas anidadas) */
  path?: string[];
  favorites: Favorite[];
  onUpdateName?: (path: string[], newName: string) => Promise<void>;
  onDeleteFolder: (path: string[]) => Promise<void>;
  onFavoriteAdded: () => void;
}

/**
 * FolderCard — SRP: renderiza una carpeta con su lista de favoritos.
 * No sabe nada del layout global ni de cómo se cargan los datos.
 */
export function FolderCard({
  folder,
  path = [],
  favorites,
  onUpdateName,
  onDeleteFolder,
  onFavoriteAdded,
}: FolderCardProps) {
  const deleteFavorite = useFavoritesStore((s) => s.deleteFavorite);

  const [isEditingFolder, setIsEditingFolder]   = useState(false);
  const [newFolderName, setNewFolderName]       = useState(folder.name);
  const [showAddFavorite, setShowAddFavorite]   = useState(false);

  const currentPath   = [...path, folder.name];
  const folderPathStr = currentPath.join("/");
  const folderFavorites = favorites.filter((f) => f.folder === folderPathStr);

  const handleRenameFolder = async () => {
    const trimmed = newFolderName.trim();
    if (!trimmed || trimmed === folder.name) {
      setIsEditingFolder(false);
      setNewFolderName(folder.name);
      return;
    }
    try {
      await onUpdateName?.(currentPath, trimmed);
      notifySuccess("Carpeta renombrada");
      setIsEditingFolder(false);
    } catch {
      notifyError("Error al renombrar carpeta");
      setNewFolderName(folder.name);
    }
  };

  const handleDeleteFavorite = async (id: string, title: string) => {
    try {
      await deleteFavorite(id);
      notifySuccess(`"${title}" eliminado`);
    } catch {
      notifyError("No se pudo eliminar el favorito");
    }
  };

  return (
    <>
      <motion.article
        layout
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="bg-zinc-50 dark:bg-zinc-800/60 rounded-xl border border-zinc-200 dark:border-zinc-700 p-4 flex flex-col gap-3 group"
      >
        {/* ── Encabezado de carpeta ─────────────────────────── */}
        <div className="flex items-center justify-between gap-2 min-h-[24px]">
          {isEditingFolder ? (
            <input
              autoFocus
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleRenameFolder();
                if (e.key === "Escape") {
                  setIsEditingFolder(false);
                  setNewFolderName(folder.name);
                }
              }}
              onBlur={handleRenameFolder}
              className="flex-1 text-sm font-bold bg-transparent border-b border-purple-500 focus:outline-none text-zinc-800 dark:text-zinc-100 pb-0.5"
              aria-label="Editar nombre de carpeta"
            />
          ) : (
            <h2 className="text-sm font-bold text-zinc-700 dark:text-zinc-200 truncate flex-1 select-none">
              {folder.name}
            </h2>
          )}

          {/* Acciones — visibles al hacer hover en la card */}
          {!isEditingFolder && (
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => setShowAddFavorite(true)}
                aria-label={`Agregar favorito a ${folder.name}`}
                title="Agregar favorito"
                className="p-1 text-zinc-400 hover:text-purple-500 transition-colors"
              >
                <FiPlus size={13} />
              </button>
              <button
                onClick={() => setIsEditingFolder(true)}
                aria-label={`Renombrar ${folder.name}`}
                title="Renombrar carpeta"
                className="p-1 text-zinc-400 hover:text-blue-500 transition-colors"
              >
                <FiEdit3 size={12} />
              </button>
              <button
                onClick={() => onDeleteFolder(currentPath)}
                aria-label={`Eliminar ${folder.name}`}
                title="Eliminar carpeta"
                className="p-1 text-zinc-400 hover:text-red-500 transition-colors"
              >
                <FiX size={13} />
              </button>
            </div>
          )}
        </div>

        {/* ── Lista de favoritos ────────────────────────────── */}
        <ul className="flex flex-col gap-1.5" role="list" aria-label={`Favoritos en ${folder.name}`}>
          {folderFavorites.length === 0 ? (
            <li className="text-xs text-zinc-400 italic">Sin favoritos aún</li>
          ) : (
            folderFavorites.map((fav) => (
              <li key={fav.id} className="flex items-center gap-2 group/fav min-w-0">
                <img
                  src={`https://www.google.com/s2/favicons?domain=${encodeURIComponent(fav.url)}&sz=16`}
                  alt=""
                  aria-hidden="true"
                  className="size-4 shrink-0 rounded-sm"
                />
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
                  onClick={() => handleDeleteFavorite(fav.id, fav.title)}
                  aria-label={`Eliminar ${fav.title}`}
                  className="p-0.5 text-zinc-300 hover:text-red-500 opacity-0 group-hover/fav:opacity-100 transition-opacity shrink-0"
                >
                  <FiX size={11} />
                </button>
              </li>
            ))
          )}
        </ul>

        {/* ── Sub-carpetas (recursivo) ──────────────────────── */}
        {folder.children && folder.children.length > 0 && (
          <div className="flex flex-col gap-2 pl-3 border-l-2 border-zinc-200 dark:border-zinc-700 mt-1">
            {folder.children.map((child) => (
              <FolderCard
                key={[...currentPath, child.name].join("/")}
                folder={child}
                path={currentPath}
                favorites={favorites}
                onUpdateName={onUpdateName}
                onDeleteFolder={onDeleteFolder}
                onFavoriteAdded={onFavoriteAdded}
              />
            ))}
          </div>
        )}
      </motion.article>

      {/* Modal para agregar favorito a esta carpeta específica */}
      <AddFavoriteModal
        url=""
        folder={currentPath}
        open={showAddFavorite}
        onClose={() => setShowAddFavorite(false)}
        onSave={() => {
          setShowAddFavorite(false);
          onFavoriteAdded();
        }}
      />
    </>
  );
}
