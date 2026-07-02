import { useState, useMemo, useCallback } from "react";
import {
  DndContext,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  DragOverlay,
  closestCenter,
  pointerWithin,
} from "@dnd-kit/core";
import type { DragStartEvent, DragEndEvent, CollisionDetection } from "@dnd-kit/core";
import { arrayMove, sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { updateFavorite } from "@/core/favorites/useCases/updateFavorite";
import { flattenFolderPaths } from "@/core/favorites/entities/FolderNode";
import { useFavoritesStore } from "@/ui/hooks/useFavoritesStore";
import { ChromeStorageRepository } from "@/infrastructure/storage/ChromeStorageRepository";
import { notifySuccess, notifyError } from "@/core/utils/notify";
import type { Favorite } from "@/core/favorites/entities/Favorite";

interface Props {
  children: React.ReactNode;
}

/* Preview flotante del favorito arrastrado */
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

export function FavoriteDndContext({ children }: Props) {
  const favorites = useFavoritesStore((state) => state.favorites);
  const setFavorites = useFavoritesStore((state) => state.setFavorites);
  const saveFavoritesOrder = useFavoritesStore((state) => state.saveFavoritesOrder);
  const loadFavoritesByFolder = useFavoritesStore((state) => state.loadFavoritesByFolder);
  const folders = useFavoritesStore((state) => state.folders);

  const [activeDragId, setActiveDragId] = useState<string | null>(null);

  // Instancia memoizada: no se recrea en cada render
  const repo = useMemo(() => new ChromeStorageRepository(), []);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  /* Colision hibrida: drop zones con pointerWithin, sortables con closestCenter */
  const collisionDetection: CollisionDetection = useCallback((args) => {
    const pointerCollisions = pointerWithin(args);
    const dropZone = pointerCollisions.find((c) =>
      String(c.id).startsWith("drop-inside-")
    );
    if (dropZone) return [dropZone];
    return closestCenter(args);
  }, []);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveDragId(String(event.active.id));
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    setActiveDragId(null);
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const activeId = String(active.id);
    const overId = String(over.id);

    const activeFavorite = favorites.find((f) => f.id === activeId);
    if (!activeFavorite) return;

    const overFavorite = favorites.find((f) => f.id === overId);

    const oldIndex = favorites.findIndex((f) => f.id === activeId);
    const newIndex = favorites.findIndex((f) => f.id === overId);

    const isFolderDrop = !overFavorite;

    if (isFolderDrop) {
      // overId puede ser el path serializado de una carpeta
      const allFolderPaths = flattenFolderPaths(folders);
      const matchedPath = allFolderPaths.find((p) => p.join("/") === overId);
      if (!matchedPath) return;

      const folderPathStr = matchedPath.join("/");
      try {
        await updateFavorite(activeFavorite.id, { ...activeFavorite, folder: folderPathStr }, repo);
        notifySuccess("Favorito movido a la carpeta");
        await loadFavoritesByFolder();
      } catch (error) {
        notifyError("Error al mover el favorito a la carpeta");
        console.error(error);
      }
      return;
    }

    if (activeFavorite.folder === overFavorite.folder) {
      const reordered = arrayMove(favorites, oldIndex, newIndex);
      setFavorites(reordered);
      await saveFavoritesOrder(reordered);
      notifySuccess("Orden actualizado");
      return;
    }

    try {
      await updateFavorite(activeFavorite.id, { ...activeFavorite, folder: overFavorite.folder }, repo);
      notifySuccess("Favorito movido a otra carpeta");
      await loadFavoritesByFolder();
    } catch (error) {
      notifyError("Error al mover el favorito");
      console.error(error);
    }
  };

  const activeFav = activeDragId ? (favorites.find((f) => f.id === activeDragId) ?? null) : null;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={collisionDetection}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      {children}
      <DragOverlay dropAnimation={{ duration: 200, easing: "ease" }}>
        {activeFav ? <FavoriteDragPreview fav={activeFav} /> : null}
      </DragOverlay>
    </DndContext>
  );
}
