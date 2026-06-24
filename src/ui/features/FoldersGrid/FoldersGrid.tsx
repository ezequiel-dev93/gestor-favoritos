import { FolderCard } from "@/ui/features/FoldersGrid/FolderCard";
import { useFavoritesStore } from "@/ui/hooks/useFavoritesStore";

interface FoldersGridProps {
  onFavoriteAdded: () => void;
}

/**
 * FoldersGrid — SRP: renderiza el grid responsive de tarjetas de carpetas.
 * No contiene lógica de dominio, solo composición visual.
 */
export function FoldersGrid({ onFavoriteAdded }: FoldersGridProps) {
  const folders          = useFavoritesStore((s) => s.folders);
  const favorites        = useFavoritesStore((s) => s.favorites);
  const deleteFolder     = useFavoritesStore((s) => s.deleteFolder);
  const updateFolderName = useFavoritesStore((s) => s.updateFolderName);

  if (folders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 gap-4 text-zinc-400 select-none">
        <span className="text-6xl" aria-hidden="true">📁</span>
        <p className="text-sm">Creá tu primera carpeta para empezar</p>
      </div>
    );
  }

  return (
    <div
      className="grid gap-4 content-start"
      style={{ gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))" }}
      aria-label="Carpetas de favoritos"
    >
      {folders.map((folder) => (
        <FolderCard
          key={folder.name}
          folder={folder}
          path={[]}
          favorites={favorites}
          onUpdateName={updateFolderName}
          onDeleteFolder={deleteFolder}
          onFavoriteAdded={onFavoriteAdded}
        />
      ))}
    </div>
  );
}
