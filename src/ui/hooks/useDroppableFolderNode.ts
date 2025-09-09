import { useCallback } from "react";
import type { FolderNode } from "@/core/favorites/entities/FolderNode";
import { useFolderNode } from "@/ui/hooks/useFolderNode";

interface UseDroppableFolderNodeProps {
  node: FolderNode;
  path: string[];
  selectedFolder: string[] | null;
  setSelectedFolder: (folder: string[] | null) => void;
  deleteFolder: (folderPath: string[]) => void;
  level?: number;
}

export const useDroppableFolderNode = ({
  node,
  path,
  selectedFolder,
  setSelectedFolder,
  deleteFolder,
  level = 0,
}: UseDroppableFolderNodeProps) => {
  const {
    currentPath,
    isSelected,
    isOpen,
    hasChildren,
    handleToggle,
  } = useFolderNode(node, path, selectedFolder, setSelectedFolder);

  const handleDelete = useCallback(() => {
    deleteFolder(currentPath);
  }, [deleteFolder, currentPath]);

  return {
    node,
    currentPath,
    isSelected,
    isOpen,
    hasChildren,
    handleToggle,
    handleDelete,
    level,
  };
};
