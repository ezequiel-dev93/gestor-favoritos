import { useState } from "react";
import { useFavoritesStore } from "@/ui/hooks/useFavoritesStore";
import FolderExplorerModal from "@/ui/features/FolderExplorerModal/FolderExplorerModal";
import { flattenFolderPaths } from "@/core/favorites/entities/FolderNode";
import { notifySuccess, notifyError } from "@/core/utils/notify";
import { Modal } from "@/ui/components/Modal";

interface AddFolderModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AddFolderModal = ({ isOpen, onClose }: AddFolderModalProps) => {
  const [folderName, setFolderName] = useState("");
  const [selectedParentPath, setSelectedParentPath] = useState<string[] | null>(null);
  const [explorerOpen, setExplorerOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const folders = useFavoritesStore((state) => state.folders);
  const addFolder = useFavoritesStore((state) => state.addFolder);

  const handleCreateFolder = async () => {
    const name = folderName.trim();
    if (name === "") {
      notifyError("Por favor, ingresa un nombre para la carpeta");
      return;
    }

    try {
      setIsLoading(true);
      const path = selectedParentPath ? [...selectedParentPath, name] : [name];
      await addFolder(path);
      notifySuccess(`Carpeta "${name}" creada correctamente`);
      onClose();
      setFolderName("");
      setSelectedParentPath(null);
    } catch (error) {
      notifyError(error instanceof Error ? error.message : "Error al crear carpeta");
    } finally {
      setIsLoading(false);
    }
  };

  const handleExplorerSelect = (folderPath: string[] | null) => {
    setSelectedParentPath(folderPath);
    setExplorerOpen(false);
  };

  return (
    <>
      <Modal 
        open={isOpen} 
        onClose={onClose}
        title="Agregar nueva carpeta"
        className="bg-white dark:bg-zinc-900"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleCreateFolder();
          }}
        >
          <fieldset
            className="border border-zinc-300 dark:border-zinc-700 p-4 rounded-md mb-4"
          >
            <legend className="text-base font-semibold text-zinc-700 dark:text-white px-1">
              Información de la carpeta
            </legend>

            <div className="mb-4">
              <label
                htmlFor="folder-name"
                className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1"
              >
                Nombre de la carpeta
              </label>
              <input
                id="folder-name"
                type="text"
                placeholder="Ejemplo: Mis documentos"
                value={folderName}
                onChange={(e) => setFolderName(e.target.value)}
                className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-md bg-transparent text-zinc-900 dark:text-white"
                required
                aria-required="true"
                disabled={isLoading}
              />
            </div>

            <div>
              <label
                htmlFor="folder-parent"
                className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1"
              >
                Guardar en
              </label>
              <select
                id="folder-parent"
                value={selectedParentPath ? selectedParentPath.join("/") : ""}
                onChange={(e) => {
                  if (e.target.value === "__explore__") {
                    setExplorerOpen(true);
                  } else {
                    setSelectedParentPath(
                      e.target.value ? e.target.value.split("/") : null
                    );
                  }
                }}
                className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-md bg-transparent text-zinc-900 dark:text-white"
                aria-label="Seleccionar carpeta contenedora"
                disabled={isLoading}
              >
                <option value="">Raíz (sin carpeta)</option>
                {flattenFolderPaths(folders).map((pathArr) => (
                  <option key={pathArr.join("/")} value={pathArr.join("/")}>
                    {pathArr.join(" / ")}
                  </option>
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
              disabled={isLoading}
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 text-sm bg-primary text-white rounded-md hover:bg-purple-600 cursor-pointer disabled:opacity-50"
              aria-label={isLoading ? "Creando carpeta..." : "Crear nueva carpeta"}
            >
              {isLoading ? "Creando..." : "Crear Carpeta"}
            </button>
          </article>
        </form>
      </Modal>

      {explorerOpen && (
        <FolderExplorerModal
          open={explorerOpen}
          folders={folders}
          onClose={() => setExplorerOpen(false)}
          onSelect={handleExplorerSelect}
        />
      )}
    </>
  );
};

export default AddFolderModal;