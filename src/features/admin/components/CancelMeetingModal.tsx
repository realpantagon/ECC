import { Modal } from "../../../shared/components/Modal";
import type { Meeting } from "../../../types/Meeting";
import type { User } from "../../../types/User";

interface CancelMeetingModalProps {
    meeting: Meeting;
    buddies: User[];
    participants: User[];
    onConfirm: () => void;
    onClose: () => void;
}

export function CancelMeetingModal({ meeting, buddies, participants, onConfirm, onClose }: CancelMeetingModalProps) {
    const buddy = buddies.find(b => b.id === meeting.buddyId);
    const partNames = meeting.participants.map(pid => participants.find(p => p.id === pid)?.name || "Unknown").join(", ");

    return (
        <Modal onClose={onClose}>
            <h3 className="text-lg font-semibold text-red-500 mb-2">Cancel Scheduled Meeting</h3>
            <p className="text-sm text-slate-500 mb-3">Are you sure you want to cancel this meeting?</p>
            <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 mb-5 text-sm flex flex-col gap-1">
                <div><span className="text-slate-500">Date:</span> <strong>{meeting.start.split(' ')[0]}</strong> at <strong>{meeting.start.split(' ')[1]}–{meeting.end.split(' ')[1]}</strong></div>
                <div><span className="text-slate-500">Buddy:</span> <strong>{buddy?.name}</strong></div>
                <div><span className="text-slate-500">Participant:</span> <strong>{partNames}</strong></div>
            </div>
            <div className="flex gap-3 justify-end">
                <button className="px-4 py-2 text-sm bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg cursor-pointer" onClick={onClose}>
                    Keep Meeting
                </button>
                <button className="px-4 py-2 text-sm bg-red-600 hover:bg-red-700 text-white rounded-lg cursor-pointer" onClick={onConfirm}>
                    Yes, Cancel Meeting
                </button>
            </div>
        </Modal>
    );
}
