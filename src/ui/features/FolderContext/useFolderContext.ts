import { useContext } from "react";
import { FolderContext } from "@/ui/features/FolderContext/FolderProvider";

export function useFolderContext() {
  const context = useContext(FolderContext);
  if (!context) {
    throw new Error("useFolderContext debe usarse dentro de <FolderProvider>");
  }
  return context;
}
