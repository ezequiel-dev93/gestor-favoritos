import { FavoriteDndContext } from "@/ui/features/FavoriteDndContext/FavoriteDndContext";
import { FavoriteList } from "@/ui/features/FavoritesList/FavoritesList";
import { motion } from "framer-motion";

interface FavoriteManagerProps {
  folderPath?: string[];
}

export function FavoriteManager({ folderPath }: FavoriteManagerProps) {
   
  return (
    <motion.section
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 15 }}
      transition={{ duration: 0.4, ease: "easeInOut" }}
    >
      <FavoriteDndContext>
        <FavoriteList folderPath={folderPath} /> 
      </FavoriteDndContext>
    </motion.section>
  );
}