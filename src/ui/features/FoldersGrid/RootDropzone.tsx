import { useDroppable } from "@dnd-kit/core";
import { motion } from "framer-motion";

/**
 * RootDropzone — SRP: area de drop visible al arrastrar una carpeta.
 * Permite soltar una carpeta para moverla a la raiz del arbol.
 */
export function RootDropzone() {
  const { isOver, setNodeRef } = useDroppable({ id: "root-dropzone" });
  return (
    <motion.div
      ref={setNodeRef}
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: 48, opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      className={`w-full flex items-center justify-center rounded-xl border-2 border-dashed mb-4 transition-colors ${
        isOver
          ? "border-purple-500 bg-purple-500/10 text-purple-500"
          : "border-zinc-300 dark:border-zinc-700 bg-zinc-100/50 dark:bg-zinc-800/50 text-zinc-500"
      }`}
    >
      <span className="font-semibold text-sm">Soltar aqui para mover a la Raiz</span>
    </motion.div>
  );
}
