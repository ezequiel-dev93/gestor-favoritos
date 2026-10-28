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
      className={`flex items-center justify-between px-2 py-1 rounded-md transition-colors ${
        isSelected
          ? "bg-cyan-100 dark:bg-cyan-950/50 text-cyan-900 dark:text-cyan-200 font-medium"
          : "hover:bg-zinc-100 dark:hover:bg-zinc-800/60"
      }`}
      style={{ paddingLeft: `${level * 1.25 + 0.5}rem` }}
    >
      {isEditing ? (
        <div className="flex items-center gap-1.5 flex-1">
          <FcOpenedFolder aria-hidden="true" className="shrink-0" />
          <input
            type="text"
            className="flex-1 rounded border border-zinc-300 dark:border-zinc-700 px-2 py-0.5 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
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
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleEdit();
            }}
            className="text-xs text-cyan-600 dark:text-cyan-400 hover:underline px-1.5 py-0.5"
            disabled={isLoading}
            aria-label="Guardar nombre"
          >
            Guardar
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={handleToggle}
          aria-pressed={isSelected}
          aria-expanded={hasChildren ? isOpen : undefined}
          className="flex items-center gap-1.5 flex-1 text-left text-sm min-w-0 py-0.5 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 cursor-pointer"
        >
          {hasChildren && (
            <FiChevronRight
              aria-hidden="true"
              className={`shrink-0 transition-transform ${
                isOpen ? "rotate-90" : ""
              }`}
            />
          )}
          <FcOpenedFolder aria-hidden="true" className="shrink-0" />
          <span className="flex-1 truncate">{node.name}</span>
        </button>
      )}

      {!isEditing && (
        <div className="flex items-center gap-1 shrink-0 ml-2">
          {onUpdateName && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsEditing(true);
              }}
              aria-label={`Editar carpeta ${node.name}`}
              className="min-w-[24px] min-h-[24px] flex items-center justify-center rounded text-zinc-400 hover:text-blue-500"
              title="Renombrar carpeta"
            >
              <FiEdit3 size={14} aria-hidden="true" />
            </button>
          )}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleDelete();
            }}
            aria-label={`Eliminar carpeta ${node.name}`}
            className="min-w-[24px] min-h-[24px] flex items-center justify-center rounded text-red-500 hover:text-red-700"
            title="Eliminar carpeta"
          >
            <FiX size={15} aria-hidden="true" />
          </button>
        </div>
      )}
    </article>
  );
};
