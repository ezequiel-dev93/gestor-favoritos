import { create } from "zustand";
import { ChromeStorageRepository } from "@/infrastructure/storage/ChromeStorageRepository";
import { getAllFavorites } from "@/core/favorites/useCases/useAllFavorites";
import { getFavoritesByFolder } from "@/core/favorites/useCases/getFavoritesByFolder";
import type { FolderNode } from "@/core/favorites/entities/FolderNode";
import { deleteFolder as deleteFolderUseCase } from "@/core/favorites/useCases/deleteFolders";
import type { Favorite } from "@/core/favorites/entities/Favorite";
import { updateFavorite } from "@/core/favorites/useCases/updateFavorite";
import { addFolderNode } from "@/core/favorites/entities/addFolderNode";
import { deleteFavorite as deleteFavoriteUseCase } from "@/core/favorites/useCases/deleteFavorite";


interface FavoritesState {
  favorites: Favorite[];
  folders: FolderNode[];
  selectedFolder: string[] | null; // ruta
  isLoading: boolean;

  setSelectedFolder: (folder: string[] | null) => void;
  loadAllFavorites: () => Promise<void>;
  loadFavoritesByFolder: () => Promise<void>;
  loadFolders: () => Promise<void>;
  deleteFolder: (folderPath: string[]) => Promise<void>;
  deleteFavorite: (id: string) => Promise<void>;
  updateFavoriteTitle: (id: string, newTitle: string) => Promise<void>;
  setFavorites: (favorites: Favorite[]) => void;
  addFolder: (folderPath: string[]) => Promise<void>;
  saveFavoritesOrder: (newOrder: Favorite[]) => Promise<void>;
  searchFavorites: (query: string) => Promise<void>;
}


export const useFavoritesStore = create<FavoritesState>((set, get) => ({
  favorites: [],
  folders: [],
  selectedFolder: null,
  isLoading: false,

  setSelectedFolder: (folder) => set({ selectedFolder: folder }),

  loadAllFavorites: async () => {
    set({ isLoading: true });
    try {
      const repo = new ChromeStorageRepository();
      const data = await getAllFavorites(repo);
      set({ favorites: data });
    } finally {
      set({ isLoading: false });
    }
  },

  loadFavoritesByFolder: async () => {
    set({ isLoading: true });
    try {
      const repo = new ChromeStorageRepository();
      const folderPath = get().selectedFolder;
      if (!folderPath) {
        set({ favorites: [] });
        return;
      }
      
      const data = await getFavoritesByFolder(folderPath, repo);
      set({ favorites: data });
    } catch (error) {
      console.error("Error loading favorites by folder:", error);
      set({ favorites: [] });
    } finally {
      set({ isLoading: false });
    }       
  },

  loadFolders: async () => {
    const repo = new ChromeStorageRepository();
    const folders = await repo.getFolders();
    set({ folders });
  },

  deleteFolder: async (folderPath: string[]) => {
    const repo = new ChromeStorageRepository();
    await deleteFolderUseCase(folderPath, repo);
    const favorites = await getAllFavorites(repo);
    const folders = await repo.getFolders();
    set({
      favorites,
      folders,
      selectedFolder: null,
    });
  },

  updateFavoriteTitle: async (id: string, newTitle: string) => {
    const repo = new ChromeStorageRepository();
    const updated = await updateFavorite(id, { ...get().favorites.find(f => f.id === id)!, title: newTitle }, repo);

    set((state) => ({
      favorites: state.favorites.map(fav =>
        fav.id === id ? { ...fav, title: updated.title } : fav
      )
    }));
  },

  deleteFavorite: async (id: string) => {
    const repo = new ChromeStorageRepository();
    await deleteFavoriteUseCase(id, repo);

    set((state) => ({
      favorites: state.favorites.filter((fav) => fav.id !== id),
    }));
  },

  setFavorites: (favorites) => set({ favorites }),

  addFolder: async (folderPath: string[]) => {
    try {
      const repo = new ChromeStorageRepository();
      let folders = await repo.getFolders();
      folders = addFolderNode(folders, folderPath);
      await repo.saveFolders(folders);
      set({ folders, selectedFolder: folderPath });
    } catch (error) {
      console.error('Error al crear carpeta:', error);
      throw new Error(error instanceof Error ? error.message : 'Error desconocido al crear carpeta');
    }
  },


  saveFavoritesOrder: async (newOrder) => {
    const repo = new ChromeStorageRepository();
    await repo.saveFavorites(newOrder);
  },

  searchFavorites: async (query: string) => {
    if (!query || query.trim() === "") {
      await get().loadAllFavorites();
      return;
    }
    set({ isLoading: true });
    try {
      const repo = new ChromeStorageRepository();
      // Import dinámico para evitar ciclo si es necesario
      const { searchFavorites } = await import("@/core/favorites/useCases/searchFavorites");
      const results = await searchFavorites(query, repo);
      set({ favorites: results });
    } catch (error) {
      // Notificación opcional si tienes notifyError
      if (typeof window !== 'undefined' && window.console) {
        console.error("Error en búsqueda de favoritos:", error);
      }
    } finally {
      set({ isLoading: false });
    }
  },
}));
