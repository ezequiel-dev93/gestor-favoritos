import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiEdit3, FiX, FiPlus, FiFolder, FiChevronRight } from "react-icons/fi";
import { RxDragHandleDots2 } from "react-icons/rx";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import type { DragEndEvent } from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  arrayMove,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { FolderNode } from "@/core/favorites/entities/FolderNode";
import type { Favorite } from "@/core/favorites/entities/Favorite";
import { AddFavoriteModal } from "@/ui/features/AddFavoriteModal/AddFavoriteModal";
import { useFavoritesStore } from "@/ui/hooks/useFavoritesStore";
import { notifySuccess, notifyError } from "@/core/utils/notify";

// ─────────────────────────────────────────────────────────────────────────────
// SortableFavoriteRow — fila de favorito arrastrable dentro de una FolderCard
// ─────────────────────────────────────────────────────────────────────────────
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

  return (
    <li
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.4 : 1,
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
        onClick={() => onDelete(fav.id, fav.title)}
        aria-label={`Eliminar ${fav.title}`}
        className="p-0.5 text-zinc-300 hover:text-red-500 opacity-0 group-hover/fav:opacity-100 transition-opacity shrink-0"
      >
        <FiX size={11} />
      </button>
    </li>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// FolderCard
// ─────────────────────────────────────────────────────────────────────────────
interface FolderCardProps {
  folder: FolderNode;
  path?: string[];
  favorites: Favorite[];
  onUpdateName?: (path: string[], newName: string) => Promise<void>;
  onDeleteFolder: (path: string[]) => Promise<void>;
  onFavoriteAdded: () => void;
}

/**
 * FolderCard — SRP: renderiza una carpeta con favoritos y sub-carpetas.
 *
 * Carpetas raiz (path=[]):
 *   - Siempre expandidas.
 *   - Participan en el DnD del grid (FoldersGrid).
 *
 * Sub-carpetas (path.length > 0):
 *   - Comienzan colapsadas, expandibles con click.
 *   - Muestran icono de carpeta + chevron animado.
 *   - Participan en el DnD interno de su carpeta padre.
 *
 * El contenido de cada card (favoritos + sub-carpetas) tiene sus propios
 * DndContext para reordenamiento interno, independientes del grid exterior.
 */
export function FolderCard({
  folder,
  path = [],
  favorites,
  onUpdateName,
  onDeleteFolder,
  onFavoriteAdded,
}: FolderCardProps) {
  const deleteFavorite           = useFavoritesStore((s) => s.deleteFavorite);
  const reorderFavoritesInFolder = useFavoritesStore((s) => s.reorderFavoritesInFolder);
  const reorderChildrenInFolder  = useFavoritesStore((s) => s.reorderChildrenInFolder);

  const isRootFolder = path.length === 0;

  const [isOpen, setIsOpen]                     = useState(isRootFolder);
  const [isEditingFolder, setIsEditingFolder]   = useState(false);
  const [newFolderName, setNewFolderName]       = useState(folder.name);
  const [showAddFavorite, setShowAddFavorite]   = useState(false);

  const currentPath     = [...path, folder.name];
  const folderPathStr   = currentPath.join("/");
  const folderFavorites = favorites.filter((f) => f.folder === folderPathStr);
  const hasChildren     = (folder.children?.length ?? 0) > 0;
  const isEmpty         = folderFavorites.length === 0 && !hasChildren;

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
    opacity: isDragging ? 0.4 : 1,
    zIndex: isDragging ? 50 : undefined,
  };

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  const childrenIds = (folder.children ?? []).map((c) =>
    [...currentPath, c.name].join("/")
  );
  const favoriteIds = folderFavorites.map((f) => f.id);

  const handleFavoritesDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIdx = folderFavorites.findIndex((f) => f.id === String(active.id));
    const newIdx = folderFavorites.findIndex((f) => f.id === String(over.id));
    if (oldIdx === -1 || newIdx === -1) return;
    try {
      await reorderFavoritesInFolder(folderPathStr, arrayMove(folderFavorites, oldIdx, newIdx));
      notifySuccess("Orden actualizado");
    } catch {
      notifyError("No se pudo reordenar");
    }
  };

  const handleChildrenDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const children = folder.children ?? [];
    const oldIdx = children.findIndex(
      (c) => [...currentPath, c.name].join("/") === String(active.id)
    );
    const newIdx = children.findIndex(
      (c) => [...currentPath, c.name].join("/") === String(over.id)
    );
    if (oldIdx === -1 || newIdx === -1) return;
    try {
      await reorderChildrenInFolder(currentPath, arrayMove(children, oldIdx, newIdx));
      notifySuccess("Sub-carpetas reordenadas");
    } catch {
      notifyError("No se pudo reordenar");
    }
  };

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
        {/* Header */}
        <div className="flex items-center gap-2 min-h-[24px]">
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
              <motion.span
                animate={{ rotate: isOpen ? 90 : 0 }}
                transition={{ duration: 0.18, ease: "easeInOut" }}
                className="shrink-0"
              >
                <FiChevronRight size={13} className="text-zinc-400" />
              </motion.span>
              <FiFolder
                size={13}
                className={`shrink-0 transition-colors ${isOpen ? "text-purple-500" : "text-zinc-400"}`}
              />
              <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-200 truncate select-none">
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
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-auto shrink-0">
              <button
                {...dragListeners}
                {...attributes}
                aria-label="Arrastrar para reordenar"
                title="Arrastrar para reordenar"
                className="p-1 text-zinc-300 hover:text-zinc-500 dark:hover:text-zinc-300 cursor-grab active:cursor-grabbing transition-colors"
              >
                <RxDragHandleDots2 size={14} />
              </button>
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

        {/* Contenido animado */}
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
                <p className="text-xs text-zinc-400 italic">Sin favoritos aun</p>
              )}

              {hasChildren && (
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleChildrenDragEnd}
                >
                  <SortableContext items={childrenIds} strategy={verticalListSortingStrategy}>
                    <div className="flex flex-col gap-1.5">
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
                </DndContext>
              )}

              {folderFavorites.length > 0 && (
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleFavoritesDragEnd}
                >
                  <SortableContext items={favoriteIds} strategy={verticalListSortingStrategy}>
                    <ul
                      className="flex flex-col gap-1.5"
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
                </DndContext>
              )}
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
