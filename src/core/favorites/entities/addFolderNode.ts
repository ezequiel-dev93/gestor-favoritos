import type { FolderNode } from "@/core/favorites/entities/FolderNode";

export function addFolderNode(root: FolderNode[], path: string[]): FolderNode[] {
  if (path.length === 0) return root;

  const [head, ...rest] = path;
  const foundIndex = root.findIndex((n) => n.name === head);
  
  if (foundIndex === -1) {
    // Validar que no exista una carpeta con el mismo nombre (case-insensitive)
    const existingNames = root.map(n => n.name.toLowerCase());
    if (existingNames.includes(head.toLowerCase())) {
      throw new Error(`Ya existe una carpeta con el nombre "${head}"`);
    }
    
    const newNode: FolderNode = {
      name: head,
      children: rest.length > 0 ? addFolderNode([], rest) : []
    };
    return [...root, newNode];
  }
  
  if (rest.length === 0) {
    throw new Error(`La carpeta "${head}" ya existe`);
  }
  
  const updatedNode = {
    ...root[foundIndex],
    children: addFolderNode(root[foundIndex].children || [], rest)
  };
  
  return [
    ...root.slice(0, foundIndex),
    updatedNode,
    ...root.slice(foundIndex + 1)
  ];
}