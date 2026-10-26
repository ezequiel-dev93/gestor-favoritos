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
      <Modal open={open} onClose={onClose} title="Guardar favorito">
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between gap-2 px-4 pt-1">
            <span className="text-xs text-zinc-500 dark:text-zinc-400 truncate">
              Carpeta:{" "}
              <strong className="text-zinc-800 dark:text-zinc-200">
                {selectedFolder && selectedFolder.length > 0
                  ? selectedFolder.join(" / ")
                  : "Ninguna seleccionada"}
              </strong>
            </span>
            <button
              type="button"
              onClick={() => setFolderExplorerOpen(true)}
              className="text-xs px-3 py-1.5 shrink-0 bg-gradient-to-r from-purple-500 via-purple-600 to-purple-700 hover:brightness-110 text-white focus:ring-2 focus:outline-none focus:ring-purple-400 font-medium rounded-lg text-center cursor-pointer transition-all"
            >
              {selectedFolder ? "Cambiar carpeta" : "Seleccionar carpeta"}
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
