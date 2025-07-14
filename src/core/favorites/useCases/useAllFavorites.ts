import type { Favorite } from "@/core/favorites/entities/Favorite";
import type { FavoriteRepository } from "@/core/favorites/repositories/FavoriteRepository";

/* Obtiene todos los favoritos desde el repositorio */
export async function getAllFavorites(repo: FavoriteRepository): Promise<Favorite[]> {
  return await repo.getFavorites();
}
