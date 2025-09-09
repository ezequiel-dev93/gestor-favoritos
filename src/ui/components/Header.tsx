import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";

export function Header() {
  const titleRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (titleRef.current) {
      gsap.to(titleRef.current, {
        duration: 2,
        text: "Gestor De Favoritos",
        ease: "power2.out",
        delay: 0.5,
      });
    }
  }, []);

  return (
    <header className="flex items-center gap-3 text-white">
      <img src="/img/LogoTipo.webp" alt="Logo Gestor de Favoritos" className="w-10" />

      <h1 ref={titleRef} className="text-2xl sm:text-3xl font-bold tracking-wide"></h1>
    </header>
  );
}
     