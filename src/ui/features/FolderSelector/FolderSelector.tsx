import { useEffect, useState } from "react";
import { ChromeStorageRepository } from "@/infrastructure/storage/ChromeStorageRepository";
import { getFavoriteFolders } from "@/core/favorites/useCases/getFavoriteFolders";
import { useFavorites } from "@/ui/hooks/useFavorites";
import { notifyError } from "@/core/utils/notify";
import { FolderButton } from "@/ui/features/FolderSelector/ButtomFolder";
import { useFolderOrder } from "@/ui/hooks/useFolderOrder";
import { SearchInput } from "@/ui/components/Search";

export function FolderSelector() {
  const [folders, setFolders] = useState<string[]>([]);
  const {
    selectedFolder,
    setSelectedFolder,
    loadFavoritesByFolder,
    loadAllFavorites,
  } = useFavorites();

  const { orderedFolders, updateOrder } = useFolderOrder(folders);

  useEffect(() => {
    async function loadFolders() {
      try {
        const repo = new ChromeStorageRepository();
        const result = await getFavoriteFolders(repo);
        setFolders(result);
      } catch (error) {
        notifyError("No se pudieron cargar las carpetas");
        console.error("Error al obtener carpetas:", error);
      }
    }

    loadFolders();
  }, []);

  const handleSelect = async (folder: string | null) => {
    setSelectedFolder(folder);
    if (folder === null) {
      await loadAllFavorites();
    } else {
      await loadFavoritesByFolder();
    }
  };

  const handleDelete = async (folder: string) => {
    const repo = new ChromeStorageRepository();
    const newFolders = folders.filter(f => f !== folder);
    setFolders(newFolders);
    await repo.deleteFolder(folder);
    await updateOrder(newFolders);
    if (selectedFolder === folder) {
      setSelectedFolder(null);
      await loadAllFavorites();
    }
  };

  return (
    <nav className="bg-zinc-100 dark:bg-zinc-800 p-4 border-b border-zinc-300 dark:border-zinc-700 h-full overflow-x-auto">
      <article className="mb-4">
        <SearchInput />
      </article>

      <h3 className="text-sm text-zinc-700 dark:text-zinc-200 font-semibold mb-2">
        Carpetas
      </h3>
      <ul className="flex gap-2 flex-wrap max-h-full">
        <li>
          <FolderButton
            folder={null}
            selectedFolder={selectedFolder}
            handleSelect={handleSelect}
          />
        </li>
        {orderedFolders.map((folder) => (
          <li key={folder}>
            <FolderButton
              folder={folder}
              selectedFolder={selectedFolder}
              handleSelect={handleSelect}
              handleDelete={handleDelete}
            />
          </li>
        ))}
      </ul>
    </nav>
  );
}
