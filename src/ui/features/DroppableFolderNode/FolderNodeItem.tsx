import React, { useState } from "react";
import { FiX, FiChevronRight, FiEdit3 } from "react-icons/fi";
import { FcOpenedFolder } from "react-icons/fc";
import type { FolderNode } from "@/core/favorites/entities/FolderNode";
import { notifySuccess, notifyError } from "@/core/utils/notify";

interface FolderNodeItemProps {
  node: FolderNode;
  isSelected: boolean;
  isOpen: boolean;
  hasChildren: boolean;
  handleToggle: () => void;
  handleDelete: () => void;
  currentPath: string[];
  onUpdateName?: (path: string[], newName: string) => Promise<void>;
  level: number;
}

export const FolderNodeItem: React.FC<FolderNodeItemProps> = ({
  node,
  isSelected,
  isOpen,
  hasChildren,
  handleToggle,
  handleDelete,
  currentPath,
  onUpdateName,
  level,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState(node.name);
  const [isLoading, setIsLoading] = useState(false);

  const handleEdit = async () => {
    if (newName.trim() === "") {
      notifyError("El nombre no puede estar vacío");
      return;
    }

    if (newName === node.name) {
      setIsEditing(false);
      return;
    }

    if (onUpdateName) {
      setIsLoading(true);
      try {
        await onUpdateName(currentPath, newName);
        notifySuccess("Carpeta renombrada");
        setIsEditing(false);
      } catch (error) {
        notifyError(error instanceof Error ? error.message : "Error al renombrar carpeta");
        setNewName(node.name);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setNewName(node.name);
  };

  return (
    <article
      className={`flex items-center justify-between px-2 py-1 cursor-pointer ${
        isSelected ? "bg-blue-100 dark:bg-gray-500 px-2 rounded-md" : ""
      }`}
      style={{ paddingLeft: `${level * 1.5}rem` }}
    >
      <div className="flex items-center gap-1 flex-1" onClick={isEditing ? undefined : handleToggle}>
        {hasChildren && !isEditing && (
          <FiChevronRight
            className={`transition-transform ${
              isOpen ? "rotate-90" : ""
            }`}
          />
        )}
        {!isEditing && <FcOpenedFolder />}

        {isEditing ? (
          <div className="flex items-center gap-1 flex-1">
            <FcOpenedFolder />
            <input
              type="text"
              className="flex-1 rounded border border-zinc-300 dark:border-zinc-700 px-2 py-0.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-zinc-800"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleEdit();
                if (e.key === "Escape") handleCancel();
              }}
              onClick={(e) => e.stopPropagation()}
              disabled={isLoading}
              autoFocus
              aria-label="Editar nombre de carpeta"
            />
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleEdit();
              }}
              className="text-xs text-blue-600 hover:underline px-1"
              disabled={isLoading}
              aria-label="Guardar nombre"
            >
              Guardar
            </button>
          </div>
        ) : (
          <span className="flex-1">{node.name}</span>
        )}
      </div>

      {!isEditing && (
        <div className="flex items-center gap-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsEditing(true);
            }}
            aria-label={`Editar carpeta ${node.name}`}
            className="text-zinc-400 hover:text-blue-500 p-1"
            title="Renombrar carpeta"
          >
            <FiEdit3 size={14} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDelete();
            }}
            aria-label={`Eliminar carpeta ${node.name}`}
            className="text-red-500 hover:text-red-700 p-1"
            title="Eliminar carpeta"
          >
            <FiX size={16} />
          </button>
        </div>
      )}
    </article>
  );
};
