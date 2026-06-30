import type { FavoriteRepository } from "@/core/favorites/repositories/FavoriteRepository";
import type { Favorite } from "@/core/favorites/entities/Favorite";
import type { FolderNode } from "@/core/favorites/entities/FolderNode";
import type { ExportData } from "@/core/favorites/useCases/exportFavorites";
import { parseHtmlBookmarks } from "@/core/favorites/useCases/parseHtmlBookmarks";

/** Estrategia de importación */
export type ImportStrategy = "replace" | "merge";

export interface ImportPreview {
  favorites: Favorite[];
  folders: FolderNode[];
}

export interface ImportResult {
  favoritesImported: number;
  foldersImported: number;
}

// ── Guardas de tipo ────────────────────────────────────────────
function isValidFavorite(f: unknown): f is Favorite {
  return (
    typeof f === "object" && f !== null &&
    typeof (f as Favorite).id     === "string" &&
    typeof (f as Favorite).url    === "string" &&
    typeof (f as Favorite).title  === "string" &&
    typeof (f as Favorite).folder === "string"
  );
}

function isValidFolderNode(n: unknown): n is FolderNode {
  return (
    typeof n === "object" && n !== null &&
    typeof (n as FolderNode).name === "string"
  );
}

/**
 * parseImportFile — SRP: valida y parsea el JSON del archivo de backup.
 * Lanza Error con mensaje descriptivo si el archivo no es válido.
 */
export function parseImportFile(json: string): ImportPreview {
  let parsed: unknown;

  try {
    parsed = JSON.parse(json);
  } catch {
    throw new Error("El archivo no es un JSON válido.");
  }

  if (typeof parsed !== "object" || parsed === null) {
    throw new Error("Formato de archivo no reconocido.");
  }

  const data = parsed as Partial<ExportData>;
  const favorites = Array.isArray(data.favorites) ? data.favorites.filter(isValidFavorite) : [];
  const folders   = Array.isArray(data.folders)   ? data.folders.filter(isValidFolderNode)   : [];

  if (favorites.length === 0 && folders.length === 0) {
    throw new Error("El archivo no contiene favoritos ni carpetas válidos.");
  }

  return { favorites, folders };
}

/**
 * detectAndParseFile — SRP: punto de entrada unificado para importar favoritos.
 * Detecta automáticamente el formato según la extensión del archivo:
 * - .html / .htm  → parser Netscape Bookmark File (Chrome, Brave, Firefox, Edge)
 * - .json         → parser del formato interno de backup
 */
export function detectAndParseFile(content: string, filename: string): ImportPreview {
  const lower = filename.toLowerCase();
  if (lower.endsWith(".html") || lower.endsWith(".htm")) {
    return parseHtmlBookmarks(content);
  }
  return parseImportFile(content);
}

/**
 * importFavorites — SRP: persiste los datos importados según la estrategia elegida.
 * - "replace": reemplaza TODO el contenido actual.
 * - "merge":   agrega solo los favoritos cuya URL no exista ya (evita duplicados).
 *              Las carpetas del backup se agregan si no existe ya una raíz con ese nombre.
 */
export async function importFavorites(
  preview: ImportPreview,
  strategy: ImportStrategy,
  repo: FavoriteRepository,
): Promise<ImportResult> {
  if (strategy === "replace") {
    await repo.saveFavorites(preview.favorites);
    await repo.saveFolders(preview.folders);
    return {
      favoritesImported: preview.favorites.length,
      foldersImported:   preview.folders.length,
    };
  }

  // ── Merge: favoritos ─────────────────────────────────────────
  const existingFavorites = await repo.getFavorites();
  const existingUrls      = new Set(existingFavorites.map((f) => f.url));
  const newFavorites      = preview.favorites.filter((f) => !existingUrls.has(f.url));
  await repo.saveFavorites([...existingFavorites, ...newFavorites]);

  // ── Merge: carpetas (raíz) ────────────────────────────────────
  const existingFolders     = await repo.getFolders();
  const existingRootNames   = new Set(existingFolders.map((f) => f.name));
  const newFolders          = preview.folders.filter((f) => !existingRootNames.has(f.name));
  await repo.saveFolders([...existingFolders, ...newFolders]);

  return {
    favoritesImported: newFavorites.length,
    foldersImported:   newFolders.length,
  };
}
