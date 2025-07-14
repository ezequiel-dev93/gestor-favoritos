import { create } from "zustand";
import type { Favorite } from "@/core/favorites/entities/Favorite";
import { ChromeStorageRepository } from "@/infrastructure/storage/ChromeStorageRepository";
import { getFavoriteFolders } from "@/core/favorites/useCases/getFavoriteFolders";
import { getFavoritesByFolder } from "@/core/favorites/useCases/getFavoritesByFolder";
import { notifyError } from "@/core/utils/notify";

interface FavoritesState {
  favorites: Favorite[];
  folders: string[];
  selectedFolder: string | null;
  isLoading: boolean;

  setSelectedFolder: (folder: string) => void;
  loadFolders: () => Promise<void>;
  loadFavoritesByFolder: () => Promise<void>;
}

export const useFavorites = create<FavoritesState>((set: (state: Partial<FavoritesState> | ((state: FavoritesState) => Partial<FavoritesState>)) => void, get: () => FavoritesState) => ({
  favorites: [],
  folders: [],
  selectedFolder: null,
  isLoading: false,

  setSelectedFolder: (folder: string) => {
    set({ selectedFolder: folder });
  },

  loadFolders: async () => {
    set({ isLoading: true });
    try {
      const repo = new ChromeStorageRepository();
      const folders = await getFavoriteFolders(repo);
      set({ folders });
    } catch (error) {
      notifyError("No se pudieron cargar las carpetas");
      console.error("Error al cargar carpetas:", error);
    } finally {
      set({ isLoading: false });
    }
  },

  loadFavoritesByFolder: async () => {
    const folder = get().selectedFolder;
    if (!folder) return; // No hay carpeta seleccionada

    set({ isLoading: true });
    try {
      const repo = new ChromeStorageRepository();
      const favorites = await getFavoritesByFolder(folder, repo);
      set({ favorites });
    } catch (error) {
      notifyError("No se pudieron cargar los favoritos de la carpeta");
      console.error("Error al cargar favoritos por carpeta:", error);
    } finally {
      set({ isLoading: false });
    }
  }
}));
