import type { FavoriteRepository } from "@/core/favorites/repositories/FavoriteRepository";

/* Obtiene la lista de carpetas únicas utilizadas por los favoritos */

export async function getFavoriteFolders(repo: FavoriteRepository): Promise<string[]> {
  // Si el repo tiene getFolders, úsalo, si no, fallback a carpetas de favoritos
  if (typeof (repo as any).getFolders === 'function') {
    return ((repo as any).getFolders() as Promise<string[]>).then(folders => folders.sort());
  }
  const favorites = await repo.getFavorites();
  const folders = [...new Set(favorites.map(fav => fav.folder))];
  return folders.sort();
}
