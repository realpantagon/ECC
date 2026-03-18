import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { LogOut } from "lucide-react";
import "./Navbar.css";

export function Navbar() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate("/");
    };

    return (
        <nav className="navbar glass-panel">
            <div className="container flex-between navbar-inner">
                <div className="navbar-brand">
                    <img src="/ecc.png" alt="ATS ECC" className="brand-logo" />
                    <span>ATS ECC</span>
                </div>
                {user && (
                    <div className="navbar-actions">
                        <div className="user-badge">
                            <span className="user-name">{user.name}</span>
                            <span className={`role-badge role-${user.role}`}>{user.role}</span>
                        </div>
                        <button onClick={handleLogout} className="btn btn-secondary icon-btn" title="Logout">
                            <LogOut size={16} />
                        </button>
                    </div>
                )}
            </div>
        </nav>
    );
}
