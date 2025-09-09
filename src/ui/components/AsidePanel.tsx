'use client';

import React, { useEffect, useMemo, useRef, useCallback, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FocusTrap } from 'focus-trap-react';
import IconButton from '@/ui/components/IconButton';
import { FloatingOpenButton } from '@/ui/components/FloatingOpenButton';
import { Header } from '@/ui/components/Header';
import { SearchInput } from '@/ui/components/Search';
import { AddFavoriteModal } from '@/ui/features/AddFavoriteModal/AddFavoriteModal';
import AddFolderModal from '@/ui/features/AddFolderModal/AddFolderModal';
import { DroppableFolderNode } from '@/ui/features/DroppableFolderNode/DroppableFolderNode';
import { useFavoritesStore } from '@/ui/hooks/useFavoritesStore';
import { Footer } from '@/ui/components/Footer';
import { FavoriteManager } from '@/pages/FavoriteManager';

interface AsidePanelProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export default function AsidePanel({
  open = true,
  onOpenChange,
}: AsidePanelProps) {
  const folders = useFavoritesStore((state) => state.folders);
  const selectedFolder = useFavoritesStore((state) => state.selectedFolder);
  const setSelectedFolder = useFavoritesStore((state) => state.setSelectedFolder);
  const deleteFolder = useFavoritesStore((state) => state.deleteFolder);
  const loadFolders = useFavoritesStore((state) => state.loadFolders);
  const loadFavoritesByFolder = useFavoritesStore((state) => state.loadFavoritesByFolder);
  const loadAllFavorites = useFavoritesStore((state) => state.loadAllFavorites);

  const [showAddFolder, setShowAddFolder] = useState(false);
  const [showAddFavorite, setShowAddFavorite] = useState(false);

  const currentUrl = useMemo(
    () => (typeof window !== 'undefined' ? window.location.href : ''),
    []
  );

  useEffect(() => {
    loadFolders();
  }, [loadFolders]);

  useEffect(() => {
    if (selectedFolder) {
      loadFavoritesByFolder();
    } else {
      loadAllFavorites();
    }
  }, [selectedFolder, loadFavoritesByFolder, loadAllFavorites]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onOpenChange?.(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onOpenChange]);

  const asideRef = useRef<HTMLElement | null>(null);
  const handleBackdropClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (showAddFolder || showAddFavorite) {
        e.stopPropagation();
        return;
      }
      if (asideRef.current && !asideRef.current.contains(e.target as Node)) {
        onOpenChange?.(false);
      }
    },
    [onOpenChange, showAddFolder, showAddFavorite]
  );

  return (
    <>
      {!open && <FloatingOpenButton onClick={() => onOpenChange?.(true)} />}

      <AnimatePresence>
        {open && (
          <React.Fragment>
            {open && !showAddFolder && !showAddFavorite && (
              <motion.section
                className="fixed inset-0 z-40 bg-black/40 flex items-start justify-end"
                onClick={handleBackdropClick}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                aria-hidden="true"
              />
            )}
            <FocusTrap
               active={open && !showAddFolder && !showAddFavorite}
               focusTrapOptions={{
                initialFocus: () => asideRef.current as HTMLElement,
                escapeDeactivates: false,
                clickOutsideDeactivates: false,
              }}
            >
              <motion.aside
                ref={asideRef}
                role="dialog"
                aria-label="Panel de gestión de favoritos"
                aria-modal="true"
                className="fixed right-0 top-0 z-60 h-full w-full max-w-[480px] bg-white dark:bg-zinc-900 shadow-lg flex flex-col pl-4"
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', stiffness: 300, damping: 28 }}
                onClick={(e) => e.stopPropagation()}
              >
                <IconButton
                  onClick={() => onOpenChange?.(false)}
                  title="Cerrar panel"
                  className="absolute top-7 right-4 z-10"
                />

                <section className="border-zinc-300 dark:border-zinc-800 pt-6">
                  <Header />
                </section>

                <section
                  className="flex flex-col gap-8 h-full pt-16 pb-4"
                  aria-label="Herramientas"
                >
                  <SearchInput />

                  <section className="flex flex-col items-start gap-8">
                    <button
                      onClick={() => setShowAddFavorite(true)}
                      className="px-3 py-1.5 text-sm bg-gradient-to-r from-purple-500 via-purple-600 to-purple-700 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-purple-300 dark:focus:ring-purple-800 text-white font-medium rounded-lg cursor-pointer"
                      aria-label="Agregar un nuevo favorito"
                    >
                      + Agrega Tu Favorito
                    </button>

                    <AddFavoriteModal
                      url={currentUrl}
                      folder={selectedFolder}
                      open={showAddFavorite}
                      onClose={() => setShowAddFavorite(false)}
                      onSave={() => setShowAddFavorite(false)}
                    />

                    <button
                      onClick={() => setShowAddFolder(true)}
                      className="px-3 py-1.5 text-sm bg-gradient-to-r from-cyan-700 via-cyan-600 to-cyan-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-cyan-300 dark:focus:ring-cyan-800 text-white font-medium rounded-lg cursor-pointer"
                      aria-label="Crear nueva carpeta"
                    >
                      + Nueva Carpeta
                    </button>

                    <AddFolderModal
                      isOpen={showAddFolder}
                      onClose={() => setShowAddFolder(false)}
                    />
                  </section>

                  <section className="py-4 border-t border-zinc-300 dark:border-zinc-800 mr-2">
                    <DroppableFolderNode
                      nodes={folders}
                      selectedFolder={selectedFolder}
                      setSelectedFolder={setSelectedFolder}
                      deleteFolder={deleteFolder}
                      level={0}
                    />
                  </section>
                  
                  {/* AGREGAR: Mostrar favoritos solo de la carpeta seleccionada */}
                  {selectedFolder && (
                    <section className="border-t border-zinc-300 dark:border-zinc-800">
                      <FavoriteManager folderPath={selectedFolder} />
                    </section>
                  )}
                </section>

                <section className="border-t border-zinc-300 dark:border-zinc-800 p-4">
                  <Footer />
                </section>
              </motion.aside>
            </FocusTrap>
          </React.Fragment>
        )}
      </AnimatePresence>
    </>
  );
}
