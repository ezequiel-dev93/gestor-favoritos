import { useDroppable } from "@dnd-kit/core";
import { FiX } from "react-icons/fi";

interface Props {
  folder: string | null;
  selectedFolder: string | null;
  handleSelect: (folder: string | null) => void;
  handleDelete?: (folder: string) => void;
}

export function FolderButton({ folder, selectedFolder, handleSelect, handleDelete }: Props) {
  const id = folder ?? "all";
  const { setNodeRef, isOver } = useDroppable({ id });

  const isSelected = folder === selectedFolder;

  const baseClasses =
    "w-full flex items-center justify-between px-3 py-2 rounded-md text-sm font-medium transition-colors";
  const selectedClasses = isSelected
    ? "bg-blue-600 text-white"
    : "bg-transparent text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700";
  const dropHighlight = isOver ? "ring-2 ring-blue-400" : "";

  return (
    <article
      ref={setNodeRef}
      className={`${baseClasses} ${selectedClasses} ${dropHighlight}`}
    >
      <button
        onClick={() => handleSelect(folder)}
        className={`${baseClasses} ${selectedClasses} ${dropHighlight} min-w-[100px]`}
      >
        {folder ?? "Todos"}
      </button>
      {folder && handleDelete && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleDelete(folder);
          }}
          className="ml-2 text-red-500 hover:text-red-700"
          title="Eliminar carpeta"
        >
          <FiX />
        </button>
      )}
    </article>
  );
}
