import type { Availability } from "../../../types/Availability";
import type { Meeting } from "../../../types/Meeting";
import type { User } from "../../../types/User";
import { SectionHeader } from "../../../shared/components/SectionHeader";

interface BuddySlotStatusCardsProps {
    slots: Availability[];
    meetings: Meeting[];
    users: User[];
    currentUserId: string;
}

type SlotStatus = "available" | "scheduled" | "completed" | "canceled";

function formatCardDate(date: string): string {
    return new Date(date).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
}

function resolveSlotStatus(slot: Availability, meeting?: Meeting): SlotStatus {
    if (meeting?.status === "canceled") return "canceled";
    if (meeting?.status === "completed") return "completed";
    if (meeting?.status === "scheduled" || slot.booked) return "scheduled";
    return "available";
}

export function BuddySlotStatusCards({ slots, meetings, users, currentUserId }: BuddySlotStatusCardsProps) {
    const mySlots = slots
        .filter((slot) => slot.buddyId === currentUserId)
        .sort((a, b) => {
            const dateCmp = a.date.localeCompare(b.date);
            if (dateCmp !== 0) return dateCmp;
            return a.start.localeCompare(b.start);
        });

    if (mySlots.length === 0) return null;

    return (
        <div>
            <SectionHeader title="My Slot Status" subtitle="Track availability and booking progress" />
            <div className="grid grid-cols-[repeat(auto-fill,minmax(190px,1fr))] gap-2">
                {mySlots.map((slot) => {
                    const meeting = meetings.find((m) => m.availabilityId === slot.id);
                    const status = resolveSlotStatus(slot, meeting);
                    const participant = meeting?.participants?.[0]
                        ? users.find((u) => u.id === meeting.participants[0])
                        : null;

                    const borderColor =
                        status === "canceled"
                            ? "border-l-red-400"
                            : status === "completed"
                                ? "border-l-emerald-400"
                                : status === "scheduled"
                                    ? "border-l-blue-400"
                                    : "border-l-amber-400";

                    const statusColor =
                        status === "canceled"
                            ? "text-red-500"
                            : status === "completed"
                                ? "text-emerald-600"
                                : status === "scheduled"
                                    ? "text-blue-600"
                                    : "text-amber-600";

                    const statusLabel =
                        status === "canceled"
                            ? "Canceled"
                            : status === "completed"
                                ? "Completed"
                                : status === "scheduled"
                                    ? "Scheduled"
                                    : "Available";

                    const confirmBg =
                        status === "canceled"
                            ? "bg-red-50 text-red-600"
                            : status === "completed"
                                ? "bg-emerald-50 text-emerald-700"
                                : status === "scheduled"
                                    ? "bg-blue-50 text-blue-600"
                                    : "bg-amber-50 text-amber-700";

                        const timeLabel = `${slot.start} - ${slot.end}`;

                    return (
                        <div
                            key={slot.id}
                                className={`bg-white/90 border border-blue-100 border-l-[3px] ${borderColor} rounded-lg shadow-sm p-2.5 animate-fade-in flex flex-col gap-1.5 ${status === "canceled" ? "opacity-75" : ""}`}
                        >
                                <div className="flex flex-col gap-1">
                                    <div className="font-semibold text-[0.82rem] text-slate-800">{formatCardDate(slot.date)}</div>
                                    <span className="inline-flex w-fit items-center gap-0.5 text-[0.66rem] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                                        <span>{timeLabel}</span>
                                    </span>
                                </div>
                                <div className="flex flex-col gap-0.5 text-xs">
                                <div>
                                    <span className="text-slate-500">Participant:</span> {participant?.name || "-"}
                                </div>
                                <div>
                                    <span className="text-slate-500">Status:</span> <span className={statusColor}>{statusLabel}</span>
                                </div>
                                {meeting?.topic && (
                                    <div>
                                        <span className="text-slate-500">Note:</span> <span className="italic">"{meeting.topic}"</span>
                                    </div>
                                )}
                            </div>
                                <div className={`mt-1 text-[0.68rem] font-semibold text-center py-1.5 px-2 rounded-md ${confirmBg}`}>
                                Slot {statusLabel}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
