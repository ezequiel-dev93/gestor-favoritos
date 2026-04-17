import React from "react";
import type { FolderNode } from "@/core/favorites/entities/FolderNode";
import { FolderNodeItem } from "@/ui/features/DroppableFolderNode/FolderNodeItem";
import { useDroppableFolderNode } from "@/ui/hooks/useDroppableFolderNode";
import { FavoriteManager } from "@/pages/FavoriteManager";

interface DroppableFolderNodeProps {
  nodes: FolderNode[];
  path?: string[];
  selectedFolder: string[] | null;
  setSelectedFolder: (folder: string[] | null) => void;
  deleteFolder: (folderPath: string[]) => void;
  updateFolderName?: (path: string[], newName: string) => Promise<void>;
  level?: number;
}

export const DroppableFolderNode: React.FC<DroppableFolderNodeProps> = ({
  nodes,
  path = [],
  selectedFolder,
  setSelectedFolder,
  deleteFolder,
  updateFolderName,
  level = 0,
}) => {
  return (
    <>
      {nodes.map((node) => (
        <FolderNodeWrapper
          key={node.name}
          node={node}
          path={path}
          selectedFolder={selectedFolder}
          setSelectedFolder={setSelectedFolder}
          deleteFolder={deleteFolder}
          updateFolderName={updateFolderName}
          level={level}
        />
      ))}
    </>
  );
};

interface FolderNodeWrapperProps {
  node: FolderNode;
  path: string[];
  selectedFolder: string[] | null;
  setSelectedFolder: (folder: string[] | null) => void;
  deleteFolder: (folderPath: string[]) => void;
  updateFolderName?: (path: string[], newName: string) => Promise<void>;
  level: number;
}

const FolderNodeWrapper: React.FC<FolderNodeWrapperProps> = ({
  node,
  path,
  selectedFolder,
  setSelectedFolder,
  deleteFolder,
  updateFolderName,
  level,
}) => {
  const folderProps = useDroppableFolderNode({
    node,
    path,
    selectedFolder,
    setSelectedFolder,
    deleteFolder,
    level,
  });

  return (
    <li className="list-none mb-4">
      <FolderNodeItem {...folderProps} onUpdateName={updateFolderName} />

      {folderProps.isOpen && folderProps.hasChildren && (
        <ul>
          <DroppableFolderNode
            nodes={node.children || []}
            path={folderProps.currentPath}
            selectedFolder={selectedFolder}
            setSelectedFolder={setSelectedFolder}
            deleteFolder={deleteFolder}
            updateFolderName={updateFolderName}
            level={level + 1}
          />
        </ul>
      )}

      {selectedFolder &&
        folderProps.currentPath.length === selectedFolder.length &&
        folderProps.currentPath.every((val, index) => val === selectedFolder[index]) && (
          <div className="pl-6">
            <FavoriteManager folderPath={selectedFolder} />
          </div>
        )}
    </li>
  );
};