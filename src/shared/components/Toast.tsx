import { useEffect } from "react";
import { toast } from "sonner";

interface ToastProps {
    message: string;
    type: "success" | "info" | "error";
}

/**
 * Reusable toast notification — fixed top-right, auto-dismissed by the useToast hook.
 */
export function Toast({ message, type }: ToastProps) {
    useEffect(() => {
        if (type === "success") {
            toast.success(message);
            return;
        }

        if (type === "error") {
            toast.error(message);
            return;
        }

        toast.info(message);
    }, [message, type]);

    return null;
}
