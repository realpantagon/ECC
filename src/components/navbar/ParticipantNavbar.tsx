import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { LogOut } from "lucide-react";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";

export function ParticipantNavbar() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        navigate("/login");
        logout();
    };

    return (
        <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-emerald-100 shadow-sm">
            <div className="max-w-6xl mx-auto px-3 sm:px-4 h-12 flex items-center justify-between gap-3">
                {/* Left: Logo */}
                <div className="flex items-center gap-1.5 text-emerald-600 font-bold text-sm">
                    <img src="/ecc.png" alt="ATS ECC" className="w-6 h-6 object-contain rounded" />
                    <span className="hidden xs:inline">ATS ECC</span>
                    <span className="text-[0.6rem] font-semibold uppercase tracking-wide text-emerald-400 ml-1 hidden sm:inline">
                        Participant Portal
                    </span>
                </div>

                {/* Right: User info + Logout */}
                {user && (
                    <div className="flex items-center gap-2 shrink-0">
                        <div className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 px-2 py-1 rounded-full">
                            <span className="font-medium text-xs sm:text-sm text-slate-700 max-w-[80px] sm:max-w-[140px] truncate">
                                {user.name}
                            </span>
                            <Badge className="text-[0.6rem] sm:text-xs font-bold uppercase px-1.5 py-0.5 rounded-full border bg-emerald-100 text-emerald-600 border-emerald-200">
                                participant
                            </Badge>
                        </div>
                        <Button
                            onClick={handleLogout}
                            title="Logout"
                            variant="ghost"
                            size="icon-sm"
                            className="rounded-full text-slate-500 hover:bg-red-50 hover:text-red-500 transition-colors cursor-pointer border border-transparent hover:border-red-100"
                        >
                            <LogOut size={14} />
                        </Button>
                    </div>
                )}
            </div>
        </nav>
    );
}
