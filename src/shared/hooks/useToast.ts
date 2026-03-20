import { useEffect, useState } from "react";

export type ToastType = "success" | "info";

export interface ToastState {
    message: string;
    type: ToastType;
}

/**
 * Shared toast hook — manages toast visibility and auto-clears after `duration` ms.
 * Usage: const { toast, showToast } = useToast();
 */
export function useToast(duration = 2600) {
    const [toast, setToast] = useState<ToastState | null>(null);

    useEffect(() => {
        if (!toast) return;
        const timeout = setTimeout(() => setToast(null), duration);
        return () => clearTimeout(timeout);
    }, [toast, duration]);

    const showToast = (message: string, type: ToastType = "success") => {
        setToast({ message, type });
    };

    return { toast, showToast };
}
