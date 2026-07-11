import { createContext, useContext } from "react";

/*
 - DndDraggingContext — contexto que indica qué tipo de elemento se está arrastrando.
 - Permite que componentes anidados (FolderInnerDropzone) oculten zonas de drop
 - que conflictuarían con el reordenamiento de carpetas raíz.
*/
interface DndDraggingContextValue {
  isDraggingRootFolder: boolean;
}

export const DndDraggingContext = createContext<DndDraggingContextValue>({
  isDraggingRootFolder: false,
});

export function useDndDraggingContext() {
  return useContext(DndDraggingContext);
}
