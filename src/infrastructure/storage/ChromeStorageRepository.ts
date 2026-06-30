import type { Favorite } from "@/core/favorites/entities/Favorite";
import type { FavoriteRepository } from "@/core/favorites/repositories/FavoriteRepository";
import { removeFolderNode, flattenFolderPaths } from "@/core/favorites/entities/FolderNode";
import type { FolderNode } from "@/core/favorites/entities/FolderNode";

/* Implementación del repositorio utilizando Chrome Storage API */
export class ChromeStorageRepository implements FavoriteRepository {
  private readonly STORAGE_KEY = "favorites";
  private readonly FOLDERS_KEY = "folders";
  private readonly CHUNK_SIZE = 7500; // Seguro por debajo de los 8192 bytes de quota

  /** Corta un string en pedazos (chunks) de tamaño especificado */
  private chunkString(str: string, size: number): string[] {
    const numChunks = Math.ceil(str.length / size);
    const chunks = new Array(numChunks);
    for (let i = 0, o = 0; i < numChunks; ++i, o += size) {
      chunks[i] = str.substring(o, o + size);
    }
    return chunks;
  }

  /**
   * Guarda cualquier dato fragmentándolo en múltiples claves
   * para evadir el límite de 8KB por clave de chrome.storage.sync
   */
  private async saveChunkedData<T>(baseKey: string, data: T): Promise<void> {
    const jsonStr = JSON.stringify(data);
    const chunks = this.chunkString(jsonStr, this.CHUNK_SIZE);
    
    // Averiguar cuántos chunks había antes para borrar sobrantes
    const metaKey = `${baseKey}_meta`;
    const metaResult = await chrome.storage.sync.get(metaKey);
    const oldChunksCount = metaResult[metaKey]?.chunks || 0;

    const storageObj: Record<string, any> = {};
    storageObj[metaKey] = { chunks: chunks.length };
    
    chunks.forEach((chunk, index) => {
      storageObj[`${baseKey}_${index}`] = chunk;
    });

    // Guardar metadata y los chunks nuevos en paralelo (en un solo objeto)
    await chrome.storage.sync.set(storageObj);

    // Borrar chunks viejos que ya no se usan si la data nueva es más chica
    if (oldChunksCount > chunks.length) {
      const keysToRemove = [];
      for (let i = chunks.length; i < oldChunksCount; i++) {
        keysToRemove.push(`${baseKey}_${i}`);
      }
      await chrome.storage.sync.remove(keysToRemove);
    }
  }

  /**
   * Lee y reconstruye datos que fueron fragmentados
   */
  private async getChunkedData<T>(baseKey: string): Promise<T | null> {
    const metaKey = `${baseKey}_meta`;
    const metaResult = await chrome.storage.sync.get(metaKey);
    const chunksCount = metaResult[metaKey]?.chunks;

    // Si tiene metadata de chunks, fue fragmentado
    if (typeof chunksCount === "number") {
      const keysToGet = [];
      for (let i = 0; i < chunksCount; i++) {
        keysToGet.push(`${baseKey}_${i}`);
      }
      const chunksData = await chrome.storage.sync.get(keysToGet);
      let fullJsonString = "";
      for (let i = 0; i < chunksCount; i++) {
        fullJsonString += chunksData[`${baseKey}_${i}`] || "";
      }
      if (!fullJsonString) return null;
      try {
        return JSON.parse(fullJsonString) as T;
      } catch (err) {
        console.error(`Error parseando chunks para la clave ${baseKey}`, err);
        return null;
      }
    }

    // Si no tiene metadata, intentamos leer la clave legacy (datos viejos sin fragmentar)
    const legacyResult = await chrome.storage.sync.get(baseKey);
    return legacyResult[baseKey] || null;
  }

  async getFavorites(): Promise<Favorite[]> {
    try {
      const result = await this.getChunkedData<Favorite[]>(this.STORAGE_KEY);
      return result || [];
    } catch (error) {
      console.error("Error al leer favoritos desde chrome.storage.sync:", error);
      return [];
    }
  }

  async getFolders(): Promise<FolderNode[]> {
    try {
      const result = await this.getChunkedData<FolderNode[]>(this.FOLDERS_KEY);
      return result || [];
    } catch (error) {
      console.error("Error al leer carpetas:", error);
      return [];
    }
  }

  async saveFolders(folders: FolderNode[]): Promise<void> {
    try {
      await this.saveChunkedData(this.FOLDERS_KEY, folders);
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
      await this.saveFavorites([]);
      console.info("Todos los favoritos han sido eliminados");
    } catch (error) {
      console.error("Error al eliminar todos los favoritos:", error);
      throw new Error(`No se pudieron eliminar todos los favoritos: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async saveFavorites(favorites: Favorite[]): Promise<void> {
    try {
      await this.saveChunkedData(this.STORAGE_KEY, favorites);
    } catch (error) {
      console.error("Error al guardar favoritos:", error);
      throw new Error("No se pudieron guardar los favoritos.");
    }
  }

  async deleteFolder(folderPath: string[]): Promise<void> {
    try {
      // Eliminar favoritos de la carpeta y subcarpetas (usamos this.getFavorites en lugar de API directa)
      const favorites = await this.getFavorites();
      
      // Obtener todas las rutas a eliminar (carpeta y subcarpetas)
      const foldersTree = await this.getFolders();
      const allPaths = flattenFolderPaths(foldersTree);
      const toDelete = allPaths.filter(pathArr => pathArr.length >= folderPath.length && pathArr.slice(0, folderPath.length).join("/") === folderPath.join("/"));
      const toDeleteSet = new Set(toDelete.map(pathArr => pathArr.join("/")));
      
      const filtered = favorites.filter(fav => !toDeleteSet.has(fav.folder));
      await this.saveFavorites(filtered);
      
      // Eliminar la carpeta y subcarpetas del árbol
      const updatedFolders = removeFolderNode(foldersTree, folderPath);
      await this.saveFolders(updatedFolders);
    } catch (error) {
      console.error("Error al eliminar carpeta:", error);
      throw new Error("No se pudo eliminar la carpeta.");
    }
  }
}
