import type { ReactNode } from "react";
import { Dialog, DialogContent, DialogTitle } from "../../components/ui/dialog";

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
        <Dialog open onOpenChange={(open) => !open && onClose()}>
            <DialogContent className={`bg-white/95 backdrop-blur-md border border-blue-100 shadow-2xl ${maxWidth} p-4 animate-fade-in`}>
                <DialogTitle className="sr-only">Dialog</DialogTitle>
                {children}
            </DialogContent>
        </Dialog>
    );
}
