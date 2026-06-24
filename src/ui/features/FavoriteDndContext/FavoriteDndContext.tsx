import { useMemo } from "react";
import { DndContext } from "@dnd-kit/core";
import type { DragEndEvent } from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { updateFavorite } from "@/core/favorites/useCases/updateFavorite";
import { flattenFolderPaths } from "@/core/favorites/entities/FolderNode";
import { useFavoritesStore } from "@/ui/hooks/useFavoritesStore";
import { ChromeStorageRepository } from "@/infrastructure/storage/ChromeStorageRepository";
import { notifySuccess, notifyError } from "@/core/utils/notify";

interface Props {
  children: React.ReactNode;
}

export function FavoriteDndContext({ children }: Props) {
  const favorites = useFavoritesStore((state) => state.favorites);
  const setFavorites = useFavoritesStore((state) => state.setFavorites);
  const saveFavoritesOrder = useFavoritesStore((state) => state.saveFavoritesOrder);
  const loadFavoritesByFolder = useFavoritesStore((state) => state.loadFavoritesByFolder);

  const folders = useFavoritesStore((state) => state.folders);

  // Fix 2: instancia memoizada — no se recrea en cada render
  const repo = useMemo(() => new ChromeStorageRepository(), []);

  const handleDragEnd = async (event: DragEndEvent) => {
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
    // Fix 3: overId puede ser el path serializado de una carpeta ("trabajo/proyectos")
    // o el nombre de una carpeta raíz. Verificamos que corresponda a una carpeta real
    // construyendo todos los paths posibles y buscando coincidencia.
    const allFolderPaths = flattenFolderPaths(folders);
    const matchedPath = allFolderPaths.find((p) => p.join("/") === overId);

    if (!matchedPath) {
      // overId no corresponde a ninguna carpeta conocida — ignorar el drop
      return;
    }

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

  return <DndContext onDragEnd={handleDragEnd}>{children}</DndContext>;
}
