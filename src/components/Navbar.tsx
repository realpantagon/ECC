import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { LogOut, ChevronDown, LayoutDashboard } from "lucide-react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";

type DashboardView = "admin" | "buddy" | "participant";

function resolveAdminDashboardView(rawView: string | null): DashboardView {
    if (rawView === "admin" || rawView === "buddy" || rawView === "participant") {
        return rawView;
    }
    return "admin";
}

const roleBadgeClass: Record<string, string> = {
    admin: "bg-red-100 text-red-600 border-red-200",
    buddy: "bg-blue-100 text-blue-600 border-blue-200",
    participant: "bg-emerald-100 text-emerald-600 border-emerald-200",
};

const VIEW_LABELS: Record<DashboardView, string> = {
    admin: "Admin",
    buddy: "Buddy",
    participant: "Participant",
};

export function Navbar() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const [viewDropdownOpen, setViewDropdownOpen] = useState(false);

    const handleLogout = () => {
        if (user?.role === "buddy") {
            navigate("/login/buddy");
        } else {
            navigate("/");
        }
        logout();
    };

    const activeAdminView = resolveAdminDashboardView(searchParams.get("view"));

    const handleSelectAdminView = (view: DashboardView) => {
        const nextParams = new URLSearchParams(searchParams);
        nextParams.set("view", view);
        setSearchParams(nextParams);
        setViewDropdownOpen(false);
    };

    const navPillBtn = (active: boolean) =>
        `px-2.5 py-1 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
            active
                ? "bg-blue-600 text-white shadow-sm"
                : "text-blue-600 hover:bg-blue-50"
        }`;

    return (
        <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-blue-100 shadow-sm">
            <div className="max-w-6xl mx-auto px-3 sm:px-4 h-12 flex items-center justify-between gap-3">
                {/* Left: Logo + View Switcher */}
                <div className="flex items-center gap-2 min-w-0">
                    <div className="flex items-center gap-1.5 text-blue-600 font-bold text-sm shrink-0">
                        <img src="/ecc.png" alt="ATS ECC" className="w-6 h-6 object-contain rounded" />
                        <span className="hidden xs:inline">ATS ECC</span>
                    </div>

                    {user?.role === "admin" && (
                        <>
                            {/* Desktop: pill switcher */}
                            <div className="hidden sm:flex items-center gap-0.5 border border-blue-100 bg-blue-50/70 rounded-lg p-0.5 ml-1">
                                {(["admin", "buddy", "participant"] as DashboardView[]).map((v) => (
                                    <button
                                        key={v}
                                        type="button"
                                        onClick={() => handleSelectAdminView(v)}
                                        className={navPillBtn(activeAdminView === v)}
                                    >
                                        {VIEW_LABELS[v]}
                                    </button>
                                ))}
                            </div>

                            {/* Mobile: dropdown */}
                            <div className="relative sm:hidden ml-1">
                                <button
                                    type="button"
                                    onClick={() => setViewDropdownOpen((o) => !o)}
                                    className="flex items-center gap-1 px-2.5 py-1 border border-blue-200 bg-blue-50 rounded-lg text-xs font-semibold text-blue-600 cursor-pointer"
                                >
                                    <LayoutDashboard size={12} />
                                    {VIEW_LABELS[activeAdminView]}
                                    <ChevronDown size={12} className={`transition-transform ${viewDropdownOpen ? "rotate-180" : ""}`} />
                                </button>
                                {viewDropdownOpen && (
                                    <div className="absolute top-full left-0 mt-1 w-36 bg-white border border-blue-100 rounded-xl shadow-lg z-50 py-1 overflow-hidden">
                                        {(["admin", "buddy", "participant"] as DashboardView[]).map((v) => (
                                            <button
                                                key={v}
                                                type="button"
                                                onClick={() => handleSelectAdminView(v)}
                                                className={`w-full text-left px-3 py-2 text-sm transition-colors ${
                                                    activeAdminView === v
                                                        ? "bg-blue-600 text-white font-semibold"
                                                        : "text-slate-700 hover:bg-blue-50"
                                                }`}
                                            >
                                                {VIEW_LABELS[v]}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </div>

                {/* Right: User info + Logout */}
                {user && (
                    <div className="flex items-center gap-2 shrink-0">
                        <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-2 py-1 rounded-full">
                            <span className="font-medium text-xs sm:text-sm text-slate-700 max-w-[80px] sm:max-w-[140px] truncate">
                                {user.name}
                            </span>
                            <Badge className={`text-[0.6rem] sm:text-xs font-bold uppercase px-1.5 py-0.5 rounded-full border ${roleBadgeClass[user.role] ?? "bg-slate-100 text-slate-600 border-slate-200"}`}>
                                {user.role}
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
