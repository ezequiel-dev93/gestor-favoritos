import type { Favorite } from "@/core/favorites/entities/Favorite"

/* Interfaz que va a definir el acceso al almacenamiento de favoritos */

export interface FavoriteRepository {

  getFavorites(): Promise<Favorite[]>;

  getFavoriteById(id: string): Promise<Favorite | null>;

  updateFavorite(id: string, updatedData: Omit<Favorite, "id">): Promise<Favorite>;

  deleteFavorite(id: string): Promise<void>;

  clearAllFavorites(): Promise<void>;

  saveFavorites(favorites: Favorite[]): Promise<void>;

  deleteFavorite(id: string): Promise<void>;

}
