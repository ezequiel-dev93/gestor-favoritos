import { FolderSelector } from "@/ui/features/FolderSelector/FolderSelector";
import { FavoriteDndContext } from "@/ui/features/FavoriteDndContext/FavoriteDndContext";
import { FavoriteList } from "@/ui/features/FavoritesList/FavoritesList";

export function FavoriteManager() {
  return (
    <section className="flex h-full">
      <aside className="w-64 border-r dark:border-zinc-700 bg-white dark:bg-zinc-900">
        <FolderSelector />
      </aside>

      <section className="flex-1 overflow-y-auto p-4 bg-zinc-50 dark:bg-zinc-800">
        <FavoriteDndContext>
          <FavoriteList />
        </FavoriteDndContext>
      </section>
    </section>
  );
}
