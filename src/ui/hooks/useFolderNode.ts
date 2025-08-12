import { useState, useEffect, useCallback } from 'react';
import type { FolderNode } from '@/core/favorites/entities/FolderNode';

export function useFolderNode(
  node: FolderNode,
  path: string[],
  selectedFolder: string[] | null,
  setSelectedFolder: (folder: string[] | null) => void
) {
  const currentPath = [...path, node.name];

  const isSelected = !!selectedFolder && 
    selectedFolder.length === currentPath.length &&
    selectedFolder.every((seg, i) => seg === currentPath[i]);

  const hasChildren = (node.children && node.children.length > 0) ?? false;

  const [isOpen, setIsOpen] = useState<boolean>(isSelected);

  // Sincroniza el estado local con la selección global
  useEffect(() => {
    if (isSelected) {
      setIsOpen(true);
    }
  }, [isSelected]);

  const handleToggle = useCallback((e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    
    const willOpen = !isOpen;
    setIsOpen(willOpen);
    
    // Solo actualiza el selectedFolder si el usuario abre la carpeta
    if (willOpen) {
      setSelectedFolder(currentPath);
    } else {
      // Si se cierra y era la carpeta seleccionada, limpiar la selección
      if (isSelected) {
        setSelectedFolder(null);
      }
    }
  }, [isOpen, isSelected, currentPath, setSelectedFolder]);

  return {
    currentPath,
    isSelected,
    isOpen,
    hasChildren,
    handleToggle,
  };
}