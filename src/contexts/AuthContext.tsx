import { useState, useEffect, createContext, type ReactNode } from "react";
import type { User, Role } from "../types/User";
import { supabase } from "../lib/supabase";

export interface AuthContextType {
    user: User | null;
    login: (name: string, role: Role) => Promise<void>;
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

    const login = async (name: string, role: Role) => {
        try {
            // Find existing user
            const { data: existingUser, error: fetchError } = await supabase
                .from('users')
                .select('*')
                .ilike('name', name)
                .eq('role', role)
                .single();

            if (fetchError && fetchError.code !== 'PGRST116') {
                console.error("Error fetching user:", fetchError);
                throw fetchError;
            }

            if (existingUser) {
                setUser({
                    id: existingUser.id,
                    name: existingUser.name,
                    role: existingUser.role as Role
                });
                return;
            }

            // Create new user if not found
            const { data: newUser, error: insertError } = await supabase
                .from('users')
                .insert([{ name, role }])
                .select()
                .single();

            if (insertError) {
                console.error("Error creating user:", insertError);
                throw insertError;
            }

            if (newUser) {
                setUser({
                    id: newUser.id,
                    name: newUser.name,
                    role: newUser.role as Role
                });
            }
        } catch (error) {
            console.error("Login failed:", error);
            alert("Login failed. Please try again.");
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
