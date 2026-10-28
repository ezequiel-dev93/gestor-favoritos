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
    <Modal 
      open={open} 
      onClose={onClose} 
      title="Seleccionar carpeta"
      description="Elige la carpeta de destino donde se guardará el favorito."
    >
      <p className="sr-only" role="status" aria-live="polite">
        {liveMsg}
      </p>

      <div className="mt-1 max-h-[300px] overflow-y-auto rounded-xl border border-zinc-200/80 dark:border-zinc-800 p-2 bg-zinc-50/50 dark:bg-zinc-800/40">
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
          showFavorites={false}
        />
      </div>

      <div className="mt-4 flex justify-end gap-2.5 pt-3 border-t border-zinc-100 dark:border-zinc-800">
        <button
          type="button"
          onClick={onClose}
          className="px-3.5 py-1.5 text-xs font-medium rounded-lg bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400"
        >
          Cancelar
        </button>
        <button
          type="button"
          onClick={handleSelect}
          disabled={!selectedFolder}
          className="px-3.5 py-1.5 text-xs font-medium rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 hover:brightness-110 text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
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
