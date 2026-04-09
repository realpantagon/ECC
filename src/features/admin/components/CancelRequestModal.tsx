import { Modal } from "../../../shared/components/Modal";

interface CancelRequestTarget {
    id: string;
    participantName: string;
    slotDate: string;
}

interface CancelRequestModalProps {
    target: CancelRequestTarget;
    onConfirm: () => void;
    onClose: () => void;
    isLoading?: boolean;
}

export function CancelRequestModal({ target, onConfirm, onClose, isLoading = false }: CancelRequestModalProps) {
    return (
        <Modal onClose={onClose}>
            <h3 className="text-lg font-semibold text-red-500 mb-2">Cancel Meeting Request</h3>
            <p className="text-sm text-slate-500 mb-2 leading-relaxed">
                Cancel the request from <strong className="text-slate-700">{target.participantName}</strong> for:
            </p>
            <p className="bg-blue-50 border border-blue-100 px-3 py-2 rounded-lg mb-5 text-sm font-medium">
                {target.slotDate}
            </p>
            <p className="text-xs text-slate-400 mb-5">The slot will become available again.</p>
            <div className="flex gap-3 justify-end">
                <button className="px-4 py-2 text-sm bg-slate-100 hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed text-slate-700 rounded-lg cursor-pointer" onClick={onClose} disabled={isLoading}>
                    Keep Request
                </button>
                <button className="px-4 py-2 text-sm bg-red-600 hover:bg-red-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white rounded-lg cursor-pointer" onClick={onConfirm} disabled={isLoading}>
                    {isLoading ? "Canceling…" : "Yes, Cancel Request"}
                </button>
            </div>
        </Modal>
    );
}
