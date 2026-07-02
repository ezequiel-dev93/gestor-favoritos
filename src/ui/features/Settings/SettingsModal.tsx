import { useRef, useState } from "react";
import { FiDownload, FiUpload, FiCheck } from "react-icons/fi";
import { Modal } from "@/ui/components/Modal";
import { ChromeStorageRepository } from "@/infrastructure/storage/ChromeStorageRepository";
import { exportFavorites } from "@/core/favorites/useCases/exportFavorites";
import {
  detectAndParseFile,
  importFavorites,
  type ImportStrategy,
  type ImportPreview,
} from "@/core/favorites/useCases/importFavorites";
import { notifySuccess, notifyError } from "@/core/utils/notify";

interface SettingsModalProps {
  open: boolean;
  onClose: () => void;
  onImportDone: () => void;
}

/*
 - SettingsModal — SRP: único responsable de la interfaz de exportar e importar.
 - Delega toda la lógica a los use cases del dominio.
*/
export function SettingsModal({ open, onClose, onImportDone }: SettingsModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [strategy, setStrategy] = useState<ImportStrategy>("merge");
  const [preview, setPreview] = useState<ImportPreview | null>(null);
  const [previewError, setPreviewError] = useState<string | null>(null);

  // Export
  const handleExport = async () => {
    setIsExporting(true);
    try {
      const repo = new ChromeStorageRepository();
      await exportFavorites(repo);
      notifySuccess("Backup descargado correctamente");
    } catch {
      notifyError("Error al exportar los favoritos");
    } finally {
      setIsExporting(false);
    }
  };

  // Import: paso 1 — leer y previsualizar el archivo
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setPreview(null);
    setPreviewError(null);

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const parsed = detectAndParseFile(evt.target?.result as string, file.name);
        setPreview(parsed);
      } catch (err) {
        setPreviewError(err instanceof Error ? err.message : "Archivo inválido");
      }
    };
    reader.readAsText(file);
  };

  // Import: paso 2 — confirmar e importar
  const handleImport = async () => {
    if (!preview) return;
    setIsImporting(true);
    try {
      const repo = new ChromeStorageRepository();
      const result = await importFavorites(preview, strategy, repo);
      notifySuccess(
        `Importación completada: ${result.favoritesImported} favorito(s), ${result.foldersImported} carpeta(s)`
      );
      onImportDone();
      onClose();
      resetImport();
    } catch {
      notifyError("Error al importar. Verificá el archivo.");
    } finally {
      setIsImporting(false);
    }
  };

  const resetImport = () => {
    setPreview(null);
    setPreviewError(null);
    setStrategy("merge");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleClose = () => {
    resetImport();
    onClose();
  };

  return (
    <Modal open={open} onClose={handleClose} title="⚙️ Configuración" className="max-w-lg">
      <section className="flex flex-col gap-6">
        <section aria-labelledby="export-heading" className="flex flex-col gap-3">
          <h3
            id="export-heading"
            className="text-sm font-semibold text-zinc-700 dark:text-zinc-200 uppercase tracking-wider"
          >
            Exportar
          </h3>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Descarga un archivo <code className="bg-zinc-100 dark:bg-zinc-700 px-1 rounded text-xs">.json</code> con
            todos tus favoritos y carpetas. Podés usarlo como backup o para importarlo en otro dispositivo.
          </p>
          <button
            onClick={handleExport}
            disabled={isExporting}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white rounded-lg transition-colors w-fit cursor-pointer"
            aria-label="Descargar backup de favoritos"
          >
            <FiDownload size={15} />
            {isExporting ? "Descargando..." : "Descargar backup"}
          </button>
        </section>

        <hr className="border-zinc-200 dark:border-zinc-700" />

        <section aria-labelledby="import-heading" className="flex flex-col gap-3">
          <h3
            id="import-heading"
            className="text-sm font-semibold text-zinc-700 dark:text-zinc-200 uppercase tracking-wider"
          >
            Importar
          </h3>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Seleccioná un archivo{" "}
            <code className="bg-zinc-100 dark:bg-zinc-700 px-1 rounded text-xs">.json</code>
            {" "}exportado previamente, o un archivo{" "}
            <code className="bg-zinc-100 dark:bg-zinc-700 px-1 rounded text-xs">.html</code>
            {" "}exportado desde Chrome o Brave para restaurar tus favoritos.
          </p>

          <div className="flex items-center gap-3">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium border border-zinc-300 dark:border-zinc-600 hover:border-purple-500 dark:hover:border-purple-400 rounded-lg transition-colors w-fit cursor-pointer text-zinc-700 dark:text-zinc-200"
              aria-label="Seleccionar archivo de importación"
            >
              <FiUpload size={15} />
              Seleccionar archivo
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json,application/json,.html,.htm,text/html"
              onChange={handleFileChange}
              className="hidden"
              aria-hidden="true"
            />
          </div>

          {previewError && (
            <p className="text-sm text-red-500 dark:text-red-400" role="alert">
              ⚠️ {previewError}
            </p>
          )}

          {preview && !previewError && (
            <div className="flex flex-col gap-4 p-3 rounded-lg bg-zinc-50 dark:bg-zinc-700/40 border border-zinc-200 dark:border-zinc-600">
              <div className="flex gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-purple-500">{preview.favorites.length}</p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">favoritos</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-cyan-500">{preview.folders.length}</p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">carpetas raíz</p>
                </div>
              </div>

              <fieldset className="flex flex-col gap-2">
                <legend className="text-xs font-semibold text-zinc-600 dark:text-zinc-300 mb-1">
                  Estrategia de importación
                </legend>
                <label className="flex items-start gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="strategy"
                    value="merge"
                    checked={strategy === "merge"}
                    onChange={() => setStrategy("merge")}
                    className="mt-0.5 accent-purple-600"
                  />
                  <span className="text-sm text-zinc-700 dark:text-zinc-200">
                    <strong>Combinar</strong>
                    <span className="text-zinc-500 dark:text-zinc-400"> — agrega solo los favoritos que no existen todavía (recomendado)</span>
                  </span>
                </label>
                <label className="flex items-start gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="strategy"
                    value="replace"
                    checked={strategy === "replace"}
                    onChange={() => setStrategy("replace")}
                    className="mt-0.5 accent-purple-600"
                  />
                  <span className="text-sm text-zinc-700 dark:text-zinc-200">
                    <strong>Reemplazar</strong>
                    <span className="text-zinc-500 dark:text-zinc-400"> — borra todo lo actual y lo reemplaza con el backup</span>
                  </span>
                </label>
              </fieldset>

              <button
                onClick={handleImport}
                disabled={isImporting}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-cyan-600 hover:bg-cyan-700 disabled:opacity-50 text-white rounded-lg transition-colors w-fit cursor-pointer"
                aria-label="Confirmar importación"
              >
                <FiCheck size={15} />
                {isImporting ? "Importando..." : "Confirmar importación"}
              </button>
            </div>
          )}
        </section>
      </section>
    </Modal>
  );
}
