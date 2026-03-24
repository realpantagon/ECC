import { CheckCircle } from "lucide-react";
import type { Meeting } from "../../../types/Meeting";
import type { User } from "../../../types/User";

interface SessionReportTableProps {
    meetings: Meeting[];
    buddies: User[];
    participants: User[];
    hasFilters: boolean;
    onComplete: (meeting: Meeting) => void;
    onCancel: (meeting: Meeting) => void;
}

export function SessionReportTable({
    meetings,
    buddies,
    participants,
    hasFilters,
    onComplete,
    onCancel,
}: SessionReportTableProps) {
    if (meetings.length === 0) {
        return (
            <div className="bg-white/85 border border-blue-100 rounded-xl shadow-md py-6 text-center text-slate-400 text-sm">
                {hasFilters ? 'No meetings match the selected filters.' : 'No meetings have been scheduled yet.'}
            </div>
        );
    }

    return (
        <div className="bg-white/85 border border-blue-100 rounded-xl shadow-md overflow-x-auto">
            <table className="w-full text-sm text-left border-collapse">
                <thead>
                    <tr>
                        {["Date & Time", "Buddy", "Participant", "Topic / Note", "Status", "Actions"].map(h => (
                            <th key={h} className="px-3 py-1.5 bg-blue-50/60 text-blue-600 font-semibold border-b border-blue-100">
                                {h}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {meetings.map(m => {
                        const buddy = buddies.find(b => b.id === m.buddyId);
                        const partNames = m.participants
                            .map(pid => participants.find(p => p.id === pid)?.name || "Unknown")
                            .join(", ");
                        const isCompleted = m.status === 'completed';
                        const isCanceled = m.status === 'canceled';
                        return (
                            <tr key={m.id} className={`border-b border-slate-100 last:border-0 hover:bg-blue-50/20 ${isCanceled ? "opacity-50" : ""}`}>
                                <td className="px-3 py-1.5">
                                    <div className="flex flex-col gap-0.5">
                                        <span className="font-semibold text-slate-800">{m.start.split(' ')[0]}</span>
                                        <span className="text-xs text-slate-400">{m.start.split(' ')[1]} - {m.end.split(' ')[1]}</span>
                                    </div>
                                </td>
                                <td className="px-3 py-1.5 font-medium text-slate-800">{buddy?.name}</td>
                                <td className="px-3 py-1.5 text-slate-700">{partNames}</td>
                                <td className="px-3 py-1.5">
                                    <div className="text-xs text-slate-500 max-w-[140px] truncate" title={m.topic}>
                                        {m.topic ? `"${m.topic}"` : '-'}
                                    </div>
                                </td>
                                <td className="px-3 py-1.5">
                                    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold uppercase
                                        ${isCompleted ? "bg-emerald-50 text-emerald-700" : isCanceled ? "bg-red-50 text-red-500" : "bg-blue-50 text-blue-600"}`}>
                                        {m.status}
                                    </span>
                                </td>
                                <td className="px-3 py-1.5">
                                    {m.status === 'scheduled' && (
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => onComplete(m)}
                                                className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-md transition-colors cursor-pointer"
                                            >
                                                <CheckCircle size={11} /> Complete
                                            </button>
                                            <button
                                                onClick={() => onCancel(m)}
                                                className="px-2 py-1 text-xs bg-red-50 hover:bg-red-100 text-red-500 border border-red-200 rounded-md transition-colors cursor-pointer"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    )}
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}
