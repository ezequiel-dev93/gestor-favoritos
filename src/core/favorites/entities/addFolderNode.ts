import type { FolderNode } from "@/core/favorites/entities/FolderNode";

// Inserta una carpeta en el árbol, creando nodos intermedios si es necesario
export function addFolderNode(root: FolderNode[], path: string[]): FolderNode[] {
  if (path.length === 0) return root;
  const [head, ...rest] = path;
  let found = root.find((n) => n.name === head);
  if (!found) {
    found = { name: head, children: [] };
    root.push(found);
  }
  if (rest.length === 0) {
    return root;
  }
  found.children = addFolderNode(found.children || [], rest);
  return root;
}
