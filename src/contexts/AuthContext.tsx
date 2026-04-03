import { useState, useEffect, createContext, type ReactNode } from "react";
import type { User, Role } from "../types/User";
import { supabase } from "../lib/supabase";

export interface AuthContextType {
    user: User | null;
    login: (empId: string, empCode: string, role: Role) => Promise<boolean>;
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

    const login = async (empId: string, empCode: string, role: Role) => {
        try {
            // Authenticate with employee credentials and expected role.
            const { data: existingUser, error: fetchError } = await supabase
                .from('users')
                .select('*')
                .eq('emp_id', empId)
                .eq('emp_code', empCode)
                .eq('role', role)
                .single();

            if (fetchError && fetchError.code !== 'PGRST116') {
                console.error("Error fetching user:", fetchError);
                throw fetchError;
            }

            if (existingUser) {
                setUser({
                    id: existingUser.id,
                    name: existingUser.name || existingUser.emp_id,
                    role: existingUser.role as Role
                });
                return true;
            }

            alert("Invalid employee ID, code, or role URL.");
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
