export async function saveFolderOrder(order: string[]): Promise<void> {
  await chrome.storage.sync.set({ folderOrder: order });
}
