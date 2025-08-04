import React, { useState } from "react";
import AddFavoriteForm from "@/ui/features/AddFavoriteForm/AddFavoriteForm";
import { Modal } from "@/ui/components/Modal";
import { FolderExplorerModal } from "@/ui/features/FolderExplorerModal/FolderExplorerModal";
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

  const handleSelectFolder = (folderPath: string[]) => {
    setSelectedFolder(folderPath);
    setFolderExplorerOpen(false);
  }

  return (
    <>
      <Modal open={open} onClose={onClose} title="Guardar favorito">
        <div className="flex flex-col gap-4">
          <button
            onClick={() => setFolderExplorerOpen(true)}
            className="text-sm text-blue-600 hover:underline self-end"
          >
            Seleccionar carpeta
          </button>

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
