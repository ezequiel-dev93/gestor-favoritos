import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiEdit3, FiX, FiPlus, FiFolder, FiMoreVertical } from "react-icons/fi";
import { RxDragHandleDots2 } from "react-icons/rx";
import { useDroppable } from "@dnd-kit/core";
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

// SortableFavoriteRow - fila de favorito arrastrable dentro de una FolderCard

interface SortableFavoriteRowProps {
  fav: Favorite;
  onDelete: (id: string, title: string) => void;
}

function SortableFavoriteRow({ fav, onDelete }: SortableFavoriteRowProps) {
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
      notifyError("El título no puede estar vacío");
      setNewTitle(fav.title);
      setIsEditing(false);
      return;
    }
    if (trimmed !== fav.title) {
      try {
        await updateFavoriteTitle(fav.id, trimmed);
        notifySuccess("Título actualizado");
      } catch {
        notifyError("No se pudo actualizar el título");
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
          aria-label="Editar título del favorito"
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

function FolderInnerDropzone({ folderPathStr }: { folderPathStr: string }) {
  const { isOver, setNodeRef } = useDroppable({ id: `drop-inside-${folderPathStr}` });
  return (
    <div
      ref={setNodeRef}
      className={`mt-2 p-3 border-2 border-dashed rounded-lg text-center transition-colors ${isOver
        ? "border-purple-500 bg-purple-500/10 text-purple-600"
        : "border-transparent hover:border-zinc-300 dark:hover:border-zinc-700 text-zinc-400"
        }`}
    >
      <span className="text-xs font-medium">Soltar aquí para mover adentro</span>
    </div>
  );
}

// FolderCard
interface FolderCardProps {
  folder: FolderNode;
  path?: string[];
  favorites: Favorite[];
  onUpdateName?: (path: string[], newName: string) => Promise<void>;
  onDeleteFolder: (path: string[]) => Promise<void>;
  onFavoriteAdded: () => void;
}

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

  const [isOpen, setIsOpen] = useState(isRootFolder);
  const [isEditingFolder, setIsEditingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState(folder.name);
  const [showAddFavorite, setShowAddFavorite] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const currentPath = [...path, folder.name];
  const folderPathStr = currentPath.join("/");
  const folderFavorites = favorites.filter((f) => f.folder === folderPathStr);
  const hasChildren = (folder.children?.length ?? 0) > 0;
  const isEmpty = folderFavorites.length === 0 && !hasChildren;

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
            <div className={`flex items-center gap-1 transition-opacity ml-auto shrink-0 relative z-10 ${showMenu ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}>
              <button
                {...dragListeners}
                {...attributes}
                aria-label="Arrastrar para reordenar o mover"
                title="Arrastrar"
                className="p-1.5 text-zinc-300 hover:text-zinc-600 dark:hover:text-zinc-300 cursor-grab active:cursor-grabbing transition-colors"
              >
                <RxDragHandleDots2 size={15} />
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowMenu(!showMenu);
                }}
                title="Opciones de carpeta"
                className={`p-1.5 transition-colors rounded-md ${showMenu
                  ? "bg-zinc-200 dark:bg-zinc-700 text-zinc-800 dark:text-zinc-100"
                  : "text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300 hover:bg-zinc-200/50 dark:hover:bg-zinc-700/50"
                  }`}
              >
                <FiMoreVertical size={14} />
              </button>

              <AnimatePresence>
                {showMenu && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowMenu(false);
                      }}
                    />

                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: -5 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -5 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 top-full mt-1 w-44 bg-white dark:bg-zinc-800 rounded-lg shadow-xl border border-zinc-200 dark:border-zinc-700 z-50 overflow-hidden"
                    >
                      <div className="flex flex-col py-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowMenu(false);
                            setShowAddFavorite(true);
                          }}
                          className="flex items-center gap-2.5 px-3 py-2 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700/50 transition-colors text-left"
                        >
                          <FiPlus size={14} className="text-purple-500 shrink-0" />
                          <span className="truncate">Agregar Favorito</span>
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowMenu(false);
                            setIsEditingFolder(true);
                          }}
                          className="flex items-center gap-2.5 px-3 py-2 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700/50 transition-colors text-left"
                        >
                          <FiEdit3 size={14} className="text-blue-500 shrink-0" />
                          <span className="truncate">Renombrar</span>
                        </button>
                        <div className="h-px bg-zinc-200 dark:bg-zinc-700 my-1 mx-2" />
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowMenu(false);
                            onDeleteFolder(currentPath);
                          }}
                          className="flex items-center gap-2.5 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors text-left"
                        >
                          <FiX size={14} className="shrink-0" />
                          <span className="truncate">Eliminar</span>
                        </button>
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
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
                      <SortableFavoriteRow
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
