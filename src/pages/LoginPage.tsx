import { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { UserCircle2, KeyRound, Eye, EyeOff } from "lucide-react";
import { resolveLoginRole, resolveLoginRoleFromRaw } from "../shared/utils/loginRoleResolver";

export function LoginPage() {
    const [empId, setEmpId] = useState("");
    const [empCode, setEmpCode] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();
    const { roleParam } = useParams();
    const [searchParams] = useSearchParams();
    const queryRole = resolveLoginRole(searchParams);
    const loginRole = roleParam ? resolveLoginRoleFromRaw(roleParam) : queryRole;

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (empId.trim() && empCode.trim()) {
            const isSuccess = await login(empId.trim(), empCode.trim(), loginRole);
            if (!isSuccess) {
                return;
            }
            navigate("/");
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 flex items-center justify-center p-6 font-[Inter,sans-serif]">
            <div className="w-full max-w-sm bg-white/90 backdrop-blur-md border border-blue-100 rounded-2xl shadow-xl shadow-blue-100/40 p-8 flex flex-col gap-6 animate-fade-in">
                {/* Header */}
                <div className="flex flex-col items-center gap-2 text-center">
                    <img src="/ecc.png" alt="ATS ECC" className="w-16 h-16 object-contain rounded-2xl mb-1" />
                    <h1 className="text-2xl font-bold text-slate-800 tracking-tight">ATS ECC</h1>
                    <p className="text-sm text-slate-500">ATS English Chit Chat - Schedule your sessions</p>
                    {/* <span className="mt-1 text-xs font-semibold uppercase tracking-wide text-blue-700 bg-blue-50 border border-blue-100 rounded-full px-3 py-1">
                        Login as {loginRole}
                    </span> */}
                </div>

                {/* Form */}
                <form onSubmit={handleLogin} className="flex flex-col gap-4">
                    {/* Employee ID */}
                    <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-medium text-slate-600">Username</label>
                        {/* <label className="text-sm font-medium text-slate-600">Employee ID (emp_id)</label> */}
                        <div className="relative flex items-center">
                            <UserCircle2 className="absolute left-3 text-slate-400 pointer-events-none" size={18} />
                            <input
                                type="text"
                                className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-lg text-slate-800 text-sm placeholder:text-slate-400 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition"
                                placeholder="Alex.A"
                                value={empId}
                                onChange={(e) => setEmpId(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    {/* Employee Code */}
                    <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-medium text-slate-600">Employee ID</label>
                        <div className="relative flex items-center">
                            <KeyRound className="absolute left-3 text-slate-400 pointer-events-none" size={16} />
                            <input
                                type={showPassword ? "text" : "password"}
                                className="w-full pl-10 pr-10 py-2.5 bg-white border border-slate-200 rounded-lg text-slate-800 text-sm placeholder:text-slate-400 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition"
                                placeholder="9876"
                                value={empCode}
                                onChange={(e) => setEmpCode(e.target.value)}
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword((v) => !v)}
                                aria-label={showPassword ? "Hide password" : "Show password"}
                                className="absolute right-3 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                            >
                                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="mt-2 w-full py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold rounded-lg text-sm transition-colors cursor-pointer"
                    >
                        Continue to Dashboard
                    </button>
                </form>
            </div>
        </div>
    );
}
