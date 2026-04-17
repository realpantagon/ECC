import { CalendarClock, MessageSquareText } from "lucide-react";
import { Modal } from "../../../shared/components/Modal";
import type { Availability } from "../../../types/Availability";

interface PendingSlotDetailModalProps {
    slot: Availability;
    requestTopic?: string;
    onClose: () => void;
}

export function PendingSlotDetailModal({ slot, requestTopic, onClose }: PendingSlotDetailModalProps) {
    return (
        <Modal onClose={onClose} maxWidth="max-w-lg">
            <h2 className="text-lg font-semibold text-slate-800 mb-1">My Pending Slot</h2>
            <p className="text-sm text-slate-500 mb-4">
                This request is waiting for admin confirmation.
            </p>

            <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-4 mb-4">
                <div className="flex items-center gap-2 text-amber-700 font-semibold text-sm mb-2">
                    <CalendarClock size={15} />
                    <span>{slot.date} | {slot.start} - {slot.end}</span>
                </div>
                <div className="inline-flex w-fit rounded-md border border-amber-300 bg-amber-100 px-2 py-1 text-[0.68rem] font-semibold uppercase tracking-wide text-amber-700">
                    Pending Admin
                </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-4 mb-4">
                <div className="flex items-center gap-2 text-slate-700 font-semibold text-sm mb-2">
                    <MessageSquareText size={15} className="text-slate-500" />
                    <span>Requested Topic</span>
                </div>
                <p className="text-sm text-slate-600 leading-relaxed">
                    {requestTopic?.trim() || "No topic submitted for this request."}
                </p>
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-100">
                <button
                    className="px-4 py-2 text-sm bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg cursor-pointer transition-colors"
                    onClick={onClose}
                >
                    Close
                </button>
            </div>
        </Modal>
    );
}
