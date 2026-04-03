import { Routes, Route, Navigate, useSearchParams } from "react-router-dom";
import { useAuth } from "./hooks/useAuth";
import { Navbar } from "./components/Navbar";
import { LoginPage } from "./pages/LoginPage";
import { BuddyDashboard } from "./pages/BuddyDashboard";
import { ParticipantDashboard } from "./pages/ParticipantDashboard";
import { AdminDashboard } from "./pages/AdminDashboard";

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
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 pb-12">
        {activeView === "buddy" && <BuddyDashboard />}
        {activeView === "participant" && <ParticipantDashboard />}
        {activeView === "admin" && <AdminDashboard />}
      </div>
    </>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/login/:roleParam" element={<LoginPage />} />
      <Route path="/*" element={<DashboardRouter />} />
    </Routes>
  );
}

export default App;
