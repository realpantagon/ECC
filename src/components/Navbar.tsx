import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { LogOut } from "lucide-react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";

type DashboardView = "admin" | "buddy" | "participant";

function resolveAdminDashboardView(rawView: string | null): DashboardView {
    if (rawView === "admin" || rawView === "buddy" || rawView === "participant") {
        return rawView;
    }

    return "admin";
}

export function Navbar() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();

    const handleLogout = () => {
        logout();
        navigate("/");
    };

    const roleBadgeClass: Record<string, string> = {
        admin: "bg-red-100 text-red-600",
        buddy: "bg-blue-100 text-blue-600",
        participant: "bg-emerald-100 text-emerald-600",
    };

    const activeAdminView = resolveAdminDashboardView(searchParams.get("view"));

    const handleSelectAdminView = (view: DashboardView) => {
        const nextParams = new URLSearchParams(searchParams);
        nextParams.set("view", view);
        setSearchParams(nextParams);
    };

    const navBtn = (active: boolean) =>
        `px-2 py-0.5 rounded-md text-[0.65rem] font-semibold transition-colors ${
            active
                ? "bg-blue-600 text-white"
                : "text-blue-600 hover:bg-blue-50"
        }`;

    return (
        <nav className="sticky top-2 z-50 mx-2 mb-2 rounded-xl bg-white/85 backdrop-blur-md border border-blue-100 shadow-md shadow-blue-100/30">
            <div className="max-w-6xl mx-auto px-3 h-9 flex items-center justify-between">
                <div className="flex items-center gap-3 text-blue-600 font-bold text-sm">
                    <div className="flex items-center gap-1.5">
                    <img src="/ecc.png" alt="ATS ECC" className="w-5 h-5 object-contain rounded" />
                    <span>ATS ECC</span>
                    </div>

                    {user?.role === "admin" && (
                        <div className="flex items-center gap-1 border border-blue-100 bg-blue-50/70 rounded-lg p-0.5">
                            <Button
                                type="button"
                                variant="ghost"
                                size="xs"
                                onClick={() => handleSelectAdminView("admin")}
                                className={navBtn(activeAdminView === "admin")}
                            >
                                Admin
                            </Button>
                            <Button
                                type="button"
                                variant="ghost"
                                size="xs"
                                onClick={() => handleSelectAdminView("buddy")}
                                className={navBtn(activeAdminView === "buddy")}
                            >
                                Buddy
                            </Button>
                            <Button
                                type="button"
                                variant="ghost"
                                size="xs"
                                onClick={() => handleSelectAdminView("participant")}
                                className={navBtn(activeAdminView === "participant")}
                            >
                                Participant
                            </Button>
                        </div>
                    )}
                </div>
                {user && (
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1.5 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-full">
                            <span className="font-medium text-sm text-slate-700">{user.name}</span>
                            <Badge className={`text-xs font-bold uppercase px-2 py-0.5 rounded ${roleBadgeClass[user.role] ?? "bg-slate-100 text-slate-600"}`}>
                                {user.role}
                            </Badge>
                        </div>
                        <Button
                            onClick={handleLogout}
                            title="Logout"
                            variant="ghost"
                            size="icon-sm"
                            className="rounded-full text-slate-500 hover:bg-blue-50 hover:text-blue-600 transition-colors cursor-pointer border border-transparent hover:border-blue-100"
                        >
                            <LogOut size={13} />
                        </Button>
                    </div>
                )}
            </div>
        </nav>
    );
}
