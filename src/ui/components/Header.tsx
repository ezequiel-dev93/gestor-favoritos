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
      <img src="/img/LogoTipo.webp" alt="Logo de BookMarkNest" className="w-8 sm:w-9" />

      <h1
        ref={titleRef}
        aria-label="BookMarkNest"
        className="text-xl sm:text-2xl font-bold tracking-wide"
      >
        <span className="sr-only">BookMarkNest</span>
      </h1>
    </div>
  );
}
