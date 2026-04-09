import { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { UserCircle2, KeyRound, Eye, EyeOff } from "lucide-react";
import { resolveLoginRole, resolveLoginRoleFromRaw } from "../shared/utils/loginRoleResolver";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import type { Role } from "../types/User";

const SELECTABLE_ROLES: { value: Role; label: string }[] = [
    { value: "participant", label: "Participant" },
    { value: "buddy", label: "Buddy" },
];

const roleStyle: Record<string, { accent: string; badge: string; bg: string }> = {
    participant: {
        accent: "bg-emerald-600 hover:bg-emerald-700",
        badge: "bg-emerald-50 text-emerald-600 border-emerald-200",
        bg: "from-emerald-50 via-white to-emerald-50/40",
    },
    buddy: {
        accent: "bg-blue-600 hover:bg-blue-700",
        badge: "bg-blue-50 text-blue-600 border-blue-200",
        bg: "from-blue-50 via-white to-blue-50/40",
    },
};

// For admin/param-based login — no slider shown
const ADMIN_ROLES = new Set<Role>(["admin"]);

export function LoginPage() {
    const { roleParam } = useParams();
    const [searchParams] = useSearchParams();
    const queryRole = resolveLoginRole(searchParams);
    const paramRole = roleParam ? resolveLoginRoleFromRaw(roleParam) : null;

    // If role comes from URL param (admin, etc.) lock it; otherwise show slider
    const lockedRole = paramRole ?? (ADMIN_ROLES.has(queryRole) ? queryRole : null);

    const [selectedRole, setSelectedRole] = useState<Role>(
        lockedRole ?? queryRole ?? "participant"
    );
    const [username, setUsername] = useState("");
    const [empCode, setEmpCode] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const { login } = useAuth();
    const navigate = useNavigate();

    const loginRole = lockedRole ?? selectedRole;
    const style = roleStyle[loginRole] ?? roleStyle.participant;
    const showSlider = !lockedRole;

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!username.trim() || !empCode.trim()) return;
        setIsLoading(true);
        try {
            const isSuccess = await login(username.trim(), empCode.trim(), loginRole);
            if (isSuccess) navigate("/");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={`min-h-screen bg-gradient-to-br ${style.bg} flex items-center justify-center p-4 transition-colors duration-300`}>
            <div className="w-full max-w-sm">
                <div className="bg-white border border-slate-200 rounded-2xl shadow-xl shadow-slate-200/60 p-8 flex flex-col gap-6">
                    {/* Header */}
                    <div className="flex flex-col items-center gap-3 text-center">
                        <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                            <img src="/ecc.png" alt="ATS ECC" className="w-12 h-12 object-contain" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">ATS ECC</h1>
                            <p className="text-sm text-slate-500 mt-0.5">English Chit Chat — Schedule your sessions</p>
                        </div>

                        {/* Role slider — only shown when not locked by URL param */}
                        {showSlider && (
                            <div className="w-full mt-1">
                                <div className="relative flex bg-slate-100 rounded-xl p-1 gap-1">
                                    {/* Sliding indicator */}
                                    <div
                                        className={`absolute top-1 bottom-1 w-[calc(50%-4px)] rounded-lg transition-all duration-200 ${
                                            selectedRole === "participant"
                                                ? "left-1 bg-emerald-500"
                                                : "left-[calc(50%+2px)] bg-blue-500"
                                        }`}
                                    />
                                    {SELECTABLE_ROLES.map(({ value, label }) => (
                                        <button
                                            key={value}
                                            type="button"
                                            onClick={() => setSelectedRole(value)}
                                            className={`relative z-10 flex-1 py-1.5 text-xs font-semibold rounded-lg transition-colors duration-200 cursor-pointer ${
                                                selectedRole === value
                                                    ? "text-white"
                                                    : "text-slate-500 hover:text-slate-700"
                                            }`}
                                        >
                                            {label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Locked role badge (admin / param-based) */}
                        {lockedRole && (
                            <span className={`text-xs font-semibold uppercase tracking-wide border rounded-full px-3 py-1 ${style.badge}`}>
                                {lockedRole} Portal
                            </span>
                        )}
                    </div>

                    {/* Form */}
                    <form onSubmit={handleLogin} className="flex flex-col gap-4">
                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-medium text-slate-700">Username</label>
                            <div className="relative flex items-center">
                                <UserCircle2 className="absolute left-3 text-slate-400 pointer-events-none z-10" size={16} />
                                <Input
                                    type="text"
                                    className="pl-9 bg-white"
                                    placeholder="Alex.A"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    required
                                    autoComplete="username"
                                />
                            </div>
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-medium text-slate-700">Employee Code</label>
                            <div className="relative flex items-center">
                                <KeyRound className="absolute left-3 text-slate-400 pointer-events-none z-10" size={15} />
                                <Input
                                    type={showPassword ? "text" : "password"}
                                    className="pl-9 pr-10 bg-white"
                                    placeholder="Enter your employee code"
                                    value={empCode}
                                    onChange={(e) => setEmpCode(e.target.value)}
                                    required
                                    autoComplete="current-password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword((v) => !v)}
                                    aria-label={showPassword ? "Hide code" : "Show code"}
                                    className="absolute right-3 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                                >
                                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                                </button>
                            </div>
                        </div>

                        <Button
                            type="submit"
                            disabled={isLoading || !username.trim() || !empCode.trim()}
                            className={`mt-1 w-full text-white font-semibold h-9 cursor-pointer transition-colors duration-200 ${style.accent}`}
                        >
                            {isLoading ? "Signing in…" : "Continue to Dashboard"}
                        </Button>
                    </form>
                </div>

                <p className="text-center text-xs text-slate-400 mt-4">
                    ATS English Chit Chat Program
                </p>
            </div>
        </div>
    );
}
