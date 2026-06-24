import { useState } from "react";
import { FiSettings } from "react-icons/fi";
import { SettingsModal } from "@/ui/features/Settings/SettingsModal";

interface SettingsButtonProps {
  onImportDone: () => void;
}

/**
 * SettingsButton — SRP: botón flotante fijo en esquina inferior derecha.
 * Solo gestiona la apertura/cierre del SettingsModal.
 */
export function SettingsButton({ onImportDone }: SettingsButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-50 flex items-center justify-center size-11 rounded-full bg-zinc-800 dark:bg-zinc-700 hover:bg-zinc-700 dark:hover:bg-zinc-600 text-zinc-100 shadow-lg hover:shadow-xl transition-all hover:scale-105 active:scale-95 cursor-pointer"
        aria-label="Abrir configuración"
        title="Configuración"
      >
        <FiSettings size={18} />
      </button>

      <SettingsModal
        open={open}
        onClose={() => setOpen(false)}
        onImportDone={onImportDone}
      />
    </>
  );
}
