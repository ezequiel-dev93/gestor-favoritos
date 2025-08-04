'use client';

import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import IconButton from '@/ui/components/IconButton';
import { FloatingOpenButton } from '@/ui/components/FloatingOpenButton';
import { Header } from '@/ui/components/Header';
import { Footer } from '@/ui/components/Footer';
import { SearchInput } from '@/ui/components/Search';
import FolderList from '@/ui/features/FolderList/FolderList';
import { AddFavoriteModal } from '@/ui/features/AddFavoriteModal/AddFavoriteModal';
import { useFavoritesStore } from '@/ui/hooks/useFavoritesStore';


export default function AsidePanel() {
  const [open, setOpen] = useState(true);
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);
  const [showAddFolder, setShowAddFolder] = useState(false);
  const [showAddFavorite, setShowAddFavorite] = useState(false);
  const panelRef = useRef(null);

  const folders = useFavoritesStore(s => s.folders);
  const setSelectedFolder = useFavoritesStore(s => s.setSelectedFolder);
  const deleteFolder = useFavoritesStore(s => s.deleteFolder);
  const loadFolders = useFavoritesStore(s => s.loadFolders);
  const loadFavoritesByFolder = useFavoritesStore(s => s.loadFavoritesByFolder);
  const loadAllFavorites = useFavoritesStore(s => s.loadAllFavorites);
  const selectedFolder = useFavoritesStore(s => s.selectedFolder);

  useEffect(() => {
    loadFolders();
  }, [loadFolders]);

  useEffect(() => {
    if (selectedFolder) {
      loadFavoritesByFolder();
    } else {
      loadAllFavorites();
    }
  }, [selectedFolder]);

  const handleOutsideClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (panelRef.current && !(panelRef.current as any).contains(e.target)) {
      setOpen(false);
    }
  };

  return (
    <>
      {open ? (
        <section
          className="fixed inset-0 bg-black/30 z-40 flex items-start justify-end"
          onClick={handleOutsideClick}
        >
          <motion.aside
            ref={panelRef}
            initial={{ y: '-100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '-100%', opacity: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20 }}
            className="bg-zinc-100 dark:bg-zinc-800 h-screen w-full max-w-[460px] shadow-lg relative overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            <IconButton
              onClick={() => setOpen(false)}
              className="absolute top-4 right-4 z-10"
            />
            <section className="flex flex-col gap-8 h-full pt-16 pb-4">
              <section className="px-4">
                <Header />
              </section>

              <section className='flex flex-col gap-4 px-4'>
                <SearchInput />
                <div>
                  <button
                    onClick={() => setShowAddFolder(true)}
                    className="px-2 py-1 text-xs bg-gradient-to-r from-cyan-400 via-cyan-500 to-cyan-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-cyan-300 dark:focus:ring-cyan-800 font-medium rounded-lg text-center me-2 mb-2 cursor-pointer" 
                  >
                    + Nueva Carpeta
                  </button>
                </div>

                <div>
                  <button
                    className="px-2 py-1 text-xs self-start bg-gradient-to-r from-purple-500 via-purple-600 to-purple-700 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-purple-300 dark:focus:ring-purple-800 font-medium rounded-lg text-center me-2 mb-2 cursor-pointer"
                    onClick={() => setShowAddFavorite(true)}
                  >
                    + Agrega Tu Favorito
                  </button>
                  <AddFavoriteModal
                    url={window.location.href}
                    folder={selectedFolder}
                    open={showAddFavorite}
                    onClose={() => setShowAddFavorite(false)}
                    onSave={() => setShowAddFavorite(false)}
                  />
                </div>
              </section>

              <section className="flex-1 overflow-y-auto px-4 py-2 flex flex-col gap-8">
                <FolderList
                  folders={folders}
                  selectedFolder={selectedFolder}
                  setSelectedFolder={setSelectedFolder}
                  deleteFolder={deleteFolder}
                  showAddFolder={showAddFolder}
                  setShowAddFolder={setShowAddFolder}
                />
              </section>
              <section className="p-2 border-t border-zinc-300 dark:border-zinc-700">
                <Footer />
              </section>
            </section>
          </motion.aside>
        </section>
      ) : null}
      {!open && <FloatingOpenButton onClick={() => setOpen(true)} />}
    </>
  );
}
