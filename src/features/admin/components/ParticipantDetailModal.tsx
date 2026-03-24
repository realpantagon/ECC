import { X } from "lucide-react";
import { TOTAL_WEEKS } from "../../../shared/constants";
import { getAttendancePct, getBarColor } from "../../../shared/utils/attendanceUtils";
import { ProgressBar } from "../../../shared/components/ProgressBar";
import type { Meeting } from "../../../types/Meeting";
import type { User } from "../../../types/User";

interface ParticipantDetailModalProps {
    participant: User;
    meetings: Meeting[];
    buddies: User[];
    participants: User[];
    onClose: () => void;
}

export function ParticipantDetailModal({
    participant,
    meetings,
    buddies,
    participants,
    onClose,
}: ParticipantDetailModalProps) {
    const participantMeetings = meetings
        .filter(m => m.participants.includes(participant.id))
        .sort((a, b) => new Date(b.start).getTime() - new Date(a.start).getTime());

    const completedSessions = participantMeetings.filter(m => m.status === 'completed').length;
    const progress = getAttendancePct(completedSessions);
    const barColor = getBarColor(progress);

    return (
        <div
            className="fixed inset-0 bg-black/60 flex items-center justify-center z-[60] p-4"
            onClick={onClose}
        >
            <div
                className="relative bg-white/95 backdrop-blur-md border border-blue-100 rounded-xl shadow-2xl w-full max-w-2xl p-4 animate-fade-in max-h-[88vh] overflow-y-auto"
                onClick={e => e.stopPropagation()}
            >
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 cursor-pointer"
                    aria-label="Close"
                >
                    <X size={20} />
                </button>

                <h2 className="text-base font-semibold text-slate-800 mb-3">{participant.name} Details</h2>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-2 mb-3">
                    {[
                        { label: "Name", value: participant.name },
                        { label: "Sessions", value: `${completedSessions}/${TOTAL_WEEKS}` },
                        { label: "Progress", value: `${progress}%` },
                    ].map(s => (
                        <div key={s.label} className="bg-blue-50 border border-blue-100 rounded-lg p-2">
                            <div className="text-xs text-slate-400 mb-0.5">{s.label}</div>
                            <div className="font-bold text-slate-800">{s.value}</div>
                        </div>
                    ))}
                </div>

                {/* Progress Bar */}
                <div className="mb-3">
                    <div className="text-xs text-slate-400 mb-1">Progress Bar</div>
                    <ProgressBar value={progress} colorClass={barColor} />
                </div>

                <h3 className="font-semibold text-slate-700 mb-2 text-xs uppercase tracking-wide">Session Table of Contents</h3>

                {participantMeetings.length === 0 ? (
                    <div className="italic text-slate-400 text-sm text-center py-4">
                        No meetings found for this participant.
                    </div>
                ) : (
                    <div className="overflow-x-auto border border-blue-100 rounded-xl">
                        <table className="w-full text-sm border-collapse">
                            <thead>
                                <tr>
                                    {["Topic", "Date", "Buddy", "Participant"].map(h => (
                                        <th key={h} className="px-2.5 py-1.5 text-blue-600 font-semibold bg-blue-50/60 border-b border-blue-100 text-left">
                                            {h}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {participantMeetings.map(m => {
                                    const buddy = buddies.find(b => b.id === m.buddyId);
                                    const pNames = m.participants.map(pid => participants.find(p => p.id === pid)?.name || "Unknown").join(", ");
                                    return (
                                        <tr key={m.id} className={`border-b border-slate-100 last:border-0 ${m.status === 'canceled' ? "opacity-50" : ""}`}>
                                            <td className="px-2.5 py-1.5">
                                                {m.topic ? `"${m.topic}"` : <span className="text-slate-400">-</span>}
                                            </td>
                                            <td className="px-2.5 py-1.5 text-slate-500">{m.start.split(' ')[0]}</td>
                                            <td className="px-2.5 py-1.5 text-slate-600">{buddy?.name || "Unknown"}</td>
                                            <td className="px-2.5 py-1.5 text-slate-600">{pNames}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
