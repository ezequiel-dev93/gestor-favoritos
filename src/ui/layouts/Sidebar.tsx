import { useState, useEffect } from "react";
import { DroppableFolderNode } from "@/ui/features/DroppableFolderNode/DroppableFolderNode";
import { AddFavoriteModal } from "@/ui/features/AddFavoriteModal/AddFavoriteModal";
import AddFolderModal from "@/ui/features/AddFolderModal/AddFolderModal";
import { useFavoritesStore } from "@/ui/hooks/useFavoritesStore";

/**
 * Sidebar — SRP: responsable únicamente de la navegación de carpetas y acciones CRUD.
 * No sabe nada del área de contenido principal ni del layout general.
 */
export function Sidebar() {
  const folders         = useFavoritesStore((s) => s.folders);
  const selectedFolder  = useFavoritesStore((s) => s.selectedFolder);
  const setSelectedFolder = useFavoritesStore((s) => s.setSelectedFolder);
  const deleteFolder    = useFavoritesStore((s) => s.deleteFolder);
  const updateFolderName = useFavoritesStore((s) => s.updateFolderName);
  const loadFolders     = useFavoritesStore((s) => s.loadFolders);

  const [showAddFavorite, setShowAddFavorite] = useState(false);
  const [showAddFolder, setShowAddFolder]     = useState(false);

  // SRP: Sidebar es dueño de la carga de carpetas — no el layout padre
  useEffect(() => {
    loadFolders();
  }, [loadFolders]);

  return (
    <aside
      className="flex flex-col gap-6 w-64 shrink-0 h-full border-r border-zinc-200 dark:border-zinc-800 px-4 py-6 overflow-y-auto"
      aria-label="Panel de carpetas"
    >
      {/* Acciones principales */}
      <div className="flex flex-col gap-3">
        <button
          onClick={() => setShowAddFavorite(true)}
          className="w-full px-3 py-2 text-sm bg-gradient-to-r from-purple-500 via-purple-600 to-purple-700 hover:brightness-110 text-white font-medium rounded-lg cursor-pointer transition-all"
          aria-label="Agregar un nuevo favorito"
        >
          + Agregar Favorito
        </button>

        <button
          onClick={() => setShowAddFolder(true)}
          className="w-full px-3 py-2 text-sm bg-gradient-to-r from-cyan-700 via-cyan-600 to-cyan-500 hover:brightness-110 text-white font-medium rounded-lg cursor-pointer transition-all"
          aria-label="Crear nueva carpeta"
        >
          + Nueva Carpeta
        </button>
      </div>

      {/* Árbol de carpetas */}
      <nav aria-label="Árbol de carpetas" className="flex-1">
        <ul className="flex flex-col gap-1">
          <DroppableFolderNode
            nodes={folders}
            selectedFolder={selectedFolder}
            setSelectedFolder={setSelectedFolder}
            deleteFolder={deleteFolder}
            updateFolderName={updateFolderName}
            level={0}
            showFavorites={false}
          />
        </ul>
      </nav>

      {/* Modales — se renderizan aquí pero son portales, no afectan el layout */}
      <AddFavoriteModal
        url=""
        folder={selectedFolder}
        open={showAddFavorite}
        onClose={() => setShowAddFavorite(false)}
        onSave={() => setShowAddFavorite(false)}
      />
      <AddFolderModal
        isOpen={showAddFolder}
        onClose={() => setShowAddFolder(false)}
      />
    </aside>
  );
}
