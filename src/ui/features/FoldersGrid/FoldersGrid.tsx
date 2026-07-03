import { useState } from "react";
import { DndContext, DragOverlay } from "@dnd-kit/core";
import { SortableContext, rectSortingStrategy } from "@dnd-kit/sortable";
import { AnimatePresence } from "framer-motion";
import { FolderCard } from "@/ui/features/FoldersGrid/FolderCard";
import { useFavoritesStore } from "@/ui/hooks/useFavoritesStore";
import { useFoldersDnd } from "@/ui/features/FoldersGrid/useFoldersDnd";
import { EmptyState } from "@/ui/features/FoldersGrid/EmptyState";
import { RootDropzone } from "@/ui/features/FoldersGrid/RootDropzone";
import { FolderDragPreview, FavoriteDragPreview } from "@/ui/features/FoldersGrid/DragOverlays";
import AddFolderModal from "@/ui/features/AddFolderModal/AddFolderModal";

interface FoldersGridProps {
  onFavoriteAdded: () => void;
  onImportClick: () => void;
}

/*
 - FoldersGrid — orquestador del grid de carpetas.
 - Compone: DnD context (useFoldersDnd), EmptyState, RootDropzone y FolderCards.
 - No contiene logica de negocio ni de drag & drop directamente.
*/
export function FoldersGrid({ onFavoriteAdded, onImportClick }: FoldersGridProps) {
  const folders = useFavoritesStore((s) => s.folders);
  const favorites = useFavoritesStore((s) => s.favorites);
  const deleteFolder = useFavoritesStore((s) => s.deleteFolder);
  const updateFolderName = useFavoritesStore((s) => s.updateFolderName);

  const [showAddFolder, setShowAddFolder] = useState(false);

  const {
    activeFav,
    isDraggingFolder,
    activeFolderName,
    sensors,
    collisionDetection,
    handleDragStart,
    handleDragEnd,
  } = useFoldersDnd();

  const folderIds = folders.map((f) => f.name);

  if (folders.length === 0) {
    return (
      <>
        <EmptyState onCreateFolder={() => setShowAddFolder(true)} onImportClick={onImportClick} />
        <AddFolderModal
          isOpen={showAddFolder}
          onClose={() => {
            setShowAddFolder(false);
            onFavoriteAdded();
          }}
        />
      </>
    );
  }

  return (
    <>
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

      <AddFolderModal
        isOpen={showAddFolder}
        onClose={() => {
          setShowAddFolder(false);
          onFavoriteAdded();
        }}
      />
    </>
  );
}
