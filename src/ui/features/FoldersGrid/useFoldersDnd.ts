import { useState, useCallback } from "react";
import {
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  pointerWithin,
} from "@dnd-kit/core";
import type { DragStartEvent, DragEndEvent, CollisionDetection } from "@dnd-kit/core";
import { arrayMove, sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { useFavoritesStore } from "@/ui/hooks/useFavoritesStore";
import { notifySuccess, notifyError } from "@/core/utils/notify";
import { findFolderNode } from "@/core/favorites/entities/FolderNode";
import type { Favorite } from "@/core/favorites/entities/Favorite";

export interface FoldersDndState {
  activeDragId: string | null;
  activeFav: Favorite | null;
  isDraggingFolder: boolean;
  activeFolderName: string | null;
}

export interface FoldersDndHandlers {
  sensors: ReturnType<typeof useSensors>;
  collisionDetection: CollisionDetection;
  handleDragStart: (event: DragStartEvent) => void;
  handleDragEnd: (event: DragEndEvent) => Promise<void>;
}

/**
 * useFoldersDnd — SRP: encapsula toda la logica de drag & drop del grid de carpetas.
 * Maneja sensores, deteccion de colision, y los handlers de inicio/fin de drag.
 * FoldersGrid solo consume este hook sin conocer los detalles de dnd-kit.
 */
export function useFoldersDnd(): FoldersDndState & FoldersDndHandlers {
  const folders = useFavoritesStore((s) => s.folders);
  const favorites = useFavoritesStore((s) => s.favorites);
  const moveFolder = useFavoritesStore((s) => s.moveFolder);
  const moveFavoriteToFolder = useFavoritesStore((s) => s.moveFavoriteToFolder);
  const reorderFavoritesInFolder = useFavoritesStore((s) => s.reorderFavoritesInFolder);
  const reorderChildrenInFolder = useFavoritesStore((s) => s.reorderChildrenInFolder);
  const saveFoldersOrder = useFavoritesStore((s) => s.saveFoldersOrder);

  const [activeDragId, setActiveDragId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  /**
   * Colision hibrida:
   * - Drop zones usan pointerWithin: solo activan cuando el cursor esta encima.
   * - Sortables usan closestCenter como fallback.
   */
  const collisionDetection: CollisionDetection = useCallback((args) => {
    const pointerCollisions = pointerWithin(args);
    const dropZoneCollision = pointerCollisions.find(
      (c) => String(c.id).startsWith("drop-inside-") || c.id === "root-dropzone"
    );
    if (dropZoneCollision) return [dropZoneCollision];
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
      return;
    }

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
      const targetPath = overId.replace("drop-inside-", "").split("/");
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

    if (activeParentStr !== overParentStr) return;

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
  };

  // Estado derivado para el overlay
  const activeFav = activeDragId
    ? (favorites.find((f) => f.id === activeDragId) ?? null)
    : null;
  const isDraggingFolder = activeDragId !== null && activeFav === null;
  const activeFolderName = isDraggingFolder
    ? (activeDragId.split("/").at(-1) ?? null)
    : null;

  return {
    activeDragId,
    activeFav,
    isDraggingFolder,
    activeFolderName,
    sensors,
    collisionDetection,
    handleDragStart,
    handleDragEnd,
  };
}
