export interface FolderNode {
  name: string;
  children?: FolderNode[];
}

// Funciones para trabajar con el árbol de carpetas
export function findFolderNode(
  root: FolderNode[],
  path: string[]
): FolderNode | null {
  let current: FolderNode | undefined;
  let nodes = root;
  for (const segment of path) {
    current = nodes.find((n) => n.name === segment);
    if (!current) return null;
    nodes = current.children || [];
  }
  return current || null;
}

export function removeFolderNode(
  root: FolderNode[],
  path: string[]
): FolderNode[] {
  if (path.length === 0) return root;
  const [head, ...rest] = path;
  return root
    .map((node) => {
      if (node.name !== head) return node;     
      if (rest.length === 0) return null; // Eliminar este nodo
      return {
        ...node,
        children: node.children ? removeFolderNode(node.children, rest) : [],
      };
    })
    .filter(Boolean) as FolderNode[];
}

export function flattenFolderPaths(
  root: FolderNode[],
  prefix: string[] = []
): string[][] {
  let paths: string[][] = [];
  for (const node of root) {
    const currentPath = [...prefix, node.name];
    paths.push(currentPath);
    if (node.children) {
      paths = paths.concat(flattenFolderPaths(node.children, currentPath));
    }
  }
  return paths;
}
