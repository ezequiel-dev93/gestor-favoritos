import React from "react";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export const Modal: React.FC<ModalProps> = ({ open, onClose, title, children, className = "" }) => {
  if (!open) return null;
  return (
    <section className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
        aria-label="Cerrar modal"
      />
      
      <div
        className={`relative bg-white dark:bg-zinc-800 rounded-lg shadow-xl p-6 w-full max-w-md mx-2 ${className}`}
        onClick={e => e.stopPropagation()}
      >
        {title && (
          <h2 className="text-lg font-bold mb-4 text-zinc-800 dark:text-zinc-100">{title}</h2>
        )}
        <button
          className="absolute top-3 right-3 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
          onClick={onClose}
          title="Cerrar"
        >
          ×
        </button>
        {children}
      </div>
    </section>
  );
};
