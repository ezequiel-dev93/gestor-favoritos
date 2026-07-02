import { FiFolder, FiFolderPlus, FiUploadCloud } from "react-icons/fi";
import { motion } from "framer-motion";

interface EmptyStateProps {
  onCreateFolder: () => void;
}

const ORBIT_DOTS = [
  { delay: 0, size: "size-1.5", color: "bg-purple-400", duration: 10 },
  { delay: 0.4, size: "size-1", color: "bg-cyan-400", duration: 13 },
  { delay: 0.8, size: "size-2", color: "bg-purple-300", duration: 16 },
  { delay: 1.2, size: "size-1", color: "bg-pink-400", duration: 11 },
  { delay: 1.6, size: "size-1.5", color: "bg-cyan-300", duration: 14 },
  { delay: 2.0, size: "size-1", color: "bg-purple-500", duration: 9 },
] as const;

/*
 - EmptyState — SRP: renderiza el estado vacio del grid de carpetas.
 - Muestra una ilustracion animada, copy de bienvenida y CTAs para comenzar.
 - No conoce nada de DnD, store ni logica de negocio.
*/
export function EmptyState({ onCreateFolder }: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="flex flex-col items-center justify-center flex-1 gap-8 select-none h-full py-20"
    >

      <div className="relative flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
          className="absolute size-36 rounded-full border border-dashed border-purple-500/20"
        />
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
          className="absolute size-24 rounded-full border border-dashed border-purple-400/30"
        />

        {ORBIT_DOTS.map((dot, i) => (
          <motion.div
            key={i}
            className="absolute size-36 flex items-start justify-center"
            animate={{ rotate: 360 }}
            transition={{
              duration: dot.duration,
              repeat: Infinity,
              ease: "linear",
              delay: dot.delay,
            }}
          >
            <div className={`${dot.size} ${dot.color} rounded-full mt-0.5 opacity-70`} />
          </motion.div>
        ))}

        <motion.div
          animate={{ scale: [1, 1.06, 1] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          className="relative z-10 flex items-center justify-center size-16 rounded-2xl bg-zinc-900 border border-purple-500/30 shadow-lg shadow-purple-500/10"
        >
          <FiFolder size={28} className="text-purple-400" />
        </motion.div>
      </div>

      <div className="flex flex-col items-center gap-2 text-center max-w-xs pt-8">
        <motion.h2
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="text-xl font-semibold text-zinc-100 tracking-tight"
        >
          Tu espacio esta listo
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.4 }}
          className="text-sm text-zinc-500 leading-relaxed"
        >
          Organiza todo lo que guardas en carpetas que tengan sentido.
          Sin caos, sin pestanas perdidas.
        </motion.p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.4 }}
        className="flex flex-col sm:flex-row items-center gap-3"
      >
        <button
          onClick={onCreateFolder}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-sm font-medium transition-all hover:scale-[1.03] active:scale-[0.97] shadow-lg shadow-purple-500/20 cursor-pointer"
        >
          <FiFolderPlus size={15} />
          Crear primera carpeta
        </button>
        <span className="text-xs text-zinc-600">o</span>
        <button
          onClick={() => {
            const btn = document.querySelector("[data-settings-import]") as HTMLElement | null;
            btn?.click();
          }}
          className="flex items-center gap-2 px-4 py-2 rounded-lg border border-zinc-700 hover:border-zinc-500 text-zinc-400 hover:text-zinc-200 text-sm font-medium transition-all hover:scale-[1.03] active:scale-[0.97] cursor-pointer"
        >
          <FiUploadCloud size={15} />
          Importar favoritos
        </button>
      </motion.div>
    </motion.div>
  );
}
