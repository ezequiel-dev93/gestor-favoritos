import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiFolder } from "react-icons/fi";
import { RxDragHandleDots2 } from "react-icons/rx";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { FolderNode } from "@/core/favorites/entities/FolderNode";
import type { Favorite } from "@/core/favorites/entities/Favorite";
import { AddFavoriteModal } from "@/ui/features/AddFavoriteModal/AddFavoriteModal";
import { useFavoritesStore } from "@/ui/hooks/useFavoritesStore";
import { notifySuccess, notifyError } from "@/core/utils/notify";
import { FavoriteRow } from "@/ui/features/FoldersGrid/FavoriteRow";
import { FolderInnerDropzone } from "@/ui/features/FoldersGrid/FolderInnerDropzone";
import { FolderMenu } from "@/ui/features/FoldersGrid/FolderMenu";

interface FolderCardProps {
  folder: FolderNode;
  path?: string[];
  favorites: Favorite[];
  onUpdateName?: (path: string[], newName: string) => Promise<void>;
  onDeleteFolder: (path: string[]) => Promise<void>;
  onFavoriteAdded: () => void;
}

/*
 - FolderCard — orquestador de una tarjeta de carpeta.
 - Compone: FolderMenu, FavoriteRow, FolderInnerDropzone y subcarpetas recursivas.
 - La logica de cada sub-pieza vive en su propio archivo (SRP).
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

  const isRootFolder = path.length === 0;
  const currentPath = [...path, folder.name];
  const folderPathStr = currentPath.join("/");
  const folderFavorites = favorites.filter((f) => f.folder === folderPathStr);
  const hasChildren = (folder.children?.length ?? 0) > 0;
  const isEmpty = folderFavorites.length === 0 && !hasChildren;

  const [isOpen, setIsOpen] = useState(isRootFolder);
  const [isEditingFolder, setIsEditingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState(folder.name);
  const [showAddFavorite, setShowAddFavorite] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const {
    attributes,
    listeners: dragListeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: folderPathStr });

  const sortableStyle: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0 : 1,
    zIndex: isDragging ? 50 : undefined,
  };

  const childrenIds = (folder.children ?? []).map((c) =>
    [...currentPath, c.name].join("/")
  );
  const favoriteIds = folderFavorites.map((f) => f.id);

  // Handlers

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

  const articleClass = isRootFolder
    ? "bg-zinc-50 dark:bg-zinc-800/60 rounded-xl border border-zinc-200 dark:border-zinc-700 p-4 flex flex-col gap-2 group"
    : "bg-zinc-100/60 dark:bg-zinc-700/40 rounded-lg border border-zinc-200/60 dark:border-zinc-600/50 p-2.5 flex flex-col gap-1.5 group";

  return (
    <>
      <motion.article
        ref={setNodeRef}
        style={sortableStyle}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.18 }}
        className={articleClass}
      >
        <section className="flex items-center gap-2 min-h-[24px]">
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
          ) : !isRootFolder ? (
            <button
              onClick={() => setIsOpen((prev) => !prev)}
              className="flex items-center gap-1.5 flex-1 min-w-0 text-left"
              aria-expanded={isOpen}
              aria-label={isOpen ? `Colapsar ${folder.name}` : `Expandir ${folder.name}`}
            >
              <FiFolder
                size={13}
                className={`shrink-0 transition-colors ${isOpen ? "text-purple-500" : "text-zinc-400"}`}
              />
              <h3 className="text-sm text-zinc-700 dark:text-zinc-200 truncate select-none">
                {folder.name}
              </h3>
            </button>
          ) : (
            <div className="flex items-center gap-1.5 flex-1 min-w-0">
              <FiFolder size={14} className="shrink-0 text-purple-500" />
              <h2 className="text-sm font-bold text-zinc-700 dark:text-zinc-200 truncate select-none">
                {folder.name}
              </h2>
            </div>
          )}

          {!isEditingFolder && (
            <div
              className={`flex items-center gap-1 transition-opacity ml-auto shrink-0 ${showMenu ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                }`}
            >
              <button
                {...dragListeners}
                {...attributes}
                aria-label="Arrastrar para reordenar o mover"
                title="Arrastrar"
                className="p-1.5 text-zinc-300 hover:text-zinc-600 dark:hover:text-zinc-300 cursor-grab active:cursor-grabbing transition-colors"
              >
                <RxDragHandleDots2 size={15} />
              </button>

              <FolderMenu
                showMenu={showMenu}
                onToggleMenu={() => setShowMenu((prev) => !prev)}
                onAddFavorite={() => {
                  setShowMenu(false);
                  setShowAddFavorite(true);
                }}
                onRename={() => {
                  setShowMenu(false);
                  setIsEditingFolder(true);
                }}
                onDelete={() => {
                  setShowMenu(false);
                  onDeleteFolder(currentPath);
                }}
              />
            </div>
          )}
        </section>

        <AnimatePresence initial={false}>
          {isOpen && (
            <motion.div
              key="content"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
              style={{ overflow: "hidden" }}
              className="flex flex-col gap-2"
            >
              {isEmpty && (
                <p className="text-xs text-zinc-400 italic mt-2">Sin favoritos aun</p>
              )}

              {hasChildren && (
                <SortableContext items={childrenIds} strategy={verticalListSortingStrategy}>
                  <div className="flex flex-col gap-1.5 mt-2">
                    {folder.children!.map((child) => (
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
                </SortableContext>
              )}

              {folderFavorites.length > 0 && (
                <SortableContext items={favoriteIds} strategy={verticalListSortingStrategy}>
                  <ul
                    className="flex flex-col gap-1.5 mt-2"
                    role="list"
                    aria-label={`Favoritos en ${folder.name}`}
                  >
                    {folderFavorites.map((fav) => (
                      <FavoriteRow
                        key={fav.id}
                        fav={fav}
                        onDelete={handleDeleteFavorite}
                      />
                    ))}
                  </ul>
                </SortableContext>
              )}

              <FolderInnerDropzone folderPathStr={folderPathStr} />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.article>

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
