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
        title="Nueva Carpeta"
        description="Crea una carpeta para organizar tus favoritos visualmente."
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleCreateFolder();
          }}
        >
          <div className="space-y-3.5 mb-5">
            <div>
              <label
                htmlFor="folder-name"
                className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5"
              >
                Nombre de la carpeta
              </label>
              <input
                id="folder-name"
                type="text"
                placeholder="Ejemplo: Desarrollo, Noticias, Recursos..."
                value={folderName}
                onChange={(e) => setFolderName(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-zinc-300 dark:border-zinc-700 rounded-lg bg-zinc-50/50 dark:bg-zinc-800/80 text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 transition-all"
                required
                aria-required="true"
                disabled={isLoading}
                autoFocus
              />
            </div>

            <div>
              <label
                htmlFor="folder-parent"
                className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5"
              >
                Ubicación
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
                className="w-full px-3 py-2 text-sm border border-zinc-300 dark:border-zinc-700 rounded-lg bg-zinc-50/50 dark:bg-zinc-800/80 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 transition-all cursor-pointer"
                aria-label="Seleccionar carpeta contenedora"
                disabled={isLoading}
              >
                <option value="">Raíz (nivel principal)</option>
                {flattenFolderPaths(folders).map((pathArr) => (
                  <option key={pathArr.join("/")} value={pathArr.join("/")}>
                    📂 {pathArr.join(" / ")}
                  </option>
                ))}
                <option value="__explore__">🔍 Explorar todas las carpetas...</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2.5 pt-2 border-t border-zinc-100 dark:border-zinc-800">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 text-xs font-medium bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 rounded-lg cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400"
              aria-label="Cancelar creación de carpeta"
              disabled={isLoading}
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={isLoading}
              className="px-3.5 py-1.5 text-xs font-medium bg-gradient-to-r from-cyan-600 to-blue-600 hover:brightness-110 text-white rounded-lg cursor-pointer disabled:opacity-50 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 shadow-sm"
              aria-label={isLoading ? "Creando carpeta..." : "Crear nueva carpeta"}
            >
              {isLoading ? "Creando..." : "Crear Carpeta"}
            </button>
          </div>
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
