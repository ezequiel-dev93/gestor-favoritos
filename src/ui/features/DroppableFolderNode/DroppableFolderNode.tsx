'use client';

import React from 'react';
import { FcOpenedFolder } from 'react-icons/fc';
import { FiX, FiChevronRight } from 'react-icons/fi';
import { FavoriteManager } from '@/pages/FavoriteManager';
import type { FolderNode } from '@/core/favorites/entities/FolderNode';
import { useFolderNode } from '@/ui/hooks/useFolderNode';

interface DroppableFolderNodeProps {
  nodes: FolderNode[];
  path?: string[];
  selectedFolder: string[] | null;
  setSelectedFolder: (folder: string[] | null) => void;
  deleteFolder: (folderPath: string[]) => void;
  level?: number;
}

const DroppableFolderNode: React.FC<DroppableFolderNodeProps> = ({
  nodes,
  path = [],
  selectedFolder,
  setSelectedFolder,
  deleteFolder,
  level = 0,
}) => {
  const showHeader = level === 0;

  return (
    <section aria-label="Estructura de carpetas">
      {showHeader && (
        <header className="flex items-center justify-between mb-2">
          <h2 className="text-xl font-bold text-zinc-500 dark:text-zinc-300 tracking-widest">
            Carpetas
          </h2>
        </header>
      )}

      {nodes.length === 0 ? (
        <article className="flex items-center gap-2 text-zinc-400 dark:text-zinc-300 text-sm px-2 py-1">
          <FcOpenedFolder className="text-lg" />
          <span>Sin carpetas</span>
        </article>
      ) : (
        <nav aria-label="Navegación de carpetas">
          <ul role="tree" className="space-y-1">
            {nodes.map((node) => {
              const {
                currentPath,
                isSelected,
                isOpen,
                hasChildren,
                handleToggle,
              } = useFolderNode(node, path, selectedFolder, setSelectedFolder);

              return (
                <li
                  key={currentPath.join('/')}
                  role="treeitem"
                  aria-expanded={hasChildren ? (isOpen ? 'true' : 'false') : undefined}
                >
                  <article style={{ paddingLeft: level * 16 }} className="mb-1">
                    <div
                      className={`flex items-center px-2 py-1 rounded cursor-pointer transition-colors ${
                        isSelected
                          ? 'bg-purple-200 dark:bg-purple-600 ring-2 ring-purple-500'
                          : 'bg-zinc-200 dark:bg-zinc-700'
                      }`}
                      onClick={handleToggle}
                      aria-current={isSelected ? 'true' : 'false'}
                    >
                      {hasChildren && (
                        <FiChevronRight
                          className={`mr-1 transition-transform duration-200 ${
                            isOpen ? 'rotate-90' : ''
                          }`}
                        />
                      )}

                      <span className="flex items-center gap-2 flex-1 truncate">
                        <FcOpenedFolder className="text-lg" />
                        {node.name}
                      </span>

                      <button
                        className="ml-2 text-red-500 hover:bg-red-100 dark:hover:bg-red-900 rounded-full p-1 transition-colors"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteFolder(currentPath);
                        }}
                        aria-label={`Eliminar carpeta ${node.name}`}
                      >
                        <FiX className="text-base" />
                      </button>
                    </div>

                    {isOpen && (
                      <section className="pl-4 mt-2 space-y-2">
                        <section aria-label={`Contenido de ${node.name}`}>
                          <FavoriteManager />
                        </section>

                        {hasChildren && (
                          <DroppableFolderNode
                            nodes={node.children ?? []}
                            path={currentPath}
                            selectedFolder={selectedFolder}
                            setSelectedFolder={setSelectedFolder}
                            deleteFolder={deleteFolder}
                            level={level + 1}
                          />
                        )}
                      </section>
                    )}
                  </article>
                </li>
              );
            })}
          </ul>
        </nav>
      )}
    </section>
  );
};

export default DroppableFolderNode;
