import type { FavoriteRepository } from "@/core/favorites/repositories/FavoriteRepository";
import type { Favorite } from "@/core/favorites/entities/Favorite";
import type { FolderNode } from "@/core/favorites/entities/FolderNode";

export interface ExportData {
  version: "1.0";
  exportedAt: string;
  favorites: Favorite[];
  folders: FolderNode[];
}

/**
 * exportFavorites — SRP: único responsable de serializar y descargar el backup.
 * No sabe nada de UI, solo produce el archivo JSON y lo dispara como descarga.
 */
export async function exportFavorites(repo: FavoriteRepository): Promise<void> {
  const [favorites, folders] = await Promise.all([
    repo.getFavorites(),
    repo.getFolders(),
  ]);

  const data: ExportData = {
    version: "1.0",
    exportedAt: new Date().toISOString(),
    favorites,
    folders,
  };

  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json",
  });
  const url  = URL.createObjectURL(blob);
  const date = new Date().toISOString().split("T")[0];

  const anchor      = document.createElement("a");
  anchor.href       = url;
  anchor.download   = `favoritos-backup-${date}.json`;
  anchor.click();

  // Liberar la URL del objeto una vez disparada la descarga
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
