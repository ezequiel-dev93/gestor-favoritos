import React, { useState } from "react";
import { useFavoritesStore } from "@/ui/hooks/useFavoritesStore";
import { notifyError } from "@/core/utils/notify";
import type { FolderNode } from "@/core/favorites/entities/FolderNode";
import { flattenFolderPaths } from "@/core/favorites/entities/FolderNode";

interface FolderExplorerModalProps {
  open: boolean;
  folders: FolderNode[];
  onSelect: (folderPath: string[]) => void;
  onClose: () => void;
}

export const FolderExplorerModal: React.FC<FolderExplorerModalProps> = (props) => {
  const { open, folders, onSelect, onClose } = props;
  const allPaths = flattenFolderPaths(folders);
  const [selectedPath, setSelectedPath] = useState<string[]>(allPaths[0] || []);
  const [newFolderName, setNewFolderName] = useState("");
  const [parentPath, setParentPath] = useState<string[]>([]);
  const [error, setError] = useState("");
  const addFolder = useFavoritesStore((state) => state.addFolder);

  React.useEffect(() => {
    // Si cambian las carpetas, resetear selección
    const newAllPaths = flattenFolderPaths(folders);
    setSelectedPath(newAllPaths[0] || []);
    setParentPath([]);
  }, [folders]);

  const handleConfirm = () => {
    if (selectedPath && selectedPath.length > 0) {
      onSelect(selectedPath);
      onClose();
    }
  };

  const handleCreateFolder = async () => {
    const trimmed = newFolderName.trim();
    if (!trimmed) {
      notifyError("El nombre de la carpeta es obligatorio");
      return;
    }
    // Verificar si ya existe en el path seleccionado
    const exists = flattenFolderPaths(folders).some(
      (p) => p.length === parentPath.length + 1 &&
        p.slice(0, parentPath.length).every((seg, i) => seg === parentPath[i]) &&
        p[parentPath.length].toLowerCase() === trimmed.toLowerCase()
    );
    if (exists) {
      notifyError("Ya existe una carpeta con ese nombre en este nivel");
      return;
    }
    const newPath = [...parentPath, trimmed];
    await addFolder(newPath);
    setNewFolderName("");
    setParentPath([]);
    setSelectedPath(newPath);
  };

  if (!open) return null;

  return (
    <section
      className="fixed inset-0 z-50 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="folder-explorer-title"
    >
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
        aria-hidden="true"
      />

      <section
        className="relative bg-white dark:bg-zinc-800 rounded-lg shadow-xl p-6 w-full max-w-md mx-2"
        onClick={e => e.stopPropagation()}
      >
        <h2
          id="folder-explorer-title"
          className="text-lg font-bold mb-4 text-zinc-800 dark:text-zinc-100"
        >
          Seleccionar carpeta
        </h2>

        <button
          className="absolute top-3 right-3 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
          onClick={onClose}
          title="Cerrar"
          aria-label="Cerrar modal"
        >
          ×
        </button>

        <form className="flex flex-col gap-4">
          <fieldset className="border border-zinc-300 dark:border-zinc-600 rounded p-4">
            <legend className="text-sm font-semibold text-zinc-600 dark:text-zinc-300 mb-2">
              Carpetas existentes
            </legend>
            <label htmlFor="folder-select" className="sr-only">
              Lista de carpetas
            </label>
            <select
              id="folder-select"
              value={selectedPath.join("/")}
              onChange={e => {
                const val = e.target.value;
                setSelectedPath(val ? val.split("/") : []);
              }}
              className="w-full px-4 py-2 border rounded-md dark:bg-zinc-700 dark:text-white"
              aria-describedby="folder-select-description"
            >
              {allPaths.map((pathArr) => (
                <option key={pathArr.join("/")} value={pathArr.join("/")}>{pathArr.join(" / ")}</option>
              ))}
            </select>
            <p id="folder-select-description" className="sr-only">
              Selecciona una carpeta para guardar el favorito
            </p>
          </fieldset>

          <fieldset className="border border-zinc-300 dark:border-zinc-600 rounded p-4">
            <legend className="text-sm font-semibold text-zinc-600 dark:text-zinc-300 mb-2">
              Crear nueva carpeta
            </legend>

            <article className="flex gap-2">
              <label htmlFor="parent-folder" className="sr-only">Carpeta padre</label>
              <select
                id="parent-folder"
                value={parentPath.join("/")}
                onChange={e => setParentPath(e.target.value ? e.target.value.split("/") : [])}
                className="px-2 py-2 border rounded-md dark:bg-zinc-700 dark:text-white"
              >
                <option value="">(Raíz)</option>
                {allPaths.map((pathArr) => (
                  <option key={pathArr.join("/")} value={pathArr.join("/")}>{pathArr.join(" / ")}</option>
                ))}
              </select>
              <input
                id="new-folder"
                type="text"
                value={newFolderName}
                onChange={(e) => {
                  setNewFolderName(e.target.value);
                  setError("");
                }}
                placeholder="Nueva carpeta"
                className="flex-1 px-3 py-2 border rounded-md dark:bg-zinc-700 dark:text-white"
                aria-describedby={error ? "error-message" : undefined}
              />
              <button
                type="button"
                onClick={handleCreateFolder}
                className="bg-green-600 text-white px-3 py-2 rounded hover:bg-green-700 transition"
              >
                Crear
              </button>
            </article>
            {error && (
              <span id="error-message" className="text-red-500 text-sm mt-1">
                {error}
              </span>
            )}
          </fieldset>

          <button
            type="button"
            onClick={handleConfirm}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition self-end"
          >
            Confirmar
          </button>
        </form>
      </section>
    </section>
  );
};
