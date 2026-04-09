import { Modal } from "../../../shared/components/Modal";
interface AddSlotConfirmModalProps {
    date: string;
    start: string;
    end: string;
    onConfirm: () => void;
    onClose: () => void;
    isLoading?: boolean;
}

export function AddSlotConfirmModal({ date, start, end, onConfirm, onClose, isLoading = false }: AddSlotConfirmModalProps) {
    const formattedDate = new Date(date).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });

    return (
        <Modal onClose={onClose}>
            <h2 className="text-lg font-semibold text-slate-800 mb-1">Confirm Add Slot</h2>
            <p className="text-sm text-slate-500 mb-4">Please confirm this availability slot before saving.</p>
            <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 mb-5 text-sm flex flex-col gap-1">
                <div><span className="text-slate-500">Date:</span> <strong>{formattedDate}</strong></div>
                <div><span className="text-slate-500">Time:</span> <strong>{start} – {end}</strong></div>
            </div>
            <div className="flex gap-3 justify-end">
                <button
                    className="px-4 py-2 text-sm bg-slate-100 hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed text-slate-700 rounded-lg transition-colors cursor-pointer"
                    onClick={onClose}
                    disabled={isLoading}
                >
                    Cancel
                </button>
                <button
                    className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white rounded-lg transition-colors cursor-pointer"
                    onClick={onConfirm}
                    disabled={isLoading}
                >
                    {isLoading ? "Adding…" : "Add Slot"}
                </button>
            </div>
        </Modal>
    );
}
