import { Routes, Route, Navigate, useSearchParams } from "react-router-dom";
import { useAuth } from "./hooks/useAuth";
import { AdminNavbar } from "./components/navbar/AdminNavbar";
import { BuddyNavbar } from "./components/navbar/BuddyNavbar";
import { ParticipantNavbar } from "./components/navbar/ParticipantNavbar";
import { LoginPage } from "./pages/LoginPage";
import { BuddyDashboard } from "./pages/BuddyDashboard";
import { ParticipantDashboard } from "./pages/ParticipantDashboard";
import { AdminDashboard } from "./pages/AdminDashboard";
import { Toaster } from "./components/ui/sonner";

type DashboardView = "admin" | "buddy" | "participant";

function resolveAdminDashboardView(rawView: string | null): DashboardView {
  if (rawView === "admin" || rawView === "buddy" || rawView === "participant") {
    return rawView;
  }
  return "admin";
}

function DashboardRouter() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const activeView: DashboardView =
    user.role === "admin" ? resolveAdminDashboardView(searchParams.get("view")) : user.role;

  return (
    <>
      {user.role === "admin" && <AdminNavbar />}
      {user.role === "buddy" && <BuddyNavbar />}
      {user.role === "participant" && <ParticipantNavbar />}
      <div className="max-w-6xl mx-auto px-3 sm:px-4 pb-12">
        {activeView === "buddy" && <BuddyDashboard />}
        {activeView === "participant" && <ParticipantDashboard />}
        {activeView === "admin" && <AdminDashboard />}
      </div>
    </>
  );
}

function App() {
  return (
    <>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/*" element={<DashboardRouter />} />
      </Routes>
      <Toaster position="top-right" richColors />
    </>
  );
}

export default App;
