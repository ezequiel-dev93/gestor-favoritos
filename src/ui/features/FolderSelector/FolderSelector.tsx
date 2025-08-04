import { useState } from "react";
import { FolderItem } from "@/ui/features/FolderSelector/FolderItem";
import { useFavoritesStore } from "@/ui/hooks/useFavoritesStore";


export function FolderSelector() {
  const folders = useFavoritesStore(s => s.folders);
  const deleteFolder = useFavoritesStore(s => s.deleteFolder);
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);

  return (
    <section className="flex flex-col gap-2">
      {folders.map((folder) => (
        <FolderItem
          key={folder}
          folder={folder}
          selectedFolder={selectedFolder}
          handleSelect={() => setSelectedFolder(folder)}
          handleDelete={() => deleteFolder(folder)}
        />
      ))}
    </section>
  );
}
