import { useState } from "react";
import { FiSettings } from "react-icons/fi";
import { SettingsModal } from "@/ui/features/Settings/SettingsModal";
import { SearchInput } from "@/ui/components/Search";

interface SettingsButtonProps {
  onImportDone: () => void;
}

/*
 - SettingsButton — SRP: botón flotante fijo en esquina inferior derecha.
 - Solo gestiona la apertura/cierre del SettingsModal.
*/
export function SettingsButton({ onImportDone }: SettingsButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="fixed bottom-12 right-4 z-50 flex flex-col items-center gap-3">
        <SearchInput />

        <button
          onClick={() => setOpen(true)}
          className="flex items-center justify-center size-11 rounded-full bg-zinc-800 dark:bg-zinc-700 hover:bg-zinc-700 dark:hover:bg-zinc-600 text-zinc-100 shadow-lg hover:shadow-xl transition-all hover:scale-105 active:scale-95 cursor-pointer"
          aria-label="Abrir configuración"
          title="Configuración"
        >
          <FiSettings size={18} />
        </button>
      </div>

      <SettingsModal
        open={open}
        onClose={() => setOpen(false)}
        onImportDone={onImportDone}
      />
    </>
  );
}
