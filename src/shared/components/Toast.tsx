interface ToastProps {
    message: string;
    type: "success" | "info";
}

/**
 * Reusable toast notification — fixed top-right, auto-dismissed by the useToast hook.
 */
export function Toast({ message, type }: ToastProps) {
    return (
        <div
            className={`fixed top-5 right-5 z-[1200] max-w-sm w-full px-4 py-3 rounded-xl border font-semibold text-sm text-white shadow-xl animate-fade-in
                ${type === 'success' ? 'bg-emerald-600/95 border-emerald-500/30' : 'bg-blue-600/95 border-blue-500/30'}`}
            role="status"
            aria-live="polite"
        >
            {message}
        </div>
    );
}
