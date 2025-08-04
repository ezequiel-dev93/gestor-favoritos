import { FcOpenedFolder } from "react-icons/fc";

interface FloatingOpenButtonProps {
  onClick: () => void;
}

export function FloatingOpenButton({ onClick }: FloatingOpenButtonProps) {
  return (
    <button
      onClick={onClick}
      className="fixed top-4 right-4 z-50 size-10 bg-blue-600 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-blue-700 transition-colors cursor-pointer"
      title="Abrir panel de favoritos"
    >
      <FcOpenedFolder className="size-6" />
    </button>
  );
}
