import type { Favorite } from "@/core/favorites/entities/Favorite"
import type { FolderNode } from "@/core/favorites/entities/FolderNode"

/* Interfaz que va a definir el acceso al almacenamiento de favoritos */

export interface FavoriteRepository {
  getFavorites(): Promise<Favorite[]>;
  getFavoriteById(id: string): Promise<Favorite | null>;
  updateFavorite(id: string, updatedData: Omit<Favorite, "id">): Promise<Favorite>;
  deleteFavorite(id: string): Promise<void>;
  clearAllFavorites(): Promise<void>;
  saveFavorites(favorites: Favorite[]): Promise<void>;

  // Métodos para carpetas anidadas
  getFolders(): Promise<FolderNode[]>;
  saveFolders(folders: FolderNode[]): Promise<void>;
  deleteFolder(folderPath: string[]): Promise<void>;
}
