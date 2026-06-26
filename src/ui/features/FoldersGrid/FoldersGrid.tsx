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
  arrayMove,
  rectSortingStrategy,
} from "@dnd-kit/sortable";
import { FolderCard } from "@/ui/features/FoldersGrid/FolderCard";
import { useFavoritesStore } from "@/ui/hooks/useFavoritesStore";

interface FoldersGridProps {
  onFavoriteAdded: () => void;
}

/**
 * FoldersGrid — SRP: renderiza el grid responsive de tarjetas de carpetas.
 * Orquesta el DnD de reordenamiento de carpetas a nivel raíz.
 * No contiene lógica de dominio, solo composición visual.
 */
export function FoldersGrid({ onFavoriteAdded }: FoldersGridProps) {
  const folders          = useFavoritesStore((s) => s.folders);
  const favorites        = useFavoritesStore((s) => s.favorites);
  const deleteFolder     = useFavoritesStore((s) => s.deleteFolder);
  const updateFolderName = useFavoritesStore((s) => s.updateFolderName);
  const saveFoldersOrder = useFavoritesStore((s) => s.saveFoldersOrder);

  // Activar el sensor solo tras mover 8px — evita conflictos con clicks
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    })
  );

  const folderIds = folders.map((f) => f.name);

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = folders.findIndex((f) => f.name === active.id);
    const newIndex = folders.findIndex((f) => f.name === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    const reordered = arrayMove(folders, oldIndex, newIndex);
    await saveFoldersOrder(reordered);
  };

  if (folders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 gap-4 text-zinc-400 select-none">
        <span className="text-6xl" aria-hidden="true">📁</span>
        <p className="text-sm">Creá tu primera carpeta para empezar</p>
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
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
    </DndContext>
  );
}

