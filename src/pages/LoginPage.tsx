import { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import type { Role } from "../types/User";
import { useNavigate } from "react-router-dom";
import { UserCircle2 } from "lucide-react";
import "./LoginPage.css";

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
        <div className="login-page flex-center">
            <div className="login-card glass-panel animate-fade-in">
                <div className="login-header flex-center">
                    <img src="/ecc.png" alt="ATS ECC" className="brand-logo-large" />
                    <h1>ATS ECC</h1>

                    <p>ATS English Chit Chat — Schedule your sessions</p>
                </div>

                <form onSubmit={handleLogin} className="login-form">
                    <div className="form-group">
                        <label>Your Name</label>
                        <div className="input-wrapper">
                            <UserCircle2 className="input-icon" size={18} />
                            <input
                                type="text"
                                className="input with-icon"
                                placeholder="Enter your name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Select Role</label>
                        <select
                            className="input select"
                            value={role}
                            onChange={(e) => setRole(e.target.value as Role)}
                        >
                            <option value="participant">Participant</option>
                            <option value="buddy">Buddy</option>
                            <option value="admin">Admin</option>
                        </select>
                    </div>

                    <button type="submit" className="btn btn-primary w-full login-btn">
                        Continue to Dashboard
                    </button>
                </form>
            </div>
        </div>
    );
}
