import { useCallback } from "react";
import confetti from "canvas-confetti";

const AUTHOR_URL = "https://ezequielsuarez-dev.com";

/** Colores en sintonía con la paleta del proyecto */
const CONFETTI_COLORS = ["#8b5cf6", "#06b6d4", "#a78bfa", "#22d3ee", "#f0abfc", "#ffffff"];

/**
 * Footer — lanza una animación de confeti al hacer click en el enlace del autor,
 * luego abre el link en una nueva pestaña.
 */
export function Footer() {
  const handleAuthorClick = useCallback((e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();

    // Disparo inicial desde el centro
    confetti({
      particleCount: 120,
      spread: 80,
      origin: { x: 0.5, y: 1 },
      colors: CONFETTI_COLORS,
      startVelocity: 55,
      gravity: 0.9,
      ticks: 200,
    });

    // Segunda oleada desde los costados para más espectacularidad
    setTimeout(() => {
      confetti({ particleCount: 60, angle: 60, spread: 55, origin: { x: 0, y: 1 }, colors: CONFETTI_COLORS });
      confetti({ particleCount: 60, angle: 120, spread: 55, origin: { x: 1, y: 1 }, colors: CONFETTI_COLORS });
    }, 150);

    // Abrir el link una vez que el usuario ya vio el efecto
    setTimeout(() => {
      window.open(AUTHOR_URL, "_blank", "noopener,noreferrer");
    }, 400);
  }, []);

  return (
    <footer className="text-xs text-center text-zinc-500 dark:text-zinc-400 py-2 dark:border-zinc-700 mt-auto">
      <p>
        © Todos los derechos reservados | Desarrollado por{" "}
        <a
          href={AUTHOR_URL}
          onClick={handleAuthorClick}
          rel="noopener noreferrer"
          className="text-gray-200 hover:text-purple-500 underline font-medium transition-colors duration-200 cursor-pointer"
          aria-label="Visitar el sitio web de Ezequiel Suárez"
        >
          Ezequiel Suárez
        </a>
      </p>
    </footer>
  );
}
