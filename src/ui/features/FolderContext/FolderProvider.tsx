import { createContext, useState } from "react";
import type { Carpeta } from "@/core/favorites/entities/types";

interface FolderContextType {
  folders: Carpeta[];
  addFolder: (nombre: string) => void;
  removeFolder: (id: string) => void;
}

export const FolderContext = createContext<FolderContextType | null>(null);

export function FolderProvider({ children }: { children: React.ReactNode }) {
  const [folders, setFolders] = useState<Carpeta[]>([]);

  const addFolder = (nombre: string) => {
    const nueva = { id: crypto.randomUUID(), nombre };
    setFolders((prev) => [...prev, nueva]);
  };

  const removeFolder = (id: string) => {
    setFolders((prev) => prev.filter((f) => f.id !== id));
  };

  return (
    <FolderContext.Provider value={{ folders, addFolder, removeFolder }}>
      {children}
    </FolderContext.Provider>
  );
}
