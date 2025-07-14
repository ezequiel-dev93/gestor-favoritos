import type { Favorite } from "@/core/favorites/entities/Favorite";
import type { FavoriteRepository } from "@/core/favorites/repositories/FavoriteRepository";

/* Busca favoritos que coincidan con una consulta */
export async function searchFavorites(
  query: string,
  repo: FavoriteRepository
): Promise<Favorite[]> {
  if (!query || query.trim() === "") {
    return await repo.getFavorites();
  }

  const normalizedQuery = query.toLowerCase().trim();
  const favorites = await repo.getFavorites();

  return favorites.filter((fav) =>
    fav.title.toLowerCase().includes(normalizedQuery) ||
    fav.url.toLowerCase().includes(normalizedQuery) ||
    fav.folder.toLowerCase().includes(normalizedQuery)
  );
}
