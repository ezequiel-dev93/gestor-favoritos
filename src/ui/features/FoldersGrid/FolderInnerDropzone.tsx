import { useDroppable } from "@dnd-kit/core";

interface FolderInnerDropzoneProps {
  folderPathStr: string;
}

/*
 - FolderInnerDropzone — SRP: area de drop dentro de una carpeta.
 - Se activa cuando se arrastra un favorito o subcarpeta sobre ella,
 - permitiendo mover elementos al interior de esta carpeta.
*/
export function FolderInnerDropzone({ folderPathStr }: FolderInnerDropzoneProps) {
  const { isOver, setNodeRef } = useDroppable({ id: `drop-inside-${folderPathStr}` });
  return (
    <div
      ref={setNodeRef}
      className={`mt-2 p-3 border-2 border-dashed rounded-lg text-center transition-colors ${isOver
          ? "border-purple-500 bg-purple-500/10 text-purple-600"
          : "border-transparent hover:border-zinc-300 dark:hover:border-zinc-700 text-zinc-400"
        }`}
    >
      <span className="text-xs font-medium">Soltar aqui para mover adentro</span>
    </div>
  );
}
