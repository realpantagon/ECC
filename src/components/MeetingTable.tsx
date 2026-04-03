import type { Availability, SlotRequest } from "../types/Availability";
import type { User } from "../types/User";
import { Users as UsersIcon, Plus, X } from "lucide-react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";

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
            <Card className="bg-white/85 border-blue-100 shadow-md shadow-blue-100/30 py-6 text-center text-slate-500 text-sm rounded-xl">
                No pending meeting requests at the moment.
            </Card>
        );
    }

    return (
        <Card className="bg-white/85 border-blue-100 rounded-xl shadow-md shadow-blue-100/30 overflow-x-auto">
            <Table className="text-left text-sm">
                <TableHeader>
                    <TableRow>
                        {["Time Slot", "Buddy", "Participant", "Topic / Note", "Action"].map(h => (
                            <TableHead key={h} className="px-3 py-2 bg-blue-50/60 text-blue-600 font-semibold text-sm border-b border-blue-100">
                                {h}
                            </TableHead>
                        ))}
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {pendingRequests.map(req => {
                        const slot = slots.find(s => s.id === req.availabilityId)!;
                        const buddy = buddies.find(b => b.id === slot.buddyId);
                        const participant = participants.find(p => p.id === req.participantId);
                        const slotLabel = new Date(slot.date).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });

                        return (
                            <TableRow key={req.id} className="animate-fade-in border-b border-slate-100 last:border-0 hover:bg-blue-50/30">
                                <TableCell className="px-3 py-2 align-middle">
                                    <div className="flex flex-col gap-0.5">
                                        <span className="font-semibold text-slate-800">{slotLabel}</span>
                                        <span className="text-xs text-slate-500">{slot.start} - {slot.end}</span>
                                    </div>
                                </TableCell>
                                <TableCell className="px-3 py-2 align-middle font-medium text-slate-800">{buddy?.name || "Unknown"}</TableCell>
                                <TableCell className="px-3 py-2 align-middle">
                                    <div className="flex items-center gap-1.5 text-slate-600">
                                        <UsersIcon size={13} className="text-slate-400" />
                                        <span>{participant?.name || "Unknown"}</span>
                                    </div>
                                </TableCell>
                                <TableCell className="px-3 py-2 align-middle">
                                    <div className="text-sm text-slate-500 max-w-[180px] truncate" title={req.topic}>
                                        {req.topic ? `"${req.topic}"` : <span className="italic opacity-50">No note</span>}
                                    </div>
                                </TableCell>
                                <TableCell className="px-3 py-2 align-middle">
                                    <div className="flex items-center gap-2">
                                        <Button
                                            size="xs"
                                            className="bg-blue-600 hover:bg-blue-700 text-white"
                                            onClick={() => onCreateMeeting(slot.id, slot.buddyId, [req.participantId])}
                                        >
                                            <Plus size={12} /> Create Meeting
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="xs"
                                            className="bg-red-50 hover:bg-red-100 text-red-500 border-red-200"
                                            onClick={() => onCancelRequest(req.id)}
                                        >
                                            <X size={12} /> Cancel
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>
        </Card>
    );
}
