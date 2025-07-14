import { Route, Routes } from "react-router-dom";
import { AppLayout } from "@/ui/layouts/AppLayout";
import { FavoriteManager } from "@/pages/FavoriteManager";

export default function App() {
  return (
    <AppLayout>
      <Routes>
        <Route path="/" element={<FavoriteManager />} />
      </Routes>
    </AppLayout>
  );
}
