import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";

export function Header() {
  const titleRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (!titleRef.current) return;
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) {
      titleRef.current.textContent = "BookMarkNest";
      return;
    }
    gsap.to(titleRef.current, {
      duration: 2,
      text: "BookMarkNest",
      ease: "power2.out",
      delay: 0.5,
    });
  }, []);

  return (
    <div className="flex items-center gap-2.5 text-zinc-800 dark:text-white">
      <img
        src="/img/icon-192.png"
        srcSet="/img/icon-32.png 32w, /img/icon-192.png 192w"
        sizes="36px"
        alt="Logo de BookMarkNest"
        className="w-8 sm:w-9 h-8 sm:h-9 object-contain rounded-lg"
      />

      <h1
        ref={titleRef}
        aria-label="BookMarkNest"
        className="text-xl sm:text-2xl font-bold tracking-wide bg-gradient-to-r from-cyan-600 via-sky-500 to-blue-600 dark:from-cyan-300 dark:via-sky-400 dark:to-blue-400 bg-clip-text text-transparent"
      >
        <span className="sr-only">BookMarkNest</span>
      </h1>
    </div>
  );
}
