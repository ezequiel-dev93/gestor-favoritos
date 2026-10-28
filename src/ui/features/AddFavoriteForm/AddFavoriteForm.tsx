import { useState } from 'react';
import { useFavoritesStore } from '@/ui/hooks/useFavoritesStore';
import { ChromeStorageRepository } from '@/infrastructure/storage/ChromeStorageRepository';
import { addFavorite } from '@/core/favorites/useCases/addFavorite';
import { notifySuccess, notifyError } from '@/core/utils/notify';

interface AddFavoriteFormProps {
  url?: string;
  initialFolder?: string[] | null;
  onSave?: () => void;
}

export default function AddFavoriteForm({ 
  url: initialUrl = '', 
  initialFolder = null,
  onSave 
}: AddFavoriteFormProps) {
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState(initialUrl);
  const [isLoading, setIsLoading] = useState(false);
  
  const selectedFolder = useFavoritesStore(state => state.selectedFolder);
  const loadFavoritesByFolder = useFavoritesStore(state => state.loadFavoritesByFolder);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const folderPath = initialFolder || selectedFolder;
    
    if (!folderPath) {
      notifyError('Por favor, selecciona una carpeta primero');
      return;
    }

    if (!title.trim() || !url.trim()) {
      notifyError('Por favor, completa todos los campos');
      return;
    }

    try {
      setIsLoading(true);
      const repo = new ChromeStorageRepository();
      
      await addFavorite(
        {
          title: title.trim(),
          url: url.trim(),
          folder: folderPath.join('/'),
        },
        folderPath,
        repo
      );
      
      notifySuccess('Favorito agregado correctamente');
      setTitle('');
      setUrl(initialUrl);
      
      await loadFavoritesByFolder();
      
      onSave?.();
      
    } catch (error) {
      notifyError(error instanceof Error ? error.message : 'Error al agregar favorito');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3.5 pt-1">
      <div>
        <label htmlFor="title" className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
          Título
        </label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full px-3 py-2 text-sm rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-800/80 text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 transition-all"
          placeholder="Nombre del favorito"
          disabled={isLoading}
          autoFocus
        />
      </div>
      
      <div>
        <label htmlFor="url" className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
          URL
        </label>
        <input
          id="url"
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="w-full px-3 py-2 text-sm rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-800/80 text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 transition-all"
          placeholder="https://example.com"
          disabled={isLoading}
        />
      </div>
      
      <div className="pt-2">
        <button
          type="submit"
          disabled={isLoading || (!initialFolder && !selectedFolder)}
          className="w-full rounded-lg bg-gradient-to-r from-cyan-600 via-sky-600 to-blue-600 hover:brightness-110 px-4 py-2 text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 disabled:opacity-50 cursor-pointer transition-all shadow-sm"
        >
          {isLoading ? 'Agregando...' : 'Agregar Favorito'}
        </button>
      </div>
    </form>
  );
}
