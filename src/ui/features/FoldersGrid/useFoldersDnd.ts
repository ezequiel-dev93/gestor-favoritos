import { useState, useCallback } from "react";
import {
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  pointerWithin,
} from "@dnd-kit/core";
import type { DragStartEvent, DragEndEvent, DragOverEvent, CollisionDetection } from "@dnd-kit/core";
import { arrayMove, sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { useFavoritesStore } from "@/ui/hooks/useFavoritesStore";
import { notifySuccess, notifyError } from "@/core/utils/notify";
import { findFolderNode } from "@/core/favorites/entities/FolderNode";
import type { FolderNode } from "@/core/favorites/entities/FolderNode";
import type { Favorite } from "@/core/favorites/entities/Favorite";

export interface FoldersDndState {
  activeDragId: string | null;
  activeFav: Favorite | null;
  isDraggingFolder: boolean;
  activeFolderName: string | null;
  /** Orden local durante el drag (null cuando no hay drag activo). */
  localFolderOrder: FolderNode[] | null;
}

export interface FoldersDndHandlers {
  sensors: ReturnType<typeof useSensors>;
  collisionDetection: CollisionDetection;
  handleDragStart: (event: DragStartEvent) => void;
  handleDragOver: (event: DragOverEvent) => void;
  handleDragEnd: (event: DragEndEvent) => Promise<void>;
}

/*
 - useFoldersDnd — SRP: encapsula toda la logica de drag & drop del grid de carpetas.
 - Maneja sensores, deteccion de colision, y los handlers de inicio/fin de drag.
 - FoldersGrid solo consume este hook sin conocer los detalles de dnd-kit.
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

  /*
   - localFolderOrder — orden optimista de carpetas raíz durante el drag.
   - Se inicializa al comenzar el drag y se actualiza en onDragOver.
   - Se limpia (null) al terminar, volviendo al orden del store.
  */
  const [localFolderOrder, setLocalFolderOrder] = useState<FolderNode[] | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  /* Colision hibrida:
     - Drop zones usan pointerWithin: solo activan cuando el cursor esta encima.
     - Sortables usan closestCenter como fallback.
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
    // Inicializar el orden local con el estado actual del store
    setLocalFolderOrder(folders);
  };

  /*
   - handleDragOver — reordenamiento optimista en tiempo real.
   - Solo actúa cuando se arrastra una carpeta raíz sobre otra carpeta raíz.
   - Actualiza localFolderOrder con arrayMove para que el grid responda de inmediato.
  */
  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const activeId = String(active.id);
    const overId = String(over.id);

    // Ignorar drop zones especiales y favoritos
    if (
      overId.startsWith("drop-inside-") ||
      overId === "root-dropzone" ||
      favorites.some((f) => f.id === activeId)
    ) return;

    const activePath = activeId.split("/");
    const overPath = overId.split("/");

    // Solo reordenar carpetas raíz (IDs de un solo segmento)
    if (activePath.length !== 1 || overPath.length !== 1) return;

    setLocalFolderOrder((current) => {
      const order = current ?? folders;
      const oldIdx = order.findIndex((f) => f.name === activePath[0]);
      const newIdx = order.findIndex((f) => f.name === overPath[0]);
      if (oldIdx === -1 || newIdx === -1 || oldIdx === newIdx) return current;
      return arrayMove(order, oldIdx, newIdx);
    });
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    // Capturar el orden local antes de limpiarlo
    const currentLocalOrder = localFolderOrder;
    setActiveDragId(null);
    setLocalFolderOrder(null);

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
      // Carpetas raíz: persistir el orden local acumulado durante onDragOver
      if (currentLocalOrder) {
        await saveFoldersOrder(currentLocalOrder);
      }
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
    localFolderOrder,
    sensors,
    collisionDetection,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
  };
}
