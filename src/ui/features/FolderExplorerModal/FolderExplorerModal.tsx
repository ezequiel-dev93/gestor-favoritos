import React, { useEffect, useState } from "react";
import type { FolderNode } from "@/core/favorites/entities/FolderNode";
import { useFavoritesStore } from "@/ui/hooks/useFavoritesStore";
import { Modal } from "@/ui/components/Modal";
import { DroppableFolderNode } from "@/ui/features/DroppableFolderNode/DroppableFolderNode";

interface FolderExplorerModalProps {
  open: boolean;
  folders: FolderNode[];
  onClose: () => void;
  onSelect: (folderPath: string[]) => void;
}

const FolderExplorerModal: React.FC<FolderExplorerModalProps> = ({
  open,
  folders,
  onClose,
  onSelect,
}) => {
  const { deleteFolder } = useFavoritesStore();
  const [selectedFolder, setSelectedFolder] = useState<string[] | null>(null);
  const [liveMsg, setLiveMsg] = useState<string>("");

  useEffect(() => {
    if (open) {
      setSelectedFolder(null);
      setLiveMsg("");
    }
  }, [open]);

  const handleSelect = () => {
    if (!selectedFolder) return;
    onSelect(selectedFolder);
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title="Seleccionar carpeta">
      <p className="sr-only" role="status" aria-live="polite">
        {liveMsg}
      </p>

      <div className="mt-4 max-h-[320px] overflow-y-auto rounded-lg border border-zinc-200 dark:border-zinc-800">
        <DroppableFolderNode
          nodes={folders}
          selectedFolder={selectedFolder}
          setSelectedFolder={(next) => {
            setSelectedFolder(next);
            setLiveMsg(
              next && next.length > 0
                ? `Carpeta seleccionada: ${next.join(" / ")}`
                : "Ninguna carpeta seleccionada"
            );
          }}
          deleteFolder={(path) => {
            if (
              confirm(
                `¿Seguro que deseas eliminar la carpeta "${path.join(
                  " / "
                )}"? Esta acción no se puede deshacer.`
              )
            ) {
              deleteFolder(path);
            }
          }}
          level={0}
        />
      </div>

      <div className="mt-6 flex justify-end gap-3">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 rounded-lg bg-zinc-200 text-zinc-800 hover:bg-zinc-300 transition dark:bg-zinc-700 dark:text-white dark:hover:bg-zinc-600"
        >
          Cancelar
        </button>
        <button
          type="button"
          onClick={handleSelect}
          disabled={!selectedFolder}
          className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition disabled:bg-zinc-400 disabled:cursor-not-allowed"
          aria-disabled={!selectedFolder}
          aria-label={
            selectedFolder
              ? `Seleccionar carpeta ${selectedFolder.join(" / ")}`
              : "Seleccionar carpeta (deshabilitado)"
          }
        >
          Seleccionar
        </button>
      </div>
    </Modal>
  );
};

export default FolderExplorerModal;
