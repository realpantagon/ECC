import { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { UserCircle2, KeyRound, Eye, EyeOff } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { ThemeToggle } from "../components/ThemeToggle";

export function LoginPage() {
    const [username, setUsername] = useState("");
    const [empCode, setEmpCode] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!username.trim() || !empCode.trim()) return;
        setIsLoading(true);
        try {
            const isSuccess = await login(username.trim(), empCode.trim());
            if (isSuccess) {
                navigate("/");
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="relative min-h-screen bg-gradient-to-br from-blue-50 via-background to-indigo-50 flex items-center justify-center p-4 transition-colors">
            <div className="absolute right-4 top-4">
                <ThemeToggle />
            </div>
            <div className="w-full max-w-sm">
                <div className="bg-white border border-slate-200 rounded-2xl shadow-xl shadow-slate-200/60 p-8 flex flex-col gap-6">
                    {/* Header */}
                    <div className="flex flex-col items-center gap-3 text-center">
                        <div className="p-3 bg-blue-50 rounded-2xl border border-blue-100">
                            <img src="/ecc.png" alt="ATS ECC" className="w-12 h-12 object-contain" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">ATS ECC</h1>
                            <p className="text-sm text-slate-500 mt-0.5">English Chit Chat — Schedule your sessions</p>
                        </div>
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
                            className="mt-1 w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold h-9 cursor-pointer"
                        >
                            {isLoading ? "Signing in…" : "Sign In"}
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
