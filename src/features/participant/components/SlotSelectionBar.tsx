import { X } from "lucide-react";

interface SlotSelectionBarProps {
    selectedCount: number;
    onReviewClick: () => void;
    onClear: () => void;
}

export function SlotSelectionBar({ selectedCount, onReviewClick, onClear }: SlotSelectionBarProps) {
    if (selectedCount === 0) return null;

    return (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-white/95 border border-blue-200 rounded-full px-6 py-3 shadow-2xl flex items-center gap-4 backdrop-blur-md animate-fade-in">
            <span className="font-semibold text-slate-800 text-sm">{selectedCount} slot(s) selected</span>
            <button
                className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-full transition-colors cursor-pointer"
                onClick={onReviewClick}
            >
                Review & Confirm
            </button>
            <button
                className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                onClick={onClear}
            >
                <X size={16} />
            </button>
        </div>
    );
}
