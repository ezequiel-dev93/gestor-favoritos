import type { FavoriteRepository } from "@/core/favorites/repositories/FavoriteRepository";

/* Obtiene la lista de carpetas únicas utilizadas por los favoritos */

export async function getFavoriteFolders(repo: FavoriteRepository): Promise<string[]> {
  const favorites = await repo.getFavorites();
  const folders = [...new Set(favorites.map(fav => fav.folder))];
  return folders.sort();
}
