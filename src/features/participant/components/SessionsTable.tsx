import { useEffect, useMemo, useState } from "react";
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

const PAGE_SIZE = 5;

export function SessionsTable({ myMeetings, users, availabilities }: SessionsTableProps) {
    const [page, setPage] = useState(1);

    const totalPages = Math.max(1, Math.ceil(myMeetings.length / PAGE_SIZE));

    useEffect(() => {
        setPage((prev) => Math.min(prev, totalPages));
    }, [totalPages]);

    const paginatedMeetings = useMemo(() => {
        const start = (page - 1) * PAGE_SIZE;
        return myMeetings.slice(start, start + PAGE_SIZE);
    }, [myMeetings, page]);

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
                            {paginatedMeetings.map(m => {
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

                    {totalPages > 1 && (
                        <div className="flex items-center justify-between gap-2 px-3 py-2 border-t border-blue-100 bg-blue-50/40 text-xs">
                            <span className="text-slate-500">Page {page} of {totalPages}</span>
                            <div className="flex items-center gap-1">
                                <button
                                    type="button"
                                    onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                                    disabled={page === 1}
                                    className="px-2 py-1 rounded-md border border-blue-100 bg-white text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-blue-50"
                                >
                                    Prev
                                </button>

                                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNumber) => (
                                    <button
                                        key={pageNumber}
                                        type="button"
                                        onClick={() => setPage(pageNumber)}
                                        className={`w-7 h-7 rounded-md border text-xs font-semibold ${
                                            pageNumber === page
                                                ? "bg-blue-600 text-white border-blue-600"
                                                : "bg-white text-slate-600 border-blue-100 hover:bg-blue-50"
                                        }`}
                                    >
                                        {pageNumber}
                                    </button>
                                ))}

                                <button
                                    type="button"
                                    onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
                                    disabled={page === totalPages}
                                    className="px-2 py-1 rounded-md border border-blue-100 bg-white text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-blue-50"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
