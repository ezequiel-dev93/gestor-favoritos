import type { Favorite } from "@/core/favorites/entities/Favorite";
import type { FavoriteRepository } from "@/core/favorites/repositories/FavoriteRepository";
import { generateId } from "@/core/utils/generateId";
import { existsFavoriteByUrl } from "@/core/favorites/useCases/existsFavoriteByUrl";

/* Añade un nuevo favorito si no existe ya uno con la misma URL */
export async function addFavorite(
  data: Omit<Favorite, "id">,
  folderPath: string[],
  repo: FavoriteRepository,
  force = false
): Promise<Favorite> {
  const exists = await existsFavoriteByUrl(data.url, repo);
  if (exists && !force) {
    throw new Error("Ya existe un favorito con esa URL.");
  }

  const newFavorite: Favorite = {
    ...data,
    id: generateId(),
    folder: folderPath.join('/'),
  };

  const all = await repo.getFavorites();
  const updated = [...all, newFavorite];
  await repo.saveFavorites(updated);

  return newFavorite;
}