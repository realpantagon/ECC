import type { ReactNode } from "react";
import { X } from "lucide-react";

interface ModalProps {
    children: ReactNode;
    onClose: () => void;
    maxWidth?: string;
}

/**
 * Reusable modal overlay with backdrop dismiss, close button, and fade-in animation.
 */
export function Modal({ children, onClose, maxWidth = "max-w-md" }: ModalProps) {
    return (
        <div
            className="fixed inset-0 bg-black/55 flex items-center justify-center z-50 p-4"
            onClick={onClose}
        >
            <div
                className={`relative bg-white/95 backdrop-blur-md border border-blue-100 rounded-xl shadow-2xl w-full ${maxWidth} p-4 animate-fade-in`}
                onClick={e => e.stopPropagation()}
            >
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 cursor-pointer transition-colors"
                    aria-label="Close modal"
                >
                    <X size={20} />
                </button>
                {children}
            </div>
        </div>
    );
}
