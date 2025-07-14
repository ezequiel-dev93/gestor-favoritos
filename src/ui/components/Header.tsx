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
    <header className="text-white px-6 py-4 shadow-md">
      <h1 ref={titleRef} className="text-3xl font-bold tracking-wide pl-6"></h1>
    </header>
  );
}
