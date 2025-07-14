import type { FavoriteRepository } from "@/core/favorites/repositories/FavoriteRepository";

/* Elimina un favorito por su ID */
export async function deleteFavorite(
  id: string,
  repo: FavoriteRepository
): Promise<void> {
  await repo.deleteFavorite(id);
}
