import type { Meeting } from "../../../types/Meeting";
import type { User } from "../../../types/User";
import type { Availability } from "../../../types/Availability";
import { EmptyState } from "../../../shared/components/EmptyState";
import { SectionHeader } from "../../../shared/components/SectionHeader";

interface SessionsTableProps {
    myMeetings: Meeting[];
    users: User[];
    availabilities: Availability[];
}

export function SessionsTable({ myMeetings, users, availabilities }: SessionsTableProps) {
    return (
        <div>
            <SectionHeader title="Session Table of Contents" />
            {myMeetings.length === 0 ? (
                <EmptyState message="No sessions registered yet." />
            ) : (
                <div className="bg-white/85 flex flex-col items-stretch border border-blue-100 rounded-2xl shadow-md shadow-blue-100/30 overflow-x-auto">
                    <table className="w-full text-sm text-left border-collapse">
                        <thead>
                            <tr className="border-b border-blue-100">
                                {["Topic", "Date", "Buddy", "Participant"].map(h => (
                                    <th key={h} className="px-3 py-1.5 text-blue-600 font-semibold text-sm bg-blue-50/60">
                                        {h}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {myMeetings.map(m => {
                                const buddy = users.find(u => u.id === m.buddyId);
                                const parts = m.participants.map(pId => users.find(u => u.id === pId)?.name).join(", ");
                                const slot = availabilities.find(a => a.id === m.availabilityId);

                                return (
                                    <tr key={m.id} className="border-b border-slate-100 last:border-0 hover:bg-blue-50/20">
                                        <td className="px-3 py-1.5 max-w-[200px] truncate" title={m.topic}>
                                            {m.topic ? `"${m.topic}"` : 'No topic'}
                                        </td>
                                        <td className="px-3 py-1.5 text-slate-600 whitespace-nowrap">{slot?.date || 'Unknown'}</td>
                                        <td className="px-3 py-1.5 text-slate-600">{buddy?.name || 'Unassigned'}</td>
                                        <td className="px-3 py-1.5 text-slate-600">{parts}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
