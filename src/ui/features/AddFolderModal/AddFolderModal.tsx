import { useState } from "react";
import { createPortal } from "react-dom";
import { useFavoritesStore } from "@/ui/hooks/useFavoritesStore";
import { FolderExplorerModal } from "@/ui/features/FolderExplorerModal/FolderExplorerModal.tsx";
import { flattenFolderPaths } from "@/core/favorites/entities/FolderNode";

interface AddFolderModalProps {
  isOpen: boolean;
  onClose: () => void;
   children?: React.ReactNode;
}

const AddFolderModal = ({ isOpen, onClose }: AddFolderModalProps) => {
  const [folderName, setFolderName] = useState("");
  const [selectedParentPath, setSelectedParentPath] = useState<string[] | null>(null);
  const [explorerOpen, setExplorerOpen] = useState(false);

  const folders = useFavoritesStore((state) => state.folders);
  const addFolder = useFavoritesStore((state) => state.addFolder);

  const handleCreateFolder = async () => {
    const name = folderName.trim();
    if (name === "") return;
    const path = selectedParentPath ? [...selectedParentPath, name] : [name];
    await addFolder(path);
    onClose();
    setFolderName("");
    setSelectedParentPath(null);
  };

  const handleExplorerSelect = (folderPath: string[] | null) => {
    setSelectedParentPath(folderPath);
    setExplorerOpen(false);
  };

  if (!isOpen) return null;

  return createPortal(
    <section
      className="fixed inset-0 bg-black/50 z-40 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-folder-title"
    >
      <section className="bg-white dark:bg-zinc-900 p-6 rounded-xl w-full max-w-md z-50">
        <h2 id="add-folder-title" className="text-xl font-bold text-zinc-800 dark:text-white mb-4">
          Agregar nueva carpeta
        </h2>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleCreateFolder();
          }}
          aria-describedby="form-description"
        >
          <fieldset className="border border-zinc-300 dark:border-zinc-700 p-4 rounded-md mb-4">
            <legend className="text-base font-semibold text-zinc-700 dark:text-white mb-2">
              Información de la carpeta
            </legend>

            <div className="mb-4">
              <label htmlFor="folder-name" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                Nombre de la carpeta
              </label>
              <input
                id="folder-name"
                name="folder-name"
                type="text"
                placeholder="Nombre de la carpeta"
                value={folderName}
                onChange={(e) => setFolderName(e.target.value)}
                className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-md bg-transparent text-zinc-900 dark:text-white"
                required
                aria-required="true"
              />
            </div>

            <div>
              <label htmlFor="folder-parent" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                Guardar en:
              </label>
              <select
                id="folder-parent"
                name="folder-parent"
                value={selectedParentPath ? selectedParentPath.join("/") : ""}
                onChange={(e) => {
                  if (e.target.value === "__explore__") {
                    setExplorerOpen(true);
                  } else {
                    setSelectedParentPath(e.target.value ? e.target.value.split("/") : null);
                  }
                }}
                className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-md bg-transparent text-zinc-900 dark:text-white"
                aria-label="Seleccionar carpeta contenedora"
              >
                <option value="">Raíz (sin carpeta)</option>
                {flattenFolderPaths(folders).map((pathArr) => (
                  <option key={pathArr.join("/")} value={pathArr.join("/")}>{pathArr.join(" / ")}</option>
                ))}
                <option value="__explore__">📂 Seleccionar otra carpeta...</option>
              </select>
            </div>
          </fieldset>

          <article className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm bg-zinc-200 dark:bg-zinc-700 text-zinc-800 dark:text-white rounded-md hover:bg-zinc-300 dark:hover:bg-zinc-600 cursor-pointer"
              aria-label="Cancelar creación de carpeta"
            >
              Cancelar
            </button>

            <button
              type="submit"
              className="px-4 py-2 text-sm bg-primary text-white rounded-md hover:bg-purple-600 cursor-pointer"
              aria-label="Crear nueva carpeta"
            >
              Crear Carpeta
            </button>
          </article>
        </form>
      </section>

      {explorerOpen && (
        <FolderExplorerModal
          open={explorerOpen}
          folders={folders}
          onClose={() => setExplorerOpen(false)}
          onSelect={handleExplorerSelect}
        />
      )}
    </section>,
    document.body
  );
};

export default AddFolderModal;
