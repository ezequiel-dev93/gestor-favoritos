import React, { useEffect, useId, useRef } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FiX } from "react-icons/fi";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

export const Modal: React.FC<ModalProps> = ({ 
  open, 
  onClose, 
  title,
  description, 
  children, 
  className = "" 
}) => {
  const titleId = useId();
  const descId = useId();
  const modalRef = useRef<HTMLElement>(null);
  const previousActiveElementRef = useRef<HTMLElement | null>(null);

  // 1. Bloqueo de scroll en body mientras esté abierto
  useEffect(() => {
    if (!open) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [open]);

  // 2. Captura y restauración del foco (Focus Trap & Restore - WCAG 2.1.2 y 2.4.3)
  useEffect(() => {
    if (!open) return;
    previousActiveElementRef.current = document.activeElement as HTMLElement | null;

    // Foco inicial dentro del modal tras animar
    const timer = setTimeout(() => {
      if (!modalRef.current) return;
      const firstFocusable = modalRef.current.querySelector<HTMLElement>(FOCUSABLE_SELECTOR);
      if (firstFocusable) {
        firstFocusable.focus();
      } else {
        modalRef.current.focus();
      }
    }, 50);

    return () => {
      clearTimeout(timer);
      // Restaurar foco al elemento que activó el modal
      if (previousActiveElementRef.current && typeof previousActiveElementRef.current.focus === "function") {
        previousActiveElementRef.current.focus();
      }
    };
  }, [open]);

  // 3. Manejo de teclado: Escape para cerrar y Tab para ciclar el foco
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }

      if (e.key === "Tab" && modalRef.current) {
        const focusables = Array.from(
          modalRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)
        ).filter((el) => el.offsetParent !== null);

        if (focusables.length === 0) {
          e.preventDefault();
          return;
        }

        const first = focusables[0];
        const last = focusables[focusables.length - 1];

        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  return createPortal(
    <AnimatePresence>
      {open && (
        <section
          className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
          aria-live="polite"
        >
          {/* Backdrop con desenfoque suave */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="fixed inset-0 bg-black/60 backdrop-blur-[2px]"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Tarjeta del modal animada */}
          <motion.article
            ref={modalRef}
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby={title ? titleId : undefined}
            aria-describedby={description ? descId : undefined}
            tabIndex={-1}
            className={`relative z-[101] bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl shadow-cyan-500/10 border border-zinc-200 dark:border-zinc-800 p-5 sm:p-6 w-full max-w-md my-auto outline-none ${className}`}
          >
            {/* Header del modal con separador */}
            {(title || description) && (
              <header className="flex items-start justify-between gap-3 pb-3 mb-4 border-b border-zinc-100 dark:border-zinc-800">
                <div className="flex-1 min-w-0 pr-2">
                  {title && (
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-4.5 rounded-full bg-gradient-to-b from-cyan-400 to-blue-500 shrink-0" aria-hidden="true" />
                      <h2
                        id={titleId}
                        className="text-base sm:text-lg font-bold text-zinc-900 dark:text-zinc-100 truncate tracking-tight"
                      >
                        {title}
                      </h2>
                    </div>
                  )}
                  {description && (
                    <p
                      id={descId}
                      className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1 leading-relaxed"
                    >
                      {description}
                    </p>
                  )}
                </div>

                <button
                  type="button"
                  className="size-8 flex items-center justify-center rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 cursor-pointer shrink-0"
                  onClick={onClose}
                  title="Cerrar ventana"
                  aria-label="Cerrar ventana modal"
                >
                  <FiX size={18} aria-hidden="true" />
                </button>
              </header>
            )}

            {!title && !description && (
              <button
                type="button"
                className="absolute top-3.5 right-3.5 size-8 flex items-center justify-center rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 cursor-pointer"
                onClick={onClose}
                title="Cerrar ventana"
                aria-label="Cerrar ventana modal"
              >
                <FiX size={18} aria-hidden="true" />
              </button>
            )}

            {children}
          </motion.article>
        </section>
      )}
    </AnimatePresence>,
    document.body
  );
};
