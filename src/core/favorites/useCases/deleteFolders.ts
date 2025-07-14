import type { FavoriteRepository } from "@/core/favorites/repositories/FavoriteRepository";

/* Elimina todos los favoritos que pertenecen a una carpeta específica, es decir, que elimina la carpeta */
export async function deleteFolder(folder: string, repo: FavoriteRepository): Promise<void> {
  const favorites = await repo.getFavorites();
  const updatedFavorites = favorites.filter(fav => fav.folder !== folder);
  await repo.saveFavorites(updatedFavorites);
}
