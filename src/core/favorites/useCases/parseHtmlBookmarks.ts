import type { Favorite } from "@/core/favorites/entities/Favorite";
import type { FolderNode } from "@/core/favorites/entities/FolderNode";
import type { ImportPreview } from "@/core/favorites/useCases/importFavorites";

/** Nombre de la carpeta raíz que agrupa favoritos sin carpeta en el HTML de Chrome/Brave */
const ROOT_FALLBACK_FOLDER = "Sin carpeta";

/**
 * parseHtmlBookmarks — SRP: parsea el formato estándar Netscape Bookmark File
 * exportado por Chrome, Brave, Firefox y Edge.
 *
 * La estructura del HTML es:
 *   <DL> ← lista de items
 *     <DT><H3>Nombre carpeta</H3>   ← carpeta
 *       <DL>...</DL>                ← contenido de la carpeta
 *     <DT><A HREF="url">título</A>  ← favorito
 *
 * Convierte el árbol HTML en { favorites: Favorite[], folders: FolderNode[] }
 * compatible con la estructura interna del gestor.
 *
 * Los favoritos sin carpeta (en la raíz del HTML) se agrupan bajo
 * la carpeta especial ROOT_FALLBACK_FOLDER para no perder datos.
 */
export function parseHtmlBookmarks(html: string): ImportPreview {
  const doc = new DOMParser().parseFromString(html, "text/html");

  const collectedFolders: FolderNode[] = [];
  const collectedFavorites: Favorite[] = [];

  // ── Construye/inserta un FolderNode en el árbol por su path ──
  function ensureFolderInTree(tree: FolderNode[], path: string[]): void {
    if (path.length === 0) return;
    const [head, ...rest] = path;
    let node = tree.find((n) => n.name === head);
    if (!node) {
      node = { name: head, children: [] };
      tree.push(node);
    }
    if (rest.length > 0) {
      node.children = node.children ?? [];
      ensureFolderInTree(node.children, rest);
    }
  }

  // ── Recorre la estructura <DL> de forma recursiva ────────────
  function walk(dl: Element, currentPath: string[]): void {
    let lastFolderName: string | null = null;

    // Iteramos por todos los hijos directos del <DL>
    for (const child of Array.from(dl.children)) {
      if (child.tagName === "DT") {
        const h3 = child.querySelector("h3");
        const a = child.querySelector("a");
        const nestedDl = child.querySelector("dl");

        if (h3) {
          // ── Es una carpeta ─────────────────────────────────────
          lastFolderName = h3.textContent?.trim() || "Sin nombre";
          const folderPath = [...currentPath, lastFolderName];

          ensureFolderInTree(collectedFolders, folderPath);

          // Si el parser anidó el DL dentro del DT
          if (nestedDl) {
            walk(nestedDl, folderPath);
            lastFolderName = null;
          }
        } else if (a) {
          // ── Es un favorito ─────────────────────────────────────
          const url = a.getAttribute("href")?.trim() ?? "";
          const title = a.textContent?.trim() || url;

          // Ignorar separadores o entradas sin URL válida
          if (!url || url === "place:") continue;

          // Asignar carpeta: path actual o fallback si está en la raíz
          const folderPath =
            currentPath.length > 0 ? currentPath : [ROOT_FALLBACK_FOLDER];

          // Asegurar que la carpeta fallback existe en el árbol
          if (currentPath.length === 0) {
            ensureFolderInTree(collectedFolders, folderPath);
          }

          collectedFavorites.push({
            id: crypto.randomUUID(),
            url,
            title,
            // folder es el path completo separado por "/"
            folder: folderPath.join("/"),
          });
        }
      } else if (child.tagName === "DL") {
        // Si el parser dejó el DL como hermano (sibling) del DT
        if (lastFolderName) {
          walk(child, [...currentPath, lastFolderName]);
          lastFolderName = null;
        } else {
          walk(child, currentPath);
        }
      }
    }
  }

  // Chrome exporta con una <DL> raíz (puede tener una carpeta wrapper "Bookmarks bar" etc.)
  const rootDL = doc.querySelector("dl");
  if (!rootDL) {
    throw new Error(
      "El archivo HTML no tiene la estructura esperada de favoritos de Chrome/Brave."
    );
  }

  walk(rootDL, []);

  if (collectedFavorites.length === 0 && collectedFolders.length === 0) {
    throw new Error("El archivo HTML no contiene favoritos ni carpetas válidos.");
  }

  return {
    favorites: collectedFavorites,
    folders:   collectedFolders,
  };
}
