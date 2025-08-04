import type { Favorite } from "@/core/favorites/entities/Favorite";
import type { FavoriteRepository } from "@/core/favorites/repositories/FavoriteRepository";
// import type { FolderNode } from "@/core/favorites/entities/FolderNode";
import { removeFolderNode, flattenFolderPaths } from "@/core/favorites/entities/FolderNode";
import type { FolderNode } from "@/core/favorites/entities/FolderNode";

/* Implementación del repositorio utilizando Chrome Storage API */
export class ChromeStorageRepository implements FavoriteRepository {
  private readonly STORAGE_KEY = "favorites";
  private readonly FOLDERS_KEY = "folders";

  async getFavorites(): Promise<Favorite[]> {
    try {
      const result = await chrome.storage.sync.get(this.STORAGE_KEY);
      return result[this.STORAGE_KEY] || [];
    } catch (error) {
      console.error("Error al leer de chrome.storage.sync:", error);
      return [];
    }
  }

  async getFolders(): Promise<FolderNode[]> {
    try {
      const result = await chrome.storage.sync.get(this.FOLDERS_KEY);
      return result[this.FOLDERS_KEY] || [];
    } catch (error) {
      console.error("Error al leer carpetas:", error);
      return [];
    }
  }

  async saveFolders(folders: FolderNode[]): Promise<void> {
    try {
      await chrome.storage.sync.set({ [this.FOLDERS_KEY]: folders });
    } catch (error) {
      console.error("Error al guardar carpetas:", error);
      throw new Error("No se pudieron guardar las carpetas.");
    }
  }

  async getFavoriteById(id: string): Promise<Favorite | null> {
    try {
      const favorites = await this.getFavorites();
      return favorites.find((fav) => fav.id === id) || null;
    } catch (error) {
      console.error(`Error al obtener favorito con ID ${id}:`, error);
      return null;
    }
  }

  async updateFavorite(id: string, updatedData: Omit<Favorite, "id">): Promise<Favorite> {
    try {
      const favorites = await this.getFavorites();
      const index = favorites.findIndex((fav) => fav.id === id);
      if (index === -1) throw new Error(`No se encontró favorito con ID: ${id}`);

      const updatedFavorite: Favorite = { ...updatedData, id };
      favorites[index] = updatedFavorite;
      await this.saveFavorites(favorites);
      return updatedFavorite;
    } catch (error) {
      console.error(`Error al actualizar favorito con ID ${id}:`, error);
      throw new Error(`No se pudo actualizar el favorito: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async deleteFavorite(id: string): Promise<void> {
    try {
      const favorites = await this.getFavorites();
      const updated = favorites.filter((fav) => fav.id !== id);
      await this.saveFavorites(updated);
    } catch (error) {
      console.error(`Error al eliminar favorito con ID ${id}:`, error);
      throw new Error(`No se pudo eliminar el favorito: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async clearAllFavorites(): Promise<void> {
    try {
      await chrome.storage.sync.set({ [this.STORAGE_KEY]: [] });
      console.info("Todos los favoritos han sido eliminados");
    } catch (error) {
      console.error("Error al eliminar todos los favoritos:", error);
      throw new Error(`No se pudieron eliminar todos los favoritos: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async saveFavorites(favorites: Favorite[]): Promise<void> {
    try {
      await chrome.storage.sync.set({ [this.STORAGE_KEY]: favorites });
    } catch (error) {
      console.error("Error al guardar favoritos:", error);
      throw new Error("No se pudieron guardar los favoritos.");
    }
  }

  async deleteFolder(folderPath: string[]): Promise<void> {
    try {
      // Eliminar favoritos de la carpeta y subcarpetas
      const data = await chrome.storage.sync.get(this.STORAGE_KEY);
      const favorites: Favorite[] = data[this.STORAGE_KEY] || [];
      // Obtener todas las rutas a eliminar (carpeta y subcarpetas)
      const foldersTree = await this.getFolders();
      const allPaths = flattenFolderPaths(foldersTree);
      const toDelete = allPaths.filter(pathArr => pathArr.length >= folderPath.length && pathArr.slice(0, folderPath.length).join("/") === folderPath.join("/"));
      const toDeleteSet = new Set(toDelete.map(pathArr => pathArr.join("/")));
      const filtered = favorites.filter(fav => !toDeleteSet.has(fav.folder));
      await chrome.storage.sync.set({ [this.STORAGE_KEY]: filtered });
      // Eliminar la carpeta y subcarpetas del árbol
      const updatedFolders = removeFolderNode(foldersTree, folderPath);
      await this.saveFolders(updatedFolders);
    } catch (error) {
      console.error("Error al eliminar carpeta:", error);
      throw new Error("No se pudo eliminar la carpeta.");
    }
  }
}
