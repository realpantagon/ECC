import { Trash2, CalendarDays, Calendar as CalendarIcon, Clock } from "lucide-react";
import { CalendarMonthView } from "../../../components/CalendarMonthView";
import { CalendarWeeklyView } from "../../../components/CalendarWeeklyView";
import type { Availability } from "../../../types/Availability";
import type { User } from "../../../types/User";

interface BuddyScheduleCalendarProps {
    slots: Availability[];
    users: User[];
    currentUserId: string;
    viewMode: "month" | "calendar";
    setViewMode: (v: "month" | "calendar") => void;
    weekOffset: 0 | 1;
    setWeekOffset: (v: 0 | 1) => void;
    onSelectOwnSlot: (id: string) => void;
    onDeleteSlot: (e: React.MouseEvent, id: string) => void;
}

export function BuddyScheduleCalendar({
    slots,
    users,
    currentUserId,
    viewMode,
    setViewMode,
    weekOffset,
    setWeekOffset,
    onSelectOwnSlot,
    onDeleteSlot,
}: BuddyScheduleCalendarProps) {
    const toggleBtn = (active: boolean) =>
        `px-3 py-1.5 text-xs font-medium rounded-md border-none cursor-pointer transition-all ${active ? "bg-white shadow-sm text-blue-600" : "bg-transparent text-slate-500 hover:text-slate-700"}`;

    const renderMonthSlot = (slot: Availability) => {
        const isMine = slot.buddyId === currentUserId;
        const buddyName = isMine ? 'Me' : (users.find(u => u.id === slot.buddyId)?.name || 'Unknown');
        return (
            <div
                className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-[0.65rem] font-medium whitespace-nowrap cursor-pointer transition-all
                    ${slot.booked ? "bg-emerald-50 border border-emerald-300 text-emerald-700" : isMine ? "bg-blue-50 border border-blue-300 text-blue-600 hover:bg-blue-100" : "bg-slate-50 border border-slate-200 text-slate-500"}`}
                title={`${slot.start} - ${slot.end} (${buddyName})`}
                onClick={() => isMine && onSelectOwnSlot(slot.id)}
                style={{ cursor: isMine ? 'pointer' : 'default' }}
            >
                <Clock size={9} />
                <span>{slot.start} ({buddyName})</span>
            </div>
        );
    };

    const renderWeekSlot = (slot: Availability) => {
        const isMine = slot.buddyId === currentUserId;
        const buddyName = isMine ? 'Me' : (users.find(u => u.id === slot.buddyId)?.name || 'Unknown');
        return (
            <div
                className={`relative text-xs rounded-md p-1.5 flex flex-col gap-0.5 transition-all cursor-default group
                    ${isMine ? "bg-blue-50 border border-blue-200 shadow-sm" : "bg-slate-50 border border-slate-200 opacity-75"}
                    ${slot.booked ? "bg-emerald-50 border border-emerald-200" : ""}`}
                style={{ opacity: isMine ? 1 : 0.72, cursor: isMine ? 'pointer' : 'default' }}
                onClick={() => isMine && onSelectOwnSlot(slot.id)}
            >
                <div className="flex items-center gap-1 font-medium text-slate-700">
                    <Clock size={10} />
                    <span className="hidden sm:inline">{slot.start} - {slot.end}</span>
                    <span className="sm:hidden">{slot.start}</span>
                </div>
                {isMine && <div className="text-[0.6rem] font-bold text-blue-500 uppercase">My Slot</div>}
                <div className={`text-[0.6rem] ${isMine ? "text-blue-600" : "text-slate-400"}`}>{buddyName}</div>
                {slot.booked && <div className="text-[0.6rem] font-bold text-emerald-600 uppercase">Booked</div>}
                {isMine && !slot.booked && (
                    <button
                        className="absolute top-1 right-1 w-4 h-4 flex items-center justify-center rounded bg-red-50 text-red-400 hover:bg-red-100 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                        onClick={(e) => onDeleteSlot(e, slot.id)}
                    >
                        <Trash2 size={9} />
                    </button>
                )}
            </div>
        );
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-4 flex-wrap gap-3">
                <h2 className="text-lg font-semibold text-slate-800">My Schedule</h2>
                <div className="flex items-center gap-2 flex-wrap">
                    {viewMode === 'calendar' && (
                        <div className="flex gap-1 bg-emerald-50 border border-emerald-100 p-1 rounded-lg">
                            <button onClick={() => setWeekOffset(0)} className={toggleBtn(weekOffset === 0)}>This Week</button>
                            <button onClick={() => setWeekOffset(1)} className={toggleBtn(weekOffset === 1)}>Next Week</button>
                        </div>
                    )}
                    <div className="flex gap-1 bg-blue-50 border border-blue-100 p-1 rounded-lg">
                        <button onClick={() => setViewMode('month')} className={`${toggleBtn(viewMode === 'month')} flex items-center gap-1.5`}>
                            <CalendarDays size={14} /> Month
                        </button>
                        <button onClick={() => setViewMode('calendar')} className={`${toggleBtn(viewMode === 'calendar')} flex items-center gap-1.5`}>
                            <CalendarIcon size={14} /> Week
                        </button>
                    </div>
                </div>
            </div>

            {slots.length === 0 ? (
                <div className="bg-white/85 border border-blue-100 rounded-2xl shadow-md shadow-blue-100/30 py-12 text-center text-slate-500 text-sm">
                    No availability slots have been added yet.
                </div>
            ) : viewMode === "month" ? (
                <CalendarMonthView slots={slots} renderSlot={renderMonthSlot} />
            ) : (
                <CalendarWeeklyView slots={slots} weekOffset={weekOffset} renderSlot={renderWeekSlot} />
            )}
        </div>
    );
}
