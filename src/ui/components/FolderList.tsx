'use client';

import React from 'react';
import { FiX } from 'react-icons/fi';
import { FcOpenedFolder } from "react-icons/fc";
import { GiOpenFolder } from 'react-icons/gi';
import AddFolderModal from "@/ui/features/AddFolderModal/AddFolderModal";

interface FolderListProps {
  folders: string[];
  selectedFolder: string | null;
  setSelectedFolder: (folder: string | null) => void;
  deleteFolder: (folder: string) => void;
  showAddFolder: boolean;
  setShowAddFolder: (show: boolean) => void;
}

const FolderList: React.FC<FolderListProps> = ({
  folders,
  selectedFolder,
  setSelectedFolder,
  deleteFolder,
  showAddFolder,
  setShowAddFolder,
}) => {
  return (
    <section>
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xl font-bold text-zinc-500 dark:text-zinc-300 tracking-widest">
          Carpetas
        </h3>

      </div>

      {folders.length === 0 ? (
        <div className="flex items-center gap-2 text-zinc-400 dark:text-zinc-300 text-sm px-2 py-1">
          <FcOpenedFolder className="text-lg" />
          <span>Sin carpetas</span>
        </div>
      ) : (
        <section className="flex flex-col gap-2">
          {folders.map(folder => (
            <div
              key={folder}
              className={`flex items-center justify-between px-2 py-1 bg-zinc-200 dark:bg-zinc-700 rounded cursor-pointer transition-colors ${
                selectedFolder === folder ? 'ring-2 ring-purple-500' : ''
              }`}
              onClick={() => setSelectedFolder(selectedFolder === folder ? null : folder)}
            >
              <span className="flex items-center gap-2">
                <GiOpenFolder className="text-lg text-zinc-500 dark:text-zinc-300" />
                {folder}
              </span>

              <button
                className="text-red-500 hover:bg-red-100 dark:hover:bg-red-900 rounded-full p-1 transition-colors"
                onClick={e => {
                  e.stopPropagation();
                  deleteFolder(folder);
                }}
                title="Eliminar carpeta"
              >
                <FiX className="text-base" />
              </button>
            </div>
          ))}
        </section>
      )}

      <AddFolderModal
        isOpen={showAddFolder}
        onClose={() => setShowAddFolder(false)}
      />
    </section>
  );
};

export default FolderList;
