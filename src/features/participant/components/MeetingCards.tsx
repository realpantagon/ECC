import type { Meeting } from "../../../types/Meeting";
import type { User } from "../../../types/User";
import { SectionHeader } from "../../../shared/components/SectionHeader";

interface MeetingCardsProps {
    myMeetings: Meeting[];
    users: User[];
}

export function MeetingCards({ myMeetings, users }: MeetingCardsProps) {
    if (myMeetings.length === 0) return null;

    return (
        <div>
            <SectionHeader title="My Meetings" />
            <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-4">
                {myMeetings.map(meeting => {
                    const buddy = users.find(u => u.id === meeting.buddyId);
                    const isCanceled = meeting.status === 'canceled';
                    const isCompleted = meeting.status === 'completed';

                    const borderColor = isCanceled ? "border-l-red-400" : isCompleted ? "border-l-emerald-400" : "border-l-blue-400";
                    const statusColor = isCanceled ? "text-red-500" : isCompleted ? "text-emerald-600" : "text-blue-600";
                    const statusLabel = isCanceled ? 'Canceled' : isCompleted ? 'Completed' : 'Scheduled';
                    const confirmBg = isCanceled ? "bg-red-50 text-red-600" : isCompleted ? "bg-emerald-50 text-emerald-700" : "bg-blue-50 text-blue-600";
                    const icon = isCanceled ? '✕' : '✓';

                    return (
                        <div key={meeting.id} className={`bg-white/85 border border-blue-100 border-l-4 ${borderColor} rounded-2xl shadow-md p-5 animate-fade-in flex flex-col gap-3 ${isCanceled ? "opacity-75" : ""}`}>
                            <div className="font-semibold text-slate-800">{meeting.start} - {meeting.end}</div>
                            <div className="flex flex-col gap-1 text-sm mb-3">
                                <div><span className="text-slate-500">Buddy:</span> {buddy?.name || 'Assigned'}</div>
                                <div><span className="text-slate-500">Status:</span> <span className={statusColor}>{statusLabel}</span></div>
                                {meeting.topic && (
                                    <div><span className="text-slate-500">Note:</span> <span className="italic">"{meeting.topic}"</span></div>
                                )}
                            </div>
                            <div className={`mt-auto text-xs font-semibold text-center py-2 px-3 rounded-lg ${confirmBg}`}>
                                {icon} Meeting {statusLabel}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
