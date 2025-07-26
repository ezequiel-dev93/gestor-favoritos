import { useState } from "react";
import { useDroppable } from "@dnd-kit/core";
import { FiChevronRight, FiX } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import { HoverFavoritesPreview } from "@/ui/features/FolderSelector/HoverFavoritesPreview";

interface Props {
  folder: string;
  selectedFolder: string | null;
  handleSelect: (folder: string) => void;
  handleDelete?: (folder: string) => void;
}

export function FolderItem({
  folder,
  selectedFolder,
  handleSelect,
  handleDelete,
}: Props) {
  const { setNodeRef, isOver } = useDroppable({ id: folder });
  const isSelected = folder === selectedFolder;
  const [isHovered, setIsHovered] = useState(false);

  const baseClasses =
    "relative min-w-[120px] flex items-center justify-between px-3 py-2 rounded-md text-sm font-medium transition-colors";
  const selectedClasses = isSelected
    ? "bg-blue-600 text-white"
    : "bg-transparent text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700";
  const dropHighlight = isOver ? "ring-2 ring-blue-400" : "";

  return (
    <article
      ref={setNodeRef}
      className={`${baseClasses} ${selectedClasses} ${dropHighlight}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <button
        onClick={() => handleSelect(folder)}
        className="flex-1 text-left truncate flex items-center justify-between gap-2"
      >
        <span className="truncate">{folder}</span>

        <AnimatePresence>
          {isHovered && (
            <motion.span
              initial={{ opacity: 0, x: -5 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -5 }}
              transition={{ duration: 0.2 }}
            >
              <FiChevronRight className="text-zinc-500 dark:text-zinc-400" />
            </motion.span>
          )}
        </AnimatePresence>
      </button>

      {handleDelete && (
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

      {isHovered && (
        <HoverFavoritesPreview folder={folder} />
      )}
    </article>
  );
}
