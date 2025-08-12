import React, { useState, useEffect } from "react";
import { useFavoritesStore } from "@/ui/hooks/useFavoritesStore";
import { notifySuccess, notifyError } from "@/core/utils/notify";
import { ChromeStorageRepository } from "@/infrastructure/storage/ChromeStorageRepository";
import { addFavorite } from "@/core/favorites/useCases/addFavorite";
import { FolderExplorerModal } from "@/ui/features/FolderExplorerModal/FolderExplorerModal";
import { flattenFolderPaths } from "@/core/favorites/entities/FolderNode";

interface AddFavoriteFormProps {
  url: string;
  initialFolder?: string[] | null;
  onSave: () => void;
}

const AddFavoriteForm: React.FC<AddFavoriteFormProps> = ({ url, initialFolder, onSave }) => {
  const [name, setName] = useState("");
  const [inputUrl, setInputUrl] = useState(url || "");
  const [folder, setFolder] = useState<string[] | null>(initialFolder || null);
  const [showFolderModal, setShowFolderModal] = useState(false);

  const folders = useFavoritesStore((s) => s.folders);
  const loadFolders = useFavoritesStore((s) => s.loadFolders);
  const setSelectedFolder = useFavoritesStore((s) => s.setSelectedFolder);
  const loadAllFavorites = useFavoritesStore((s) => s.loadAllFavorites);

  useEffect(() => {
    loadFolders();
  }, [loadFolders]);

  const handleSave = async () => {
    if (!folder || folder.length === 0) {
      notifyError("Selecciona una carpeta");
      return;
    }

    setSelectedFolder(folder);

    try {
      const repo = new ChromeStorageRepository();
      await addFavorite(
        {
          url: inputUrl,
          title: name || inputUrl,
          folder: folder.join("/"),
        },
        repo
      );

      await loadAllFavorites();
      await loadFolders();
      notifySuccess("Favorito guardado");
      onSave();
    } catch (e: any) {
      const msg = e instanceof Error ? e.message : String(e);
      notifyError(msg || "Error al guardar el favorito");
    }
  };

  return (
    <>
      <form
        className="space-y-4"
        role="form"
        aria-labelledby="add-favorite-title"
        onSubmit={(e) => {
          e.preventDefault();
          handleSave();
        }}
      >
        <h2 id="add-favorite-title" className="sr-only">
          Formulario para agregar favorito
        </h2>

        <div>
          <label htmlFor="favorite-name" className="block mb-1 text-sm font-medium text-zinc-700 dark:text-zinc-200">
            Nombre del favorito
          </label>
          <input
            id="favorite-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 rounded-md border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-700 text-sm text-zinc-900 dark:text-white"
            placeholder="Ej: Google"
            aria-required="false"
          />
        </div>

        <div>
          <label htmlFor="favorite-url" className="block mb-1 text-sm font-medium text-zinc-700 dark:text-zinc-200">
            URL
          </label>
          <input
            id="favorite-url"
            type="url"
            value={inputUrl}
            onChange={(e) => setInputUrl(e.target.value)}
            className="w-full px-3 py-2 rounded-md border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-700 text-sm text-zinc-900 dark:text-white"
            placeholder="https://www.google.com"
            aria-required="true"
          />
        </div>

        <div>
          <label htmlFor="favorite-folder" className="block mb-1 text-sm font-medium text-zinc-700 dark:text-zinc-200">
            Carpeta
          </label>

          <div className="flex items-center gap-2">
            <select
              id="favorite-folder"
              value={folder ? folder.join("/") : ""}
              onChange={e => {
                const val = e.target.value;
                setFolder(val ? val.split("/") : null);
              }}
              className="flex-1 px-3 py-2 rounded-md border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-700 text-sm text-zinc-900 dark:text-white"
              aria-required="true"
            >
              <option value="">Selecciona una carpeta</option>
              {flattenFolderPaths(folders).map((pathArr) => (
                <option key={pathArr.join("/")} value={pathArr.join("/")}>{pathArr.join(" / ")}</option>
              ))}
            </select>

            <button
              type="button"
              onClick={() => setShowFolderModal(true)}
              className="text-sm px-3 py-2 rounded-md bg-gradient-to-r from-cyan-600 via-cyan-500 to-cyan-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-cyan-300 dark:focus:ring-cyan-800 font-medium text-center cursor-pointer"
            >
              Crear carpeta
            </button>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="text-white bg-green-700 hover:bg-green-800 focus:outline-none focus:ring-2 focus:ring-green-400 font-medium rounded-full text-sm px-4 py-1 dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800 cursor-pointer"
            aria-label="Guardar favorito"
          >
            Guardar
          </button>
        </div>
      </form>

      {showFolderModal && (
        <FolderExplorerModal
          open={showFolderModal}
          folders={folders}
          onClose={() => setShowFolderModal(false)}
          onSelect={(newFolderPath: string[]) => {
            setFolder(newFolderPath);
            setShowFolderModal(false);
          }}
        />
      )}
    </>
  );
};

export default AddFavoriteForm;
