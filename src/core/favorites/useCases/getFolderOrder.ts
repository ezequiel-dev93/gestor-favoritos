export async function getFolderOrder(): Promise<string[]> {
  const result = await chrome.storage.sync.get("folderOrder");
  return result.folderOrder || [];
}
