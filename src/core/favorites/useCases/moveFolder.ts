import type { FavoriteRepository } from "@/core/favorites/repositories/FavoriteRepository";
import {
  findFolderNode,
  removeFolderNode,
  insertFolderNode,
  flattenFolderPaths,
} from "@/core/favorites/entities/FolderNode";

export async function moveFolder(
  sourcePath: string[],
  targetPath: string[], // empty array means root
  repo: FavoriteRepository
): Promise<void> {
  const folders = await repo.getFolders();

  // 1. Validar que no se intente mover una carpeta dentro de sí misma
  const sourcePathStr = sourcePath.join("/");
  const targetPathStr = targetPath.join("/");
  if (targetPathStr.startsWith(sourcePathStr)) {
    throw new Error("No se puede mover una carpeta dentro de sí misma o de una de sus subcarpetas.");
  }

  // 2. Encontrar el nodo a mover
  const nodeToMove = findFolderNode(folders, sourcePath);
  if (!nodeToMove) {
    throw new Error("No se encontró la carpeta de origen.");
  }

  // 3. Obtener todas las rutas antiguas de la carpeta y sus subcarpetas
  const sourcePrefix = sourcePath.slice(0, -1);
  const oldPaths = flattenFolderPaths([nodeToMove], sourcePrefix);

  // 4. Mover la carpeta en el árbol
  const foldersWithoutNode = removeFolderNode(folders, sourcePath);
  const updatedFolders = insertFolderNode(foldersWithoutNode, targetPath, nodeToMove);

  // 5. Obtener todas las rutas nuevas correspondientes
  const newPaths = flattenFolderPaths([nodeToMove], targetPath);

  // 6. Actualizar las rutas en los favoritos
  const allFavorites = await repo.getFavorites();
  let favoritesChanged = false;

  const oldPathMap = new Map<string, string>();
  for (let i = 0; i < oldPaths.length; i++) {
    oldPathMap.set(oldPaths[i].join("/"), newPaths[i].join("/"));
  }

  const updatedFavorites = allFavorites.map((fav) => {
    const newFolderStr = oldPathMap.get(fav.folder);
    if (newFolderStr) {
      favoritesChanged = true;
      return { ...fav, folder: newFolderStr };
    }
    return fav;
  });

  // 7. Guardar cambios
  await repo.saveFolders(updatedFolders);
  if (favoritesChanged) {
    // Usamos saveFavorites para actualizar todos a la vez.
    await repo.saveFavorites(updatedFavorites);
  }
}
