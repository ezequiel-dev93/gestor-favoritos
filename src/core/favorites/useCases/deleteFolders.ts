import type { FavoriteRepository } from "@/core/favorites/repositories/FavoriteRepository";

// Elimina una carpeta y todas sus subcarpetas y favoritos asociados
export async function deleteFolder(folderPath: string[], repo: FavoriteRepository): Promise<void> {
  if (typeof repo.deleteFolder === "function") {
    await repo.deleteFolder(folderPath);
  } else {
    throw new Error("El repositorio no soporta carpetas anidadas");
  }
}
