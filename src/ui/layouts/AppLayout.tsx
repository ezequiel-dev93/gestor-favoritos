import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Toaster } from "sonner";
import { Header } from "@/ui/components/Header";
import { Footer } from "@/ui/components/Footer";
import { FoldersGrid } from "@/ui/features/FoldersGrid/FoldersGrid";
import { FavoriteManager } from "@/pages/FavoriteManager";
import { AddFavoriteModal } from "@/ui/features/AddFavoriteModal/AddFavoriteModal";
import AddFolderModal from "@/ui/features/AddFolderModal/AddFolderModal";
import { SettingsButton } from "@/ui/features/Settings/SettingsButton";
import { useFavoritesStore } from "@/ui/hooks/useFavoritesStore";

/*
 - AppLayout — SRP: composición del layout de pantalla completa.
 - Orquesta las tres secciones: Header, Toolbar y área de contenido principal.
 - No contiene lógica de dominio — esa responsabilidad pertenece a cada sub-componente.
*/
export function AppLayout() {
  const isSearching = useFavoritesStore((s) => s.isSearching);
  const loadAllFavorites = useFavoritesStore((s) => s.loadAllFavorites);
  const loadFolders = useFavoritesStore((s) => s.loadFolders);

  const [showAddFavorite, setShowAddFavorite] = useState(false);
  const [showAddFolder, setShowAddFolder] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // Carga inicial: folders + todos los favoritos para el grid
  useEffect(() => {
    loadFolders();
    loadAllFavorites();
  }, [loadFolders, loadAllFavorites]);

  // Recarga todo después de agregar/modificar un favorito
  const handleDataRefresh = async () => {
    await loadFolders();
    await loadAllFavorites();
  };

  return (
    <section className="flex flex-col min-h-screen text-zinc-800 dark:text-zinc-100">
      <Toaster
        position="top-right"
        richColors
        expand
        duration={3000}
        visibleToasts={3}
        theme="system"
        toastOptions={{ className: "z-[99999]" }}
      />

      <header
        className="flex items-center justify-between gap-4 px-6 py-3 border-b border-zinc-200 dark:border-zinc-800 shrink-0 flex-wrap"
        aria-label="Cabecera y herramientas de la aplicación"
      >
        <Header />

        <div
          className="flex items-center gap-2 ml-auto"
          role="toolbar"
          aria-label="Acciones rápidas"
        >
          <button
            onClick={() => setShowAddFavorite(true)}
            className="px-3 py-1 text-xs bg-gradient-to-r from-purple-500 via-purple-600 to-purple-700 hover:brightness-110 text-white font-medium rounded-md cursor-pointer transition-all focus-visible:ring-2 focus-visible:ring-purple-400"
            aria-label="Agregar un nuevo favorito"
          >
            + Agregar Favorito
          </button>
          <button
            onClick={() => setShowAddFolder(true)}
            className="px-2.5 py-0.5 text-[11px] bg-gradient-to-r from-cyan-700 via-cyan-600 to-cyan-500 hover:brightness-110 text-white font-medium rounded-md cursor-pointer transition-all focus-visible:ring-2 focus-visible:ring-cyan-400"
            aria-label="Crear nueva carpeta"
          >
            + Nueva Carpeta
          </button>
        </div>
      </header>

      <main
        className="flex-1 overflow-y-auto px-6 py-4"
        aria-label="Contenido principal"
      >
        <AnimatePresence mode="wait">
          {isSearching ? (
            <motion.div
              key="search"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 6 }}
              transition={{ duration: 0.18 }}
            >
              <p className="text-xs uppercase tracking-widest text-zinc-400 mb-4 font-semibold select-none">
                Resultados de búsqueda
              </p>
              <FavoriteManager />
            </motion.div>
          ) : (
            <motion.div
              key="grid"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              className="h-full"
            >
              <FoldersGrid
                onFavoriteAdded={handleDataRefresh}
                onImportClick={() => setShowSettings(true)}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <footer className="shrink-0 border-t border-zinc-200 dark:border-zinc-800 px-8">
        <Footer />
      </footer>

      <AddFavoriteModal
        url=""
        folder={null}
        open={showAddFavorite}
        onClose={() => setShowAddFavorite(false)}
        onSave={() => {
          setShowAddFavorite(false);
          handleDataRefresh();
        }}
      />
      <AddFolderModal
        isOpen={showAddFolder}
        onClose={() => {
          setShowAddFolder(false);
          handleDataRefresh();
        }}
      />

      <SettingsButton
        open={showSettings}
        onOpen={() => setShowSettings(true)}
        onClose={() => setShowSettings(false)}
        onImportDone={handleDataRefresh}
      />

    </section>
  );
}
