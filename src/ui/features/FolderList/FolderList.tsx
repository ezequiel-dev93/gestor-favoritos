'use client';

import React from 'react';
import type { FolderNode } from '@/core/favorites/entities/FolderNode';
import { FiX } from 'react-icons/fi';
import { FcOpenedFolder } from "react-icons/fc";
import { GiOpenFolder } from 'react-icons/gi';
import AddFolderModal from "@/ui/features/AddFolderModal/AddFolderModal";
import { FavoriteManager } from '@/pages/FavoriteManager';

interface FolderListProps {
  folders: FolderNode[];
  selectedFolder: string[] | null;
  setSelectedFolder: (folder: string[] | null) => void;
  deleteFolder: (folderPath: string[]) => void;
  showAddFolder: boolean;
  setShowAddFolder: (show: boolean) => void;
}


function FolderTree({
  nodes,
  path = [],
  selectedFolder,
  setSelectedFolder,
  deleteFolder,
  level = 0,
}: {
  nodes: FolderNode[];
  path?: string[];
  selectedFolder: string[] | null;
  setSelectedFolder: (folder: string[] | null) => void;
  deleteFolder: (folderPath: string[]) => void;
  level?: number;
}) {
  return (
    <>
      {nodes.map((node) => {
        const currentPath = [...path, node.name];
        const isSelected =
          selectedFolder &&
          selectedFolder.length === currentPath.length &&
          selectedFolder.every((seg, i) => seg === currentPath[i]);
        return (
          <div key={currentPath.join("/")}
            style={{ marginLeft: level * 16 }}
            className="mb-1"
          >
            <div
              className={`flex items-center px-2 py-1 bg-zinc-200 dark:bg-zinc-700 rounded cursor-pointer transition-colors ${
                isSelected ? 'ring-2 ring-purple-500' : ''
              }`}
              onClick={() => setSelectedFolder(isSelected ? null : currentPath)}
            >
              <span className="flex items-center gap-2 flex-1">
                <GiOpenFolder className="text-lg text-zinc-500 dark:text-zinc-300" />
                {node.name}
              </span>
              <button
                className="ml-2 text-red-500 hover:bg-red-100 dark:hover:bg-red-900 rounded-full p-1 transition-colors"
                onClick={e => {
                  e.stopPropagation();
                  deleteFolder(currentPath);
                }}
                title="Eliminar carpeta"
              >
                <FiX className="text-base" />
              </button>
            </div>
            {isSelected && (
              <div className="mt-2">
                <FavoriteManager />
              </div>
            )}
            {node.children && node.children.length > 0 && (
              <FolderTree
                nodes={node.children}
                path={currentPath}
                selectedFolder={selectedFolder}
                setSelectedFolder={setSelectedFolder}
                deleteFolder={deleteFolder}
                level={level + 1}
              />
            )}
          </div>
        );
      })}
    </>
  );
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
        <article className="flex items-center gap-2 text-zinc-400 dark:text-zinc-300 text-sm px-2 py-1">
          <FcOpenedFolder className="text-lg" />
          <span>Sin carpetas</span>
        </article>
      ) : (
        <section className="flex flex-col gap-2">
          <FolderTree
            nodes={folders}
            selectedFolder={selectedFolder}
            setSelectedFolder={setSelectedFolder}
            deleteFolder={deleteFolder}
          />
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
