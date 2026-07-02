import { useState, useCallback } from "react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  useDroppable,
  DragOverlay,
  pointerWithin,
} from "@dnd-kit/core";
import type { DragStartEvent, DragEndEvent, CollisionDetection } from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  rectSortingStrategy,
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";
import { FiFolder } from "react-icons/fi";
import { FolderCard } from "@/ui/features/FoldersGrid/FolderCard";
import { useFavoritesStore } from "@/ui/hooks/useFavoritesStore";
import { notifySuccess, notifyError } from "@/core/utils/notify";
import { findFolderNode } from "@/core/favorites/entities/FolderNode";
import { motion, AnimatePresence } from "framer-motion";
import type { Favorite } from "@/core/favorites/entities/Favorite";

interface FoldersGridProps {
  onFavoriteAdded: () => void;
}

// Drag Overlays

function FolderDragPreview({ name }: { name: string }) {
  return (
    <div className="flex items-center gap-2 bg-zinc-50 dark:bg-zinc-800 rounded-xl border border-purple-400 px-3 py-2 shadow-2xl shadow-black/30 cursor-grabbing select-none">
      <FiFolder size={14} className="text-purple-500 shrink-0" />
      <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-200 truncate max-w-[160px]">
        {name}
      </span>
    </div>
  );
}

function FavoriteDragPreview({ fav }: { fav: Favorite }) {
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

// Root Dropzone

function RootDropzone() {
  const { isOver, setNodeRef } = useDroppable({ id: "root-dropzone" });
  return (
    <motion.div
      ref={setNodeRef}
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: 48, opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      className={`w-full flex items-center justify-center rounded-xl border-2 border-dashed mb-4 transition-colors ${isOver
          ? "border-purple-500 bg-purple-500/10 text-purple-500"
          : "border-zinc-300 dark:border-zinc-700 bg-zinc-100/50 dark:bg-zinc-800/50 text-zinc-500"
        }`}
    >
      <span className="font-semibold text-sm">Soltar aqui para mover a la Raiz</span>
    </motion.div>
  );
}

// FoldersGrid

export function FoldersGrid({ onFavoriteAdded }: FoldersGridProps) {
  const folders = useFavoritesStore((s) => s.folders);
  const favorites = useFavoritesStore((s) => s.favorites);
  const deleteFolder = useFavoritesStore((s) => s.deleteFolder);
  const updateFolderName = useFavoritesStore((s) => s.updateFolderName);
  const saveFoldersOrder = useFavoritesStore((s) => s.saveFoldersOrder);
  const moveFolder = useFavoritesStore((s) => s.moveFolder);
  const moveFavoriteToFolder = useFavoritesStore((s) => s.moveFavoriteToFolder);
  const reorderFavoritesInFolder = useFavoritesStore((s) => s.reorderFavoritesInFolder);
  const reorderChildrenInFolder = useFavoritesStore((s) => s.reorderChildrenInFolder);

  const [activeDragId, setActiveDragId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  /*
   - Colision hibrida:
   - Drop zones (drop-inside-*, root-dropzone) usan pointerWithin: solo
   - Activan cuando el cursor esta fisicamente encima del area.
   - El resto de items sortables usa closestCenter como fallback.
   */
  const collisionDetection: CollisionDetection = useCallback((args) => {
    const pointerCollisions = pointerWithin(args);
    const dropZoneCollision = pointerCollisions.find(
      (c) => String(c.id).startsWith("drop-inside-") || c.id === "root-dropzone"
    );
    if (dropZoneCollision) return [dropZoneCollision];
    return closestCenter(args);
  }, []);

  const folderIds = folders.map((f) => f.name);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveDragId(String(event.active.id));
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    setActiveDragId(null);
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const activeId = String(active.id);
    const overId = String(over.id);

    const isFavorite = favorites.some((f) => f.id === activeId);

    if (isFavorite) {
      const activeFav = favorites.find((f) => f.id === activeId)!;
      if (overId.startsWith("drop-inside-")) {
        const targetPath = overId.replace("drop-inside-", "");
        if (activeFav.folder !== targetPath) {
          try {
            await moveFavoriteToFolder(activeFav.id, targetPath);
            notifySuccess("Favorito movido");
          } catch {
            notifyError("No se pudo mover el favorito");
          }
        }
        return;
      }
      const overFav = favorites.find((f) => f.id === overId);
      if (overFav && overFav.folder === activeFav.folder) {
        const folderFavs = favorites.filter((f) => f.folder === activeFav.folder);
        const oldIdx = folderFavs.findIndex((f) => f.id === activeId);
        const newIdx = folderFavs.findIndex((f) => f.id === overId);
        await reorderFavoritesInFolder(activeFav.folder, arrayMove(folderFavs, oldIdx, newIdx));
        notifySuccess("Orden actualizado");
      }
    } else {
      // Es una carpeta
      const activePath = activeId.split("/");

      if (overId === "root-dropzone") {
        try {
          await moveFolder(activePath, []);
          notifySuccess("Carpeta movida a la raiz");
        } catch {
          notifyError("No se pudo mover la carpeta");
        }
        return;
      }

      if (overId.startsWith("drop-inside-")) {
        const targetPathStr = overId.replace("drop-inside-", "");
        const targetPath = targetPathStr.split("/");
        try {
          await moveFolder(activePath, targetPath);
          notifySuccess("Carpeta movida");
        } catch (error: any) {
          notifyError(error?.message || "No se pudo mover");
        }
        return;
      }

      const overPath = overId.split("/");
      const activeParentStr = activePath.slice(0, -1).join("/");
      const overParentStr = overPath.slice(0, -1).join("/");

      if (activeParentStr === overParentStr) {
        if (activeParentStr === "") {
          const oldIdx = folders.findIndex((f) => f.name === activePath[0]);
          const newIdx = folders.findIndex((f) => f.name === overPath[0]);
          await saveFoldersOrder(arrayMove(folders, oldIdx, newIdx));
        } else {
          const parentPath = overPath.slice(0, -1);
          const parent = findFolderNode(folders, parentPath);
          if (parent && parent.children) {
            const oldIdx = parent.children.findIndex((c) => c.name === activePath[activePath.length - 1]);
            const newIdx = parent.children.findIndex((c) => c.name === overPath[overPath.length - 1]);
            await reorderChildrenInFolder(parentPath, arrayMove(parent.children, oldIdx, newIdx));
          }
        }
      }
    }
  };

  if (folders.length === 0) {
    return (
      <article className="flex flex-col items-center justify-center flex-1 gap-4 text-zinc-400 select-none h-full">
        <span className="text-6xl" aria-hidden="true">{'??'}</span>
        <p className="text-sm">Crea tu primera carpeta para empezar</p>
      </article>
    );
  }

  const activeFav = activeDragId ? (favorites.find((f) => f.id === activeDragId) ?? null) : null;
  const isDraggingFolder = activeDragId !== null && activeFav === null;
  const activeFolderName = isDraggingFolder ? (activeDragId.split("/").at(-1) ?? null) : null;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={collisionDetection}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <AnimatePresence>
        {isDraggingFolder && <RootDropzone />}
      </AnimatePresence>

      <SortableContext items={folderIds} strategy={rectSortingStrategy}>
        <div
          className="grid gap-4 content-start items-start"
          style={{ gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))" }}
          aria-label="Carpetas de favoritos"
        >
          {folders.map((folder) => (
            <FolderCard
              key={folder.name}
              folder={folder}
              path={[]}
              favorites={favorites}
              onUpdateName={updateFolderName}
              onDeleteFolder={deleteFolder}
              onFavoriteAdded={onFavoriteAdded}
            />
          ))}
        </div>
      </SortableContext>

      <DragOverlay dropAnimation={{ duration: 200, easing: "ease" }}>
        {activeFav ? (
          <FavoriteDragPreview fav={activeFav} />
        ) : activeFolderName ? (
          <FolderDragPreview name={activeFolderName} />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
