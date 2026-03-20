import { CheckCircle } from "lucide-react";
import { Modal } from "../../../shared/components/Modal";
import type { Meeting } from "../../../types/Meeting";
import type { User } from "../../../types/User";

interface CompleteMeetingModalProps {
    meeting: Meeting;
    buddies: User[];
    participants: User[];
    onConfirm: () => void;
    onClose: () => void;
}

export function CompleteMeetingModal({ meeting, buddies, participants, onConfirm, onClose }: CompleteMeetingModalProps) {
    const buddy = buddies.find(b => b.id === meeting.buddyId);
    const partNames = meeting.participants.map(pid => participants.find(p => p.id === pid)?.name || "Unknown").join(", ");

    return (
        <Modal onClose={onClose}>
            <h3 className="flex items-center gap-2 text-lg font-semibold text-emerald-600 mb-2">
                <CheckCircle size={20} /> Mark Session Complete?
            </h3>
            <p className="text-sm text-slate-500 mb-2">Confirming this session will:</p>
            <ul className="list-disc pl-5 text-sm text-slate-500 mb-3 leading-loose">
                <li>Mark the meeting as <strong className="text-slate-700">Completed</strong></li>
                <li>Add <strong className="text-slate-700">+1 point</strong> to each participant's score</li>
                <li>Record a session log entry</li>
            </ul>
            <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 mb-5 text-sm flex flex-col gap-1">
                <div><span className="text-slate-500">Date:</span> <strong>{meeting.start.split(' ')[0]}</strong> at <strong>{meeting.start.split(' ')[1]}–{meeting.end.split(' ')[1]}</strong></div>
                <div><span className="text-slate-500">Buddy:</span> <strong>{buddy?.name}</strong></div>
                <div><span className="text-slate-500">Participant:</span> <strong>{partNames}</strong></div>
            </div>
            <div className="flex gap-3 justify-end">
                <button className="px-4 py-2 text-sm bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg cursor-pointer" onClick={onClose}>
                    Cancel
                </button>
                <button className="inline-flex items-center gap-2 px-4 py-2 text-sm bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg cursor-pointer" onClick={onConfirm}>
                    <CheckCircle size={14} /> Yes, Mark Complete
                </button>
            </div>
        </Modal>
    );
}
