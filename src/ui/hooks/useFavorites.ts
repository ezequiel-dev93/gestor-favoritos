import { create } from "zustand";
import { ChromeStorageRepository } from "@/infrastructure/storage/ChromeStorageRepository";
import { getAllFavorites } from "@/core/favorites/useCases/useAllFavorites";
import { getFavoritesByFolder } from "@/core/favorites/useCases/getFavoritesByFolder";
import { searchFavorites as searchFavoritesUseCase } from "@/core/favorites/useCases/searchFavorites";
import type { Favorite } from "@/core/favorites/entities/Favorite";
import { notifyError } from "@/core/utils/notify";

type FavoritesState = {
  favorites: Favorite[];
  isLoading: boolean;
  selectedFolder: string | null;
  query: string;
  loadFavoritesByFolder: () => Promise<void>;
  loadAllFavorites: () => Promise<void>;
  searchFavorites: (query: string) => Promise<void>;
  setSelectedFolder: (folder: string | null) => void;
  setQuery: (query: string) => void;
};

export const useFavorites = create<FavoritesState>((set, get) => ({
  favorites: [],
  isLoading: false,
  selectedFolder: null,
  query: "",

  setSelectedFolder: (folder) => set({ selectedFolder: folder }),
  setQuery: (query) => set({ query }),

  loadFavoritesByFolder: async () => {
    const folder = get().selectedFolder;
    if (!folder) {
      await get().loadAllFavorites();
      return;
    }

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
  },

  loadAllFavorites: async () => {
    set({ isLoading: true });
    try {
      const repo = new ChromeStorageRepository();
      const favorites = await getAllFavorites(repo);
      set({ favorites });
    } catch (error) {
      notifyError("No se pudieron cargar los favoritos");
      console.error("Error al cargar todos los favoritos:", error);
    } finally {
      set({ isLoading: false });
    }
  },

  searchFavorites: async (query: string) => {
    if (!query || query.trim() === "") {
      await get().loadAllFavorites();
      return;
    }

    set({ isLoading: true });
    try {
      const repo = new ChromeStorageRepository();
      const results = await searchFavoritesUseCase(query, repo);
      set({ favorites: results });
    } catch (error) {
      notifyError("No se pudo completar la búsqueda");
      console.error("Error en búsqueda de favoritos:", error);
    } finally {
      set({ isLoading: false });
    }
  },
}));
