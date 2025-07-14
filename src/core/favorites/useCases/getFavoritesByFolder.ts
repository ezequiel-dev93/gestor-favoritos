import type { Favorite } from "@/core/favorites/entities/Favorite";
import type { FavoriteRepository } from "@/core/favorites/repositories/FavoriteRepository";

/* Obtiene los favoritos que pertenecen a una carpeta específica */
 export async function getFavoritesByFolder(
  folder: string,
  repo: FavoriteRepository
): Promise<Favorite[]> {
  const favorites = await repo.getFavorites();
  return favorites.filter((fav) => fav.folder === folder);
}
