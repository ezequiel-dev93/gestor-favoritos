import type { Favorite } from "@/core/favorites/entities/Favorite";
import type { FavoriteRepository } from "@/core/favorites/repositories/FavoriteRepository";

/* Actualiza un favorito existente con nuevos datos */
export async function updateFavorite(
  id: string,
  updatedData: Omit<Favorite, "id">,
  repo: FavoriteRepository
): Promise<Favorite> {
  return await repo.updateFavorite(id, updatedData);
}
