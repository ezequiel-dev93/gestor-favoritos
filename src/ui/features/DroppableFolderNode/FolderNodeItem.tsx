import React from "react";
import { FiX, FiChevronRight } from "react-icons/fi";
import { FcOpenedFolder } from "react-icons/fc";
import type { FolderNode } from "@/core/favorites/entities/FolderNode";

interface FolderNodeItemProps {
  node: FolderNode;
  isSelected: boolean;
  isOpen: boolean;
  hasChildren: boolean;
  handleToggle: () => void;
  handleDelete: () => void;
  level: number;
}

export const FolderNodeItem: React.FC<FolderNodeItemProps> = ({
  node,
  isSelected,
  isOpen,
  hasChildren,
  handleToggle,
  handleDelete,
  level,
}) => {
  return (
    <article
      className={`flex items-center justify-between px-2 py-1 cursor-pointer ${
        isSelected ? "bg-blue-100 dark:bg-gray-500 px-2 rounded-md" : ""
      }`}
      style={{ paddingLeft: `${level * 1.5}rem` }}
    >
      <div className="flex items-center gap-1" onClick={handleToggle}>
        {hasChildren && (
          <FiChevronRight
            className={`transition-transform ${
              isOpen ? "rotate-90" : ""
            }`}
          />
        )}
        <FcOpenedFolder />
        <span>{node.name}</span>
      </div>

      <button
        onClick={handleDelete}
        aria-label={`Eliminar carpeta ${node.name}`}
        className="text-red-500 hover:text-red-700"
      >
        <FiX />
      </button>
    </article>
  );
};
