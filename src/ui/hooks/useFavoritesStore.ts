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
import { updateFolderNode } from "@/core/favorites/useCases/updateFolderNode";


interface FavoritesState {
  favorites: Favorite[];
  folders: FolderNode[];
  selectedFolder: string[] | null;
  isLoading: boolean;
  isSearching: boolean; // NUEVO: indica si hay una búsqueda activa
  searchQuery: string;   // NUEVO: almacena la consulta actual

  setSelectedFolder: (folder: string[] | null) => void;
  loadAllFavorites: () => Promise<void>;
  loadFavoritesByFolder: () => Promise<void>;
  loadFolders: () => Promise<void>;
  deleteFolder: (folderPath: string[]) => Promise<void>;
  deleteFavorite: (id: string) => Promise<void>;
  updateFavoriteTitle: (id: string, newTitle: string) => Promise<void>;
  setFavorites: (favorites: Favorite[]) => void;
  addFolder: (folderPath: string[]) => Promise<void>;
  updateFolderName: (path: string[], newName: string) => Promise<void>;
  saveFavoritesOrder: (newOrder: Favorite[]) => Promise<void>;
  searchFavorites: (query: string) => Promise<void>;
}

export const useFavoritesStore = create<FavoritesState>((set, get) => ({
  favorites: [],
  folders: [],
  selectedFolder: null,
  isLoading: false,
  isSearching: false,  
  searchQuery: "", 

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

  updateFolderName: async (path: string[], newName: string) => {
    try {
      const repo = new ChromeStorageRepository();
      let folders = await repo.getFolders();

      const oldPathStr = path.join('/');
      const parentPath = path.slice(0, -1);
      const newPathStr = [...parentPath, newName].join('/');

      // Actualizar el nombre de la carpeta en el árbol
      folders = updateFolderNode(folders, path, newName);
      await repo.saveFolders(folders);

      // Actualizar el campo folder de los favoritos que usaban la ruta antigua
      const favorites = await repo.getFavorites();
      const updatedFavorites = favorites.map((f) => {
        // Si el favorito está exactamente en la carpeta renombrada
        if (f.folder === oldPathStr) {
          return { ...f, folder: newPathStr };
        }
        // Si el favorito está en una subcarpeta de la carpeta renombrada
        if (f.folder?.startsWith(oldPathStr + '/')) {
          return { ...f, folder: f.folder.replace(oldPathStr, newPathStr) };
        }
        return f;
      });
      await repo.saveFavorites(updatedFavorites);

      // Actualizar el estado: folders, favorites y selectedFolder si corresponde
      const currentSelected = get().selectedFolder;
      let newSelectedFolder = currentSelected;

      // Si la carpeta seleccionada es la que se renombró o es hija de ella
      if (currentSelected) {
        const currentSelectedStr = currentSelected.join('/');
        if (currentSelectedStr === oldPathStr) {
          newSelectedFolder = [...parentPath, newName];
        } else if (currentSelectedStr.startsWith(oldPathStr + '/')) {
          newSelectedFolder = currentSelected.map((part, index) =>
            index < path.length - 1 ? part : index === path.length - 1 ? newName : part
          );
        }
      }

      set({
        folders,
        favorites: updatedFavorites,
        selectedFolder: newSelectedFolder,
      });
    } catch (error) {
      console.error('Error al actualizar carpeta:', error);
      throw new Error(error instanceof Error ? error.message : 'Error desconocido al actualizar carpeta');
    }
  },

  saveFavoritesOrder: async (newOrder) => {
    const repo = new ChromeStorageRepository();
    await repo.saveFavorites(newOrder);
  },

  searchFavorites: async (query: string) => {
    if (!query || query.trim() === "") {
      set({ isSearching: false, searchQuery: "" });
      await get().loadAllFavorites();
      return;
    }
    set({ isLoading: true, isSearching: true, searchQuery: query });
    try {
      const repo = new ChromeStorageRepository();
      const { searchFavorites } = await import("@/core/favorites/useCases/searchFavorites");
      const results = await searchFavorites(query, repo);
      set({ favorites: results });
    } catch (error) {
      if (typeof window !== 'undefined' && window.console) {
        console.error("Error en búsqueda de favoritos:", error);
      }
    } finally {
      set({ isLoading: false });
    }
  },
}));
