import { Routes, Route } from "react-router-dom";
import { ServiceDownPage } from "./pages/ServiceDownPage";
import { Toaster } from "./components/ui/sonner";
import { useTheme } from "./hooks/useTheme";

function App() {
  const { theme } = useTheme();

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors">
      <Routes>
        <Route path="/*" element={<ServiceDownPage />} />
      </Routes>
      <Toaster position="top-right" richColors theme={theme} />
    </div>
  );
}

export default App;
