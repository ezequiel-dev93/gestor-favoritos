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
    <form onSubmit={handleSubmit} className="space-y-4 p-4">
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Título
        </label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-purple-500 focus:outline-none focus:ring-purple-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
          placeholder="Nombre del favorito"
          disabled={isLoading}
        />
      </div>
      
      <div>
        <label htmlFor="url" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          URL
        </label>
        <input
          id="url"
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-purple-500 focus:outline-none focus:ring-purple-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
          placeholder="https://example.com"
          disabled={isLoading}
        />
      </div>
      
      <button
        type="submit"
        disabled={isLoading || (!initialFolder && !selectedFolder)}
        className="w-full rounded-md bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 dark:bg-purple-500 dark:hover:bg-purple-600"
      >
        {isLoading ? 'Agregando...' : 'Agregar Favorito'}
      </button>
    </form>
  );
}