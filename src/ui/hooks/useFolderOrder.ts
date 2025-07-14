// src/ui/hooks/useFolderOrder.ts

import { useEffect, useState } from "react";
import { getFolderOrder } from "@/core/favorites/useCases/getFolderOrder";
import { saveFolderOrder } from "@/core/favorites/useCases/saveFolderOrder";

export function useFolderOrder(allFolders: string[]) {
  const [orderedFolders, setOrderedFolders] = useState<string[]>([]);

  useEffect(() => {
    async function loadOrder() {
      const savedOrder = await getFolderOrder();

      const newFolders = allFolders.filter(f => !savedOrder.includes(f));
      setOrderedFolders([...savedOrder.filter(f => allFolders.includes(f)), ...newFolders]);
    }

    loadOrder();
  }, [allFolders]);

  const updateOrder = async (newOrder: string[]) => {
    setOrderedFolders(newOrder);
    await saveFolderOrder(newOrder);
  };

  return { orderedFolders, updateOrder };
}
