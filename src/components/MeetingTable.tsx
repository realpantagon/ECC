import type { Availability, SlotRequest } from "../types/Availability";
import type { User } from "../types/User";
import { Users as UsersIcon, Plus, X } from "lucide-react";

interface MeetingTableProps {
    slots: Availability[];
    buddies: User[];
    participants: User[];
    requests: SlotRequest[];
    onCreateMeeting: (availabilityId: string, buddyId: string, partIds: string[]) => void;
    onCancelRequest: (requestId: string) => void;
}

export function MeetingTable({ slots, buddies, participants, requests, onCreateMeeting, onCancelRequest }: MeetingTableProps) {
    const pendingRequests = requests.filter(r => {
        const slot = slots.find(s => s.id === r.availabilityId);
        return slot && !slot.booked;
    });

    if (pendingRequests.length === 0) {
        return (
            <div className="bg-white/85 border border-blue-100 rounded-xl shadow-md shadow-blue-100/30 py-6 text-center text-slate-500 text-sm">
                No pending meeting requests at the moment.
            </div>
        );
    }

    return (
        <div className="bg-white/85 border border-blue-100 rounded-xl shadow-md shadow-blue-100/30 overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
                <thead>
                    <tr>
                        {["Time Slot", "Buddy", "Participant", "Topic / Note", "Action"].map(h => (
                            <th key={h} className="px-3 py-2 bg-blue-50/60 text-blue-600 font-semibold text-sm border-b border-blue-100">
                                {h}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {pendingRequests.map(req => {
                        const slot = slots.find(s => s.id === req.availabilityId)!;
                        const buddy = buddies.find(b => b.id === slot.buddyId);
                        const participant = participants.find(p => p.id === req.participantId);
                        const slotLabel = new Date(slot.date).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });

                        return (
                            <tr key={req.id} className="animate-fade-in border-b border-slate-100 last:border-0 hover:bg-blue-50/30">
                                <td className="px-3 py-2 align-middle">
                                    <div className="flex flex-col gap-0.5">
                                        <span className="font-semibold text-slate-800">{slotLabel}</span>
                                        <span className="text-xs text-slate-500">{slot.start} - {slot.end}</span>
                                    </div>
                                </td>
                                <td className="px-3 py-2 align-middle font-medium text-slate-800">{buddy?.name || "Unknown"}</td>
                                <td className="px-3 py-2 align-middle">
                                    <div className="flex items-center gap-1.5 text-slate-600">
                                        <UsersIcon size={13} className="text-slate-400" />
                                        <span>{participant?.name || "Unknown"}</span>
                                    </div>
                                </td>
                                <td className="px-3 py-2 align-middle">
                                    <div className="text-sm text-slate-500 max-w-[180px] truncate" title={req.topic}>
                                        {req.topic ? `"${req.topic}"` : <span className="italic opacity-50">No note</span>}
                                    </div>
                                </td>
                                <td className="px-3 py-2 align-middle">
                                    <div className="flex items-center gap-2">
                                        <button
                                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg transition-colors cursor-pointer"
                                            onClick={() => onCreateMeeting(slot.id, slot.buddyId, [req.participantId])}
                                        >
                                            <Plus size={12} /> Create Meeting
                                        </button>
                                        <button
                                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-500 border border-red-200 text-xs font-medium rounded-lg transition-colors cursor-pointer"
                                            onClick={() => onCancelRequest(req.id)}
                                        >
                                            <X size={12} /> Cancel
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}
