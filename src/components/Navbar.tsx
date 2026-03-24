import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { LogOut } from "lucide-react";

export function Navbar() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate("/");
    };

    const roleBadgeClass: Record<string, string> = {
        admin: "bg-red-100 text-red-600",
        buddy: "bg-blue-100 text-blue-600",
        participant: "bg-emerald-100 text-emerald-600",
    };

    return (
        <nav className="sticky top-2 z-50 mx-2 mb-2 rounded-xl bg-white/85 backdrop-blur-md border border-blue-100 shadow-md shadow-blue-100/30">
            <div className="max-w-6xl mx-auto px-3 h-9 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-blue-600 font-bold text-sm">
                    <img src="/ecc.png" alt="ATS ECC" className="w-5 h-5 object-contain rounded" />
                    <span>ATS ECC</span>
                </div>
                {user && (
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1.5 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-full">
                            <span className="font-medium text-sm text-slate-700">{user.name}</span>
                            <span className={`text-xs font-bold uppercase px-2 py-0.5 rounded ${roleBadgeClass[user.role] ?? "bg-slate-100 text-slate-600"}`}>
                                {user.role}
                            </span>
                        </div>
                        <button
                            onClick={handleLogout}
                            title="Logout"
                            className="p-1.5 rounded-full text-slate-500 hover:bg-blue-50 hover:text-blue-600 transition-colors cursor-pointer border border-transparent hover:border-blue-100"
                        >
                            <LogOut size={13} />
                        </button>
                    </div>
                )}
            </div>
        </nav>
    );
}
