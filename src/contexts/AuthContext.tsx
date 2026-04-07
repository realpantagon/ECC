import { useState, useEffect, createContext, type ReactNode } from "react";
import type { User, Role } from "../types/User";
import { api, unwrapJson } from "../lib/api-client";

export interface AuthContextType {
    user: User | null;
    login: (username: string, empCode: string, role: Role) => Promise<boolean>;
    logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(() => {
        const saved = localStorage.getItem("auth_user");
        return saved ? JSON.parse(saved) : null;
    });

    useEffect(() => {
        if (user) {
            localStorage.setItem("auth_user", JSON.stringify(user));
        } else {
            localStorage.removeItem("auth_user");
        }
    }, [user]);

    const login = async (username: string, empCode: string, role: Role) => {
        try {
            const response = await api['api/auth/login'].$post({
                json: { username, empCode, role },
            });

            const payload = await unwrapJson<{
                ok: boolean;
                user?: User;
            }>(response);

            if (payload.ok && payload.user) {
                setUser(payload.user);
                return true;
            }

            alert("Invalid username, code, or role URL.");
            return false;
        } catch (error) {
            console.error("Login failed:", error);
            alert("Login failed. Please try again.");
            return false;
        }
    };

    const logout = () => {
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}
