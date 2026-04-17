import type { FolderNode } from "@/core/favorites/entities/FolderNode";

export function updateFolderNode(
  root: FolderNode[],
  path: string[],
  newName: string
): FolderNode[] {
  if (path.length === 0) return root;

  const [head, ...rest] = path;

  return root.map((node) => {
    if (node.name !== head) return node;

    if (rest.length === 0) {
      // Verificar que no exista otra carpeta con el mismo nombre (case-insensitive)
      const siblings = root.filter((n) => n.name !== head);
      const existingNames = siblings.map((n) => n.name.toLowerCase());
      if (existingNames.includes(newName.toLowerCase())) {
        throw new Error(`Ya existe una carpeta con el nombre "${newName}"`);
      }

      return { ...node, name: newName };
    }

    return {
      ...node,
      children: node.children
        ? updateFolderNode(node.children, rest, newName)
        : [],
    };
  });
}
