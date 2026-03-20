import { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import type { Role } from "../types/User";
import { useNavigate } from "react-router-dom";
import { UserCircle2, ChevronDown } from "lucide-react";

export function LoginPage() {
    const [name, setName] = useState("");
    const [role, setRole] = useState<Role>("participant");
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (name.trim()) {
            await login(name.trim(), role);
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
                    <p className="text-sm text-slate-500">ATS English Chit Chat — Schedule your sessions</p>
                </div>

                {/* Form */}
                <form onSubmit={handleLogin} className="flex flex-col gap-4">
                    {/* Name */}
                    <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-medium text-slate-600">Your Name</label>
                        <div className="relative flex items-center">
                            <UserCircle2 className="absolute left-3 text-slate-400 pointer-events-none" size={18} />
                            <input
                                type="text"
                                className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-lg text-slate-800 text-sm placeholder:text-slate-400 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition"
                                placeholder="Enter your name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    {/* Role */}
                    <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-medium text-slate-600">Select Role</label>
                        <div className="relative flex items-center">
                            <select
                                className="w-full appearance-none px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-slate-800 text-sm focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition cursor-pointer pr-9"
                                value={role}
                                onChange={(e) => setRole(e.target.value as Role)}
                            >
                                <option value="participant">Participant</option>
                                <option value="buddy">Buddy</option>
                                <option value="admin">Admin</option>
                            </select>
                            <ChevronDown className="absolute right-3 text-slate-400 pointer-events-none" size={16} />
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
