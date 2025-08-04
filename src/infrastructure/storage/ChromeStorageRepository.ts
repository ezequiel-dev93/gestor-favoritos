import type { Favorite } from "@/core/favorites/entities/Favorite";
import type { FavoriteRepository } from "@/core/favorites/repositories/FavoriteRepository";

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

  async getFolders(): Promise<string[]> {
    try {
      const result = await chrome.storage.sync.get(this.FOLDERS_KEY);
      return result[this.FOLDERS_KEY] || [];
    } catch (error) {
      console.error("Error al leer carpetas:", error);
      return [];
    }
  }

  async saveFolders(folders: string[]): Promise<void> {
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

  async deleteFolder(folderName: string): Promise<void> {
    try {
      const data = await chrome.storage.sync.get(this.STORAGE_KEY);
      const favorites: Favorite[] = data[this.STORAGE_KEY] || [];
      const filtered = favorites.filter(fav => fav.folder !== folderName);
      await chrome.storage.sync.set({ [this.STORAGE_KEY]: filtered });
      // Elimina la carpeta de la lista de carpetas
      const folders = await this.getFolders();
      const updatedFolders = folders.filter(f => f !== folderName);
      await this.saveFolders(updatedFolders);
    } catch (error) {
      console.error("Error al eliminar carpeta:", error);
      throw new Error("No se pudo eliminar la carpeta.");
    }
  }
}
