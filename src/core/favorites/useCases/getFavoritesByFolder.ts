import type { Favorite } from "@/core/favorites/entities/Favorite";
import type { FavoriteRepository } from "@/core/favorites/repositories/FavoriteRepository";

/* Obtiene los favoritos que pertenecen a una carpeta específica */
// Obtiene los favoritos de una carpeta (ruta completa)
export async function getFavoritesByFolder(
  folderPath: string[],
  repo: FavoriteRepository
): Promise<Favorite[]> {
  const favorites = await repo.getFavorites();
  const pathStr = folderPath.join("/");
  return favorites.filter((fav) => fav.folder === pathStr);
}
