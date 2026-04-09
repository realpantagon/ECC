import { AlertTriangle } from "lucide-react";
import { Modal } from "../../../shared/components/Modal";
import type { Availability } from "../../../types/Availability";

interface DeleteSlotModalProps {
    slot: Availability | null;
    onConfirm: () => void;
    onClose: () => void;
    isLoading?: boolean;
}

export function DeleteSlotModal({ slot, onConfirm, onClose, isLoading = false }: DeleteSlotModalProps) {
    return (
        <Modal onClose={onClose}>
            <div className="text-center">
                <div className="flex justify-center mb-3 text-red-500"><AlertTriangle size={44} /></div>
                <h2 className="text-lg font-semibold text-slate-800 mb-3">Delete Availability Slot?</h2>
                {slot && (
                    <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 mb-4 text-sm text-left flex flex-col gap-1">
                        <div>
                            <span className="text-slate-500">Date:</span>{" "}
                            <strong>
                                {new Date(slot.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' })}
                            </strong>
                        </div>
                        <div><span className="text-slate-500">Time:</span> <strong>{slot.start} – {slot.end}</strong></div>
                    </div>
                )}
                <p className="text-sm text-slate-500 mb-5">
                    Are you sure you want to delete this slot? This action cannot be undone.
                </p>
                <div className="flex gap-3 justify-center">
                    <button
                        className="px-4 py-2 text-sm bg-slate-100 hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed text-slate-700 rounded-lg transition-colors cursor-pointer"
                        onClick={onClose}
                        disabled={isLoading}
                    >
                        Cancel
                    </button>
                    <button
                        className="px-4 py-2 text-sm bg-red-600 hover:bg-red-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white rounded-lg transition-colors cursor-pointer"
                        onClick={onConfirm}
                        disabled={isLoading}
                    >
                        {isLoading ? "Deleting…" : "Delete Slot"}
                    </button>
                </div>
            </div>
        </Modal>
    );
}
