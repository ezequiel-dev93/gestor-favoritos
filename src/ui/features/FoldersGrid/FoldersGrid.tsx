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
import { DndDraggingContext } from "@/ui/features/FoldersGrid/DndDraggingContext";

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
  } = useFoldersDnd();

  /*
   - displayFolders — durante el drag usa el orden local optimista para
     que el grid responda en tiempo real. Fuera del drag, usa el store.
  */
  const displayFolders = localFolderOrder ?? folders;

  /*
   - isDraggingRootFolder — true solo cuando se arrastra una carpeta raíz
     (IDs de carpeta raíz no tienen "/", los de subcarpetas sí).
     Se pasa por contexto para que FolderInnerDropzone se oculte y no
     interfiera con el reordenamiento sortable del grid.
  */
  const isDraggingRootFolder =
    isDraggingFolder && !!activeDragId && !activeDragId.includes("/");
  const folderIds = displayFolders.map((f) => f.name);

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
    <DndDraggingContext.Provider value={{ isDraggingRootFolder }}>
      <DndContext
        sensors={sensors}
        collisionDetection={collisionDetection}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
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
            {displayFolders.map((folder) => (
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
    </DndDraggingContext.Provider>
  );
}
