import type { Availability, SlotRequest } from "../types/Availability";
import type { User } from "../types/User";
import { Users as UsersIcon, Plus, X } from "lucide-react";
import "./MeetingTable.css";

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
            <div className="glass-panel empty-state">
                <p>No pending meeting requests at the moment.</p>
            </div>
        );
    }

    return (
        <div className="glass-panel table-container">
            <table className="meeting-table">
                <thead>
                    <tr>
                        <th>Time Slot</th>
                        <th>Buddy</th>
                        <th>Participant</th>
                        <th>Topic / Note</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {pendingRequests.map(req => {
                        const slot = slots.find(s => s.id === req.availabilityId)!;
                        const buddy = buddies.find(b => b.id === slot.buddyId);
                        const participant = participants.find(p => p.id === req.participantId);
                        const slotLabel = new Date(slot.date).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });

                        return (
                            <tr key={req.id} className="animate-fade-in">
                                <td>
                                    <div className="slot-time-col">
                                        <span className="slot-day">{slotLabel}</span>
                                        <span className="slot-hours">{slot.start} - {slot.end}</span>
                                    </div>
                                </td>
                                <td><span className="buddy-name">{buddy?.name || "Unknown"}</span></td>
                                <td>
                                    <div className="participants-col">
                                        <UsersIcon size={14} className="icon-subtle" />
                                        <span>{participant?.name || "Unknown"}</span>
                                    </div>
                                </td>
                                <td>
                                    <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={req.topic}>
                                        {req.topic ? `"${req.topic}"` : <span style={{ fontStyle: 'italic', opacity: 0.5 }}>No note</span>}
                                    </div>
                                </td>
                                <td>
                                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                        <button
                                            className="btn btn-primary btn-sm"
                                            onClick={() => onCreateMeeting(slot.id, slot.buddyId, [req.participantId])}
                                        >
                                            <Plus size={14} /> Create Meeting
                                        </button>
                                        <button
                                            className="btn btn-sm"
                                            style={{ background: 'rgba(239,68,68,0.1)', color: '#fca5a5', border: '1px solid rgba(239,68,68,0.3)' }}
                                            onClick={() => onCancelRequest(req.id)}
                                        >
                                            <X size={14} /> Cancel
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
