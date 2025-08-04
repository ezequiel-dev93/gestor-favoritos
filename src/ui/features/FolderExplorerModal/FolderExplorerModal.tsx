import React, { useState } from "react";
import { useFavoritesStore } from "@/ui/hooks/useFavoritesStore";
import { toast } from "sonner";

interface FolderExplorerModalProps {
  open: boolean;
  folders: string[];
  onSelect: (folderName: string) => void;
  onClose: () => void;
}

export const FolderExplorerModal: React.FC<FolderExplorerModalProps> = ({
  open,
  folders,
  onSelect,
  onClose,
}) => {
  const [selectedName, setSelectedName] = useState<string>(folders[0] || "");
  const [localFolders, setLocalFolders] = useState<string[]>(folders);
  const [newFolderName, setNewFolderName] = useState("");
  const [error, setError] = useState("");
  const addFolder = useFavoritesStore((state) => state.addFolder);

  React.useEffect(() => {
    setLocalFolders(folders);
  }, [folders]);

  const handleConfirm = () => {
    if (selectedName) {
      onSelect(selectedName);
      onClose();
    }
  };
const handleCreateFolder = async () => {
  const trimmed = newFolderName.trim();

  if (!trimmed) {
    toast.error("El nombre de la carpeta es obligatorio", {
      description: "Debes ingresar un nombre antes de crear la carpeta.",
    });
    return;
  }

  if (localFolders.some(f => f.toLowerCase() === trimmed.toLowerCase())) {
    toast.error("Ya existe una carpeta con ese nombre", {
      description: "Elige un nombre diferente para evitar duplicados.",
    });
    return;
  }

  await addFolder(trimmed);
  setLocalFolders((prev) => [...prev, trimmed]);
  setSelectedName(trimmed);
  setNewFolderName("");
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
              value={selectedName}
              onChange={(e) => setSelectedName(e.target.value)}
              className="w-full px-4 py-2 border rounded-md dark:bg-zinc-700 dark:text-white"
              aria-describedby="folder-select-description"
            >
              {localFolders.map((folder) => (
                <option key={folder} value={folder}>
                  {folder}
                </option>
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
              <label htmlFor="new-folder" className="sr-only">
                Nombre de nueva carpeta
              </label>

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
