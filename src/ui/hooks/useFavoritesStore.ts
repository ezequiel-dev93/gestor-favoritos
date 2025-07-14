import { create } from "zustand";
import { ChromeStorageRepository } from "@/infrastructure/storage/ChromeStorageRepository";
import { getAllFavorites } from "@/core/favorites/useCases/useAllFavorites";
import { getFavoritesByFolder } from "@/core/favorites/useCases/getFavoritesByFolder";
import { getFavoriteFolders } from "@/core/favorites/useCases/getFavoriteFolders";
import { deleteFolder as deleteFolderUseCase } from "@/core/favorites/useCases/deleteFolders";
import type { Favorite } from "@/core/favorites/entities/Favorite";
import { updateFavorite } from "@/core/favorites/useCases/updateFavorite";
import { deleteFavorite as deleteFavoriteUseCase } from "@/core/favorites/useCases/deleteFavorite";


interface FavoritesState {
  favorites: Favorite[];
  folders: string[];
  selectedFolder: string | null;

  setSelectedFolder: (folder: string | null) => void;
  loadAllFavorites: () => Promise<void>;
  loadFavoritesByFolder: () => Promise<void>;
  loadFolders: () => Promise<void>;
  deleteFolder: (folder: string) => Promise<void>;
  deleteFavorite: (id: string) => Promise<void>;
  updateFavoriteTitle: (id: string, newTitle: string) => Promise<void>;
  setFavorites: (favorites: Favorite[]) => void;
  saveFavoritesOrder: (newOrder: Favorite[]) => Promise<void>;
}

export const useFavoritesStore = create<FavoritesState>((set, get) => ({
  favorites: [],
  folders: [],
  selectedFolder: null,

  setSelectedFolder: (folder) => set({ selectedFolder: folder }),

  loadAllFavorites: async () => {
    const repo = new ChromeStorageRepository();
    const data = await getAllFavorites(repo);
    set({ favorites: data });
  },

  loadFavoritesByFolder: async () => {
    const repo = new ChromeStorageRepository();
    const folder = get().selectedFolder;
    if (!folder) return;
    const data = await getFavoritesByFolder(folder, repo);
    set({ favorites: data });
  },

  loadFolders: async () => {
    const repo = new ChromeStorageRepository();
    const folders = await getFavoriteFolders(repo);
    set({ folders });
  },

  deleteFolder: async (folder: string) => {
    const repo = new ChromeStorageRepository();
    await deleteFolderUseCase(folder, repo);
    const favorites = await getAllFavorites(repo);
    const folders = await getFavoriteFolders(repo);
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
  
  saveFavoritesOrder: async (newOrder) => {
    const repo = new ChromeStorageRepository();
    await repo.saveFavorites(newOrder);
  },
}));
