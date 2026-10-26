import { useDroppable } from "@dnd-kit/core";
import { useDndDraggingContext } from "@/ui/features/FoldersGrid/DndDraggingContext";

interface FolderInnerDropzoneProps {
  folderPathStr: string;
}

/*
 - FolderInnerDropzone — SRP: area de drop dentro de una carpeta.
 - Se activa cuando se arrastra un favorito o subcarpeta sobre ella,
 - permitiendo mover elementos al interior de esta carpeta.
 - Se oculta cuando se arrastra una carpeta raíz para evitar conflicto
 - con el reordenamiento sortable del grid.
*/
export function FolderInnerDropzone({ folderPathStr }: FolderInnerDropzoneProps) {
  const { isDragging, isDraggingRootFolder } = useDndDraggingContext();
  const { isOver, setNodeRef } = useDroppable({ id: `drop-inside-${folderPathStr}` });

  // Solo mostrar la zona de drop cuando hay un arrastre activo (y no es carpeta raíz)
  if (!isDragging || isDraggingRootFolder) return null;

  return (
    <div
      ref={setNodeRef}
      className={`mt-1 px-2 py-1 border border-dashed rounded-md text-center transition-colors ${isOver
          ? "border-purple-500 bg-purple-500/10 text-purple-600 dark:text-purple-400"
          : "border-zinc-300/80 dark:border-zinc-700 text-zinc-500 dark:text-zinc-400"
        }`}
    >
      <span className="text-[11px] font-medium">Soltar aquí para mover adentro</span>
    </div>
  );
}
