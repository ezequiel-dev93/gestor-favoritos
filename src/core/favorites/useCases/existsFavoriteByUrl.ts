import type { FavoriteRepository } from "@/core/favorites/repositories/FavoriteRepository";

/* Verifica si ya existe un favorito con una URL específica */
export async function existsFavoriteByUrl(
  url: string,
  repo: FavoriteRepository
): Promise<boolean> {
  const favorites = await repo.getFavorites();
  return favorites.some((fav) => fav.url === url);
}
