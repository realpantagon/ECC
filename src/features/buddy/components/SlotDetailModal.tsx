import { Trash2 } from "lucide-react";
import { Modal } from "../../../shared/components/Modal";
import type { Availability } from "../../../types/Availability";

interface SlotDetailModalProps {
    slot: Availability;
    matchedParticipantName?: string;
    meetingTopic?: string;
    onClose: () => void;
    onDeleteRequest?: () => void;
}

export function SlotDetailModal({ slot, matchedParticipantName, meetingTopic, onClose, onDeleteRequest }: SlotDetailModalProps) {
    const formattedDate = new Date(slot.date).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });

    return (
        <Modal onClose={onClose}>
            <h2 className="text-lg font-semibold text-slate-800 mb-1">Slot Detail</h2>
            <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 mb-5 mt-3 text-sm flex flex-col gap-1">
                <div><span className="text-slate-500">Date:</span> <strong>{formattedDate}</strong></div>
                <div><span className="text-slate-500">Time:</span> <strong>{slot.start} – {slot.end}</strong></div>
                <div>
                    <span className="text-slate-500">Status:</span>{' '}
                    <strong className={slot.booked ? "text-purple-600" : "text-emerald-600"}>
                        {slot.booked ? 'Booked' : 'Available'}
                    </strong>
                </div>
                {slot.booked && matchedParticipantName && (
                    <div className="mt-2 pt-2 border-t border-blue-200">
                        <div className="mb-1"><span className="text-slate-500">Participant:</span> <strong className="text-slate-700">{matchedParticipantName}</strong></div>
                        <div><span className="text-slate-500">Topic:</span> <strong className="text-slate-700">{meetingTopic || 'No topic provided'}</strong></div>
                    </div>
                )}
            </div>
            <div className="flex gap-3 justify-end">
                <button
                    className="px-4 py-2 text-sm bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors cursor-pointer"
                    onClick={onClose}
                >
                    Close
                </button>
                {!slot.booked && onDeleteRequest && (
                    <button
                        className="inline-flex items-center gap-1.5 px-4 py-2 text-sm bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-lg transition-colors cursor-pointer"
                        onClick={onDeleteRequest}
                    >
                        <Trash2 size={14} /> Remove Slot
                    </button>
                )}
            </div>
        </Modal>
    );
}
