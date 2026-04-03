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
    monthOffset: 0 | 1;
    setMonthOffset: (v: 0 | 1) => void;
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
    monthOffset,
    setMonthOffset,
    onSelectOwnSlot,
    onDeleteSlot,
}: BuddyScheduleCalendarProps) {
    const toggleBtn = (active: boolean) =>
        `px-3 py-1.5 text-xs font-medium rounded-md border-none cursor-pointer transition-all ${active ? "bg-white shadow-sm text-blue-600" : "bg-transparent text-slate-500 hover:text-slate-700"}`;

    const renderMonthSlot = (slot: Availability) => {
        const isMine = slot.buddyId === currentUserId;
        const buddyName = isMine ? 'Me' : (users.find(u => u.id === slot.buddyId)?.name || 'Unknown');
        // Own booked = purple | Own available = green | Others = blue
        const colorClass = !isMine
            ? "bg-blue-50 border border-blue-100 text-blue-300"
            : slot.booked
                ? "bg-purple-50 border border-purple-300 text-purple-700 hover:bg-purple-100"
                : "bg-emerald-50 border border-emerald-300 text-emerald-700 hover:bg-emerald-100";
        return (
            <div
                className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-[0.65rem] font-medium whitespace-nowrap transition-all ${colorClass}`}
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
        // Own booked = purple | Own available = green | Others = blue
        const cardClass = !isMine
            ? "bg-blue-50 border border-blue-200 opacity-75"
            : slot.booked
                ? "bg-purple-50 border border-purple-200 shadow-sm"
                : "bg-emerald-50 border border-emerald-200 shadow-sm";
        const labelColor = !isMine ? "text-blue-400" : slot.booked ? "text-purple-500" : "text-emerald-600";
        const nameColor = !isMine ? "text-blue-400" : slot.booked ? "text-purple-600" : "text-emerald-600";
        return (
            <div
                className={`relative text-xs rounded-md p-1.5 flex flex-col gap-0.5 transition-all group ${cardClass}`}
                style={{ cursor: isMine ? 'pointer' : 'default' }}
                onClick={() => isMine && onSelectOwnSlot(slot.id)}
            >
                <div className="flex items-center gap-1 font-medium text-slate-700">
                    <Clock size={10} />
                    <span className="hidden sm:inline">{slot.start} - {slot.end}</span>
                    <span className="sm:hidden">{slot.start}</span>
                </div>
                {isMine && (
                    <div className={`text-[0.6rem] font-bold uppercase ${labelColor}`}>
                        {slot.booked ? 'Booked' : 'My Slot'}
                    </div>
                )}
                <div className={`text-[0.6rem] ${nameColor}`}>{buddyName}</div>
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
                <div className="flex flex-col gap-2">
                    <h2 className="text-lg font-semibold text-slate-800">My Schedule</h2>
                    <div className="flex gap-4 text-[0.65rem] font-medium text-slate-500">
                        <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-sm bg-emerald-400"></div> My Available Slot</div>
                        <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-sm bg-purple-400"></div> My Booked Slot</div>
                        <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-sm bg-blue-400" style={{ opacity: 0.75 }}></div> Other Buddy's Slot</div>
                    </div>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                    {viewMode === 'month' && (
                        <div className="flex gap-1 bg-amber-50 border border-amber-100 p-1 rounded-lg">
                            <button onClick={() => setMonthOffset(0)} className={toggleBtn(monthOffset === 0)}>This Month</button>
                            <button onClick={() => setMonthOffset(1)} className={toggleBtn(monthOffset === 1)}>Next Month</button>
                        </div>
                    )}
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
                <CalendarMonthView slots={slots} renderSlot={renderMonthSlot} monthOffset={monthOffset} />
            ) : (
                <CalendarWeeklyView slots={slots} weekOffset={weekOffset} renderSlot={renderWeekSlot} />
            )}
        </div>
    );
}
