import React, { useEffect, useId } from "react";
import { createPortal } from "react-dom";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export const Modal: React.FC<ModalProps> = ({ 
  open, 
  onClose, 
  title, 
  children, 
  className = "" 
}) => {
  const titleId = useId();

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <section className="fixed inset-0 z-[100] flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-[1px]"
        onClick={onClose}
        aria-hidden="true"
      />
      
      <article
        className={`relative z-[101] bg-white dark:bg-zinc-800 rounded-xl shadow-xl border border-zinc-200 dark:border-zinc-700 p-6 w-full max-w-md mx-2 ${className}`}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
      >
        {title && (
          <h2 
            id={titleId}
            className="text-lg font-bold mb-4 pr-8 text-zinc-800 dark:text-zinc-100"
          >
            {title}
          </h2>
        )}

        <button
          type="button"
          className="absolute top-3 right-3 size-8 flex items-center justify-center rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-700/60 text-xl font-bold transition-colors focus-visible:ring-2 focus-visible:ring-purple-500 cursor-pointer"
          onClick={onClose}
          title="Cerrar"
          aria-label="Cerrar modal"
        >
          <span aria-hidden="true">×</span>
        </button>
        {children}
      </article>
    </section>,
    document.body
  );
};
