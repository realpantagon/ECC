import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./hooks/useAuth";
import { Navbar } from "./components/Navbar";
import { LoginPage } from "./pages/LoginPage";
import { BuddyDashboard } from "./pages/BuddyDashboard";
import { ParticipantDashboard } from "./pages/ParticipantDashboard";
import { AdminDashboard } from "./pages/AdminDashboard";

function DashboardRouter() {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <>
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 pb-12">
        {user.role === "buddy" && <BuddyDashboard />}
        {user.role === "participant" && <ParticipantDashboard />}
        {user.role === "admin" && <AdminDashboard />}
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
