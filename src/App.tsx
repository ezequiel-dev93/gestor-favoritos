import { AppLayout } from "@/ui/layouts/AppLayout";
import { FolderProvider } from "@/ui/features/FolderContext/FolderProvider";

export default function App() {
  return (
    <FolderProvider>
      <AppLayout />
    </FolderProvider>
  );
}
