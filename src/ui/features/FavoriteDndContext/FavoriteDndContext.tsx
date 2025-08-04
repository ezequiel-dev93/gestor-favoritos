import { DndContext } from "@dnd-kit/core";
import type { DragEndEvent } from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { updateFavorite } from "@/core/favorites/useCases/updateFavorite";
import { useFavoritesStore } from "@/ui/hooks/useFavoritesStore";
import { ChromeStorageRepository } from "@/infrastructure/storage/ChromeStorageRepository";
import { notifySuccess, notifyError } from "@/core/utils/notify";

interface Props {
  children: React.ReactNode;
}

export function FavoriteDndContext({ children }: Props) {
  const favorites = useFavoritesStore((state) => state.favorites);
  const setFavorites = useFavoritesStore((s) => s.setFavorites);
  const saveFavoritesOrder = useFavoritesStore((s) => s.saveFavoritesOrder);
  const loadFavoritesByFolder = useFavoritesStore((state) => state.loadFavoritesByFolder);
  const repo = new ChromeStorageRepository();

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const activeId = String(active.id);
    const overId = String(over.id);

    const oldIndex = favorites.findIndex((f) => f.id === activeId);
    const newIndex = favorites.findIndex((f) => f.id === overId);

    // Si están en la misma carpeta, reordenamos
    if (favorites[oldIndex]?.folder === favorites[newIndex]?.folder) {
      const reordered = arrayMove(favorites, oldIndex, newIndex);
      setFavorites(reordered);
      await saveFavoritesOrder(reordered);
      notifySuccess("Orden actualizado");
      return;
    }

    // Si se movió a otra carpeta
    const favorite = favorites.find((fav) => fav.id === activeId);
    if (!favorite) return;

    try {
      await updateFavorite(favorite.id, { ...favorite, folder: overId }, repo);
      notifySuccess("Favorito movido a otra carpeta");
      await loadFavoritesByFolder();
    } catch (error) {
      notifyError("Error al mover el favorito");
      console.error(error);
    }
  };

  return <DndContext onDragEnd={handleDragEnd}>{children}</DndContext>;
}
