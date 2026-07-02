import { FiEdit3, FiMoreVertical, FiPlus, FiX } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";

interface FolderMenuProps {
  showMenu: boolean;
  onToggleMenu: () => void;
  onAddFavorite: () => void;
  onRename: () => void;
  onDelete: () => void;
}

/*
 - FolderMenu — SRP: menu contextual de opciones de una carpeta.
 - Gestiona su propia apertura/cierre mediante el backdrop invisible,
  y delega cada accion al componente padre via callbacks.
*/
export function FolderMenu({
  showMenu,
  onToggleMenu,
  onAddFavorite,
  onRename,
  onDelete,
}: FolderMenuProps) {
  return (
    <div className="relative">
      <button
        onClick={(e) => {
          e.stopPropagation();
          onToggleMenu();
        }}
        title="Opciones de carpeta"
        className={`p-1.5 transition-colors rounded-md ${showMenu
            ? "bg-zinc-200 dark:bg-zinc-700 text-zinc-800 dark:text-zinc-100"
            : "text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300 hover:bg-zinc-200/50 dark:hover:bg-zinc-700/50"
          }`}
      >
        <FiMoreVertical size={14} />
      </button>

      <AnimatePresence>
        {showMenu && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={(e) => {
                e.stopPropagation();
                onToggleMenu();
              }}
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -5 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -5 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 top-full mt-1 w-44 bg-white dark:bg-zinc-800 rounded-lg shadow-xl border border-zinc-200 dark:border-zinc-700 z-50 overflow-hidden"
            >
              <div className="flex flex-col py-1">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onAddFavorite();
                  }}
                  className="flex items-center gap-2.5 px-3 py-2 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700/50 transition-colors text-left"
                >
                  <FiPlus size={14} className="text-purple-500 shrink-0" />
                  <span className="truncate">Agregar Favorito</span>
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onRename();
                  }}
                  className="flex items-center gap-2.5 px-3 py-2 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700/50 transition-colors text-left"
                >
                  <FiEdit3 size={14} className="text-blue-500 shrink-0" />
                  <span className="truncate">Renombrar</span>
                </button>

                <div className="h-px bg-zinc-200 dark:bg-zinc-700 my-1 mx-2" />

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete();
                  }}
                  className="flex items-center gap-2.5 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors text-left"
                >
                  <FiX size={14} className="shrink-0" />
                  <span className="truncate">Eliminar</span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
