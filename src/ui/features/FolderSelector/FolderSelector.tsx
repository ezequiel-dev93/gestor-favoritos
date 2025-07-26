import { useState } from "react";
import { FolderItem } from "@/ui/features/FolderSelector/FolderItem";
import { useFolderContext } from "@/ui/features/FolderContext/useFolderContext";

export function FolderSelector() {
  const { folders, removeFolder } = useFolderContext();
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);

  return (
    <section className="flex flex-col gap-2">
      {folders.map((folder) => (
        <FolderItem
          key={folder.id}
          folder={folder.nombre}
          selectedFolder={selectedFolder}
          handleSelect={() => setSelectedFolder(folder.nombre)}
          handleDelete={() => removeFolder(folder.id)}
        />
      ))}
    </section>
  );
}
