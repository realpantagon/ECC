import type { Availability } from "../types/Availability";
import type { User } from "../types/User";
import { Clock, Calendar, Users, Trash2 } from "lucide-react";

interface SlotCardProps {
    slot: Availability;
    buddy?: User;
    onJoin?: () => void;
    onDelete?: () => void;
    showBuddyName?: boolean;
    participantCount?: number;
    isJoined?: boolean;
    isSelected?: boolean;
}

export function SlotCard({
    slot,
    buddy,
    onJoin,
    onDelete,
    showBuddyName = false,
    participantCount = 0,
    isJoined = false,
    isSelected = false
}: SlotCardProps) {
    const cardBorder = isSelected && !slot.booked ? "border-blue-500 border-2" : "border-blue-100";

    return (
        <div className={`bg-white/85 backdrop-blur-md border ${cardBorder} rounded-2xl shadow-md shadow-blue-100/30 p-5 flex flex-col gap-4 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg animate-fade-in ${slot.booked ? "opacity-60 pointer-events-none" : ""}`}>
            {/* Header */}
            <div className="flex justify-between items-start">
                <div className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-600 px-2.5 py-1 rounded-lg text-xs font-semibold uppercase tracking-wide">
                    <Calendar size={13} />
                    <span>{new Date(slot.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                </div>
                {slot.booked && (
                    <span className="text-xs font-bold uppercase bg-red-50 text-red-500 px-2 py-0.5 rounded">Booked</span>
                )}
                {!slot.booked && isJoined && (
                    <span className="text-xs font-bold uppercase bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded">Joined</span>
                )}
            </div>

            {/* Body */}
            <div className="flex flex-col gap-2.5">
                <div className="flex items-center gap-2 text-xl font-semibold text-slate-800">
                    <Clock size={16} className="text-slate-400" />
                    <span>{slot.start} - {slot.end}</span>
                </div>
                {showBuddyName && buddy && (
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-500">Buddy:</span>
                        <span className="font-medium text-slate-800">{buddy.name}</span>
                    </div>
                )}
                {(participantCount > 0 || showBuddyName) && (
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-500">Participants:</span>
                        <div className="flex items-center gap-1.5 text-slate-700 font-medium">
                            <Users size={13} />
                            <span>{participantCount}</span>
                        </div>
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="mt-auto flex gap-2">
                {onJoin && (
                    <button
                        className="flex-1 py-2 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors cursor-pointer"
                        onClick={onJoin}
                        disabled={slot.booked || isJoined}
                    >
                        {slot.booked ? "Meeting Set" : isJoined ? "Request Pending" : isSelected ? "Selected (Click to remove)" : "Select Slot"}
                    </button>
                )}
                {onDelete && (
                    <button
                        className="p-2 rounded-lg bg-red-50 hover:bg-red-100 text-red-500 transition-colors cursor-pointer"
                        onClick={onDelete}
                        title="Delete Slot"
                    >
                        <Trash2 size={16} />
                    </button>
                )}
            </div>
        </div>
    );
}
