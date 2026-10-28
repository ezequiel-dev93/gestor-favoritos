import React, { useEffect, useState } from "react";
import AddFavoriteForm from "@/ui/features/AddFavoriteForm/AddFavoriteForm";
import { Modal } from "@/ui/components/Modal";
import FolderExplorerModal from "@/ui/features/FolderExplorerModal/FolderExplorerModal";
import { useFavoritesStore } from "@/ui/hooks/useFavoritesStore";

interface AddFavoriteModalProps {
  url: string;
  folder?: string[] | null;
  open: boolean;
  onClose: () => void;
  onSave?: () => void;
}

export const AddFavoriteModal: React.FC<AddFavoriteModalProps> = ({
  url,
  folder,
  open,
  onClose,
  onSave,
}) => {
  const { folders } = useFavoritesStore();
  const [folderExplorerOpen, setFolderExplorerOpen] = useState(false);
  const [selectedFolder, setSelectedFolder] = useState<string[] | null>(folder || null);

  useEffect(() => {
    if (open) {
      setSelectedFolder(folder || null);
    }
  }, [open, folder]);

  const handleSelectFolder = (folderPath: string[]) => {
    setSelectedFolder(folderPath);
    setFolderExplorerOpen(false);
  };

  return (
    <>
      <Modal 
        open={open} 
        onClose={onClose} 
        title="Guardar favorito"
        description="Agrega un nuevo enlace y asígnalo a una carpeta."
      >
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between gap-2 p-2.5 rounded-lg bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/80 dark:border-zinc-700/60">
            <span className="text-xs text-zinc-500 dark:text-zinc-400 truncate">
              Carpeta:{" "}
              <strong className="text-zinc-800 dark:text-zinc-100 font-semibold">
                {selectedFolder && selectedFolder.length > 0
                  ? selectedFolder.join(" / ")
                  : "Raíz (sin carpeta)"}
              </strong>
            </span>
            <button
              type="button"
              onClick={() => setFolderExplorerOpen(true)}
              className="text-xs px-2.5 py-1 shrink-0 bg-gradient-to-r from-cyan-500 via-sky-600 to-blue-600 hover:brightness-110 text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 font-medium rounded-md text-center cursor-pointer transition-all shadow-sm"
            >
              {selectedFolder ? "Cambiar" : "Elegir carpeta"}
            </button>
          </div>

          <AddFavoriteForm
            url={url}
            initialFolder={selectedFolder}
            onSave={() => {
              onSave?.();
              onClose();
            }}
          />
        </div>
      </Modal>

      <FolderExplorerModal
        open={folderExplorerOpen}
        folders={folders}
        onClose={() => setFolderExplorerOpen(false)}
        onSelect={handleSelectFolder}
      />
    </>
  );
};
