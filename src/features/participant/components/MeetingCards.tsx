import type { Meeting } from "../../../types/Meeting";
import type { User } from "../../../types/User";
import { SectionHeader } from "../../../shared/components/SectionHeader";

interface MeetingCardsProps {
    myMeetings: Meeting[];
    users: User[];
}

function formatCardDate(date: string): string {
    return new Date(date).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
}

function getDatePart(value: string): string {
    if (!value) return "";
    if (value.includes("T")) return value.split("T")[0];
    if (value.includes(" ")) return value.split(" ")[0];
    return value;
}

function getTimePart(value: string): string {
    if (!value) return "";
    if (value.includes("T")) return value.split("T")[1]?.slice(0, 5) ?? value;
    if (value.includes(" ")) return value.split(" ")[1] ?? value;
    return value;
}

export function MeetingCards({ myMeetings, users }: MeetingCardsProps) {
    if (myMeetings.length === 0) return null;

    return (
        <div>
            <SectionHeader title="My Meetings" />
            <div className="grid grid-cols-[repeat(auto-fill,minmax(190px,1fr))] gap-2">
                {myMeetings.map(meeting => {
                    const buddy = users.find(u => u.id === meeting.buddyId);
                    const isCanceled = meeting.status === 'canceled';
                    const isCompleted = meeting.status === 'completed';

                    const borderColor = isCanceled ? "border-l-red-400" : isCompleted ? "border-l-emerald-400" : "border-l-blue-400";
                    const statusColor = isCanceled ? "text-red-500" : isCompleted ? "text-emerald-600" : "text-blue-600";
                    const statusLabel = isCanceled ? 'Canceled' : isCompleted ? 'Completed' : 'Scheduled';
                    const confirmBg = isCanceled ? "bg-red-50 text-red-600" : isCompleted ? "bg-emerald-50 text-emerald-700" : "bg-blue-50 text-blue-600";
                    const dateLabel = formatCardDate(getDatePart(meeting.start));
                    const timeLabel = `${getTimePart(meeting.start)} - ${getTimePart(meeting.end)}`;

                    return (
                        <div key={meeting.id} className={`bg-white/90 border border-blue-100 border-l-[3px] ${borderColor} rounded-lg shadow-sm p-2.5 animate-fade-in flex flex-col gap-1.5 ${isCanceled ? "opacity-75" : ""}`}>
                            <div className="flex flex-col gap-1">
                                <div className="font-semibold text-[0.82rem] text-slate-800">{dateLabel}</div>
                                <span className="inline-flex w-fit items-center gap-0.5 text-[0.66rem] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                                    <span>{timeLabel}</span>
                                </span>
                            </div>
                            <div className="flex flex-col gap-0.5 text-xs">
                                <div><span className="text-slate-500">Buddy:</span> {buddy?.name || 'Assigned'}</div>
                                <div><span className="text-slate-500">Status:</span> <span className={statusColor}>{statusLabel}</span></div>
                                {meeting.topic && (
                                    <div><span className="text-slate-500">Note:</span> <span className="italic">"{meeting.topic}"</span></div>
                                )}
                            </div>
                            <div className={`mt-1 text-[0.68rem] font-semibold text-center py-1.5 px-2 rounded-md ${confirmBg}`}>
                                Meeting {statusLabel}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
