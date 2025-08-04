import { useFavoritesStore } from "@/ui/hooks/useFavoritesStore";
import { FavoriteCard } from "@/ui/features/FavoriteCard/FavoriteCard";
import { motion, AnimatePresence } from "framer-motion";
import { SortableContext, verticalListSortingStrategy, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

function DraggableFavorite({ favorite }: { favorite: any }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: favorite.id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 10 : undefined,
  };
  return (
    <motion.li
      ref={setNodeRef}
      style={style}
      layout
      {...attributes}
      {...listeners}
    >
      <FavoriteCard favorite={favorite} />
    </motion.li>
  );
}

export function FavoriteList() {
  const favorites = useFavoritesStore(s => s.favorites);
  const isLoading = useFavoritesStore(s => s.isLoading ? s.isLoading : false);
  const folders = useFavoritesStore(s => s.folders);
  const selectedFolder = useFavoritesStore(s => s.selectedFolder);
  const showEmptyMsg = !isLoading && favorites.length === 0 && folders.length > 0 && selectedFolder;

  return (
    <section className="px-4" aria-labelledby="favorites-heading">
      <h2 id="favorites-heading" className="sr-only">Lista de favoritos</h2>
      {isLoading && (
        <p className="text-zinc-500 dark:text-zinc-400" role="status" aria-live="polite">
          Cargando favoritos...
        </p>
      )}
      {showEmptyMsg && (
        <p className="text-zinc-500 italic dark:text-zinc-400" role="note">
          No hay favoritos en esta carpeta
        </p>
      )}
      <AnimatePresence>
        {!isLoading && favorites.length > 0 && (
          <motion.nav
            aria-label="Favoritos guardados"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <SortableContext items={favorites.map(f => f.id)} strategy={verticalListSortingStrategy}>
              <motion.ul
                className="grid gap-4 sm:grid-cols-2 md:grid-cols-3"
                role="list"
              >
                {favorites.map((fav) => (
                  <DraggableFavorite key={fav.id} favorite={fav} />
                ))}
              </motion.ul>
            </SortableContext>
          </motion.nav>
        )}
      </AnimatePresence>
    </section>
  );
}
