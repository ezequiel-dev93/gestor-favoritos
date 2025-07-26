import { useState } from "react";

export function useHoveredFolder() {
  const [hoveredFolder, setHoveredFolder] = useState<string | null>(null);
  return { hoveredFolder, setHoveredFolder };
}
