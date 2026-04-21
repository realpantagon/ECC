import { useState } from "react";
import { CalendarMonthView } from "../../../components/CalendarMonthView";
import { CalendarWeeklyView } from "../../../components/CalendarWeeklyView";
import { BUDDY_BG_COLORS, BUDDY_PILL_COLORS } from "../../../shared/constants";
import type { Availability } from "../../../types/Availability";
import type { User } from "../../../types/User";
import { CalendarDays, Calendar as CalendarIcon, Clock } from "lucide-react";

interface BuddyCalendarSectionProps {
    availabilities: Availability[];
    buddies: User[];
    onSlotClick?: (slot: Availability) => void;
}

export function BuddyCalendarSection({ availabilities, buddies, onSlotClick }: BuddyCalendarSectionProps) {
    const [viewMode, setViewMode] = useState<"month" | "calendar">("month");
    const [weekOffset, setWeekOffset] = useState<0 | 1>(0);

    const toggleBtn = (active: boolean) =>
        `px-3 py-1.5 text-xs font-medium rounded-md border cursor-pointer transition-all ${active ? "bg-white shadow-sm text-blue-600 border-blue-200 dark:bg-blue-600 dark:text-white dark:border-blue-500" : "bg-transparent text-slate-500 border-transparent hover:text-slate-700 hover:bg-blue-50/70 dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-slate-700/60"}`;

    const renderSlot = (slot: Availability, isWeekView: boolean) => {
        const buddyIndex = buddies.findIndex(b => b.id === slot.buddyId);
        const color = slot.booked
            ? 'bg-purple-600 border-purple-700 text-white shadow-sm font-bold z-10 dark:bg-purple-900/30 dark:border-purple-800 dark:text-purple-400 dark:shadow-none'
            : (BUDDY_PILL_COLORS[buddyIndex % BUDDY_PILL_COLORS.length] ?? BUDDY_PILL_COLORS[0]);
        const buddy = buddies[buddyIndex];

        if (!isWeekView) {
            return (
                <div
                    className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-[0.64rem] font-medium whitespace-nowrap transition-transform hover:scale-[1.02] cursor-pointer ${color} ${slot.booked ? 'border' : 'border'}`}
                    title={`${buddy?.name || 'Buddy'} - ${slot.start}-${slot.end}${slot.booked ? ' (Booked)' : ''}`}
                    onClick={() => onSlotClick && onSlotClick(slot)}
                >
                    <Clock size={8} className={slot.booked ? "text-purple-200" : ""} />
                    <span className="overflow-hidden text-ellipsis">
                        {slot.start} {buddy?.name?.split(' ')[0]}
                    </span>
                </div>
            );
        }

        return (
            <div
                className={`text-xs rounded-md p-1.5 flex flex-col gap-0.5 border transition-all cursor-pointer ${color}`}
                title={`${buddy?.name || 'Buddy'} - ${slot.start}-${slot.end}${slot.booked ? ' (Booked)' : ''}`}
                onClick={() => onSlotClick && onSlotClick(slot)}
            >
                <div className="flex items-center gap-1 font-medium">
                    <Clock size={10} />
                    <span className="hidden sm:inline">{slot.start} - {slot.end}</span>
                    <span className="sm:hidden">{slot.start}</span>
                </div>
                <div className={`text-[0.62rem] ${slot.booked ? "text-purple-100 dark:text-purple-400" : "text-slate-600 dark:text-slate-400"}`}>
                    {buddy?.name || 'Buddy'}
                </div>
            </div>
        );
    };

    return (
        <div className="animate-fade-in">
            <div className="flex justify-between items-center mb-2 flex-wrap gap-2">
                <h2 className="text-sm font-semibold text-slate-800">Buddy Availability Calendar</h2>
                <div className="flex items-center gap-2 flex-wrap">
                    {viewMode === 'calendar' && (
                        <div className="flex gap-1 bg-emerald-50 border border-emerald-100 p-1 rounded-lg dark:bg-slate-800/70 dark:border-slate-700">
                            <button onClick={() => setWeekOffset(0)} className={toggleBtn(weekOffset === 0)}>This Week</button>
                            <button onClick={() => setWeekOffset(1)} className={toggleBtn(weekOffset === 1)}>Next Week</button>
                        </div>
                    )}
                    <div className="flex gap-1 bg-blue-50 border border-blue-100 p-1 rounded-lg dark:bg-slate-800/70 dark:border-slate-700">
                        <button onClick={() => setViewMode('month')} className={`${toggleBtn(viewMode === 'month')} flex items-center gap-1.5`}>
                            <CalendarDays size={13} /> Month
                        </button>
                        <button onClick={() => setViewMode('calendar')} className={`${toggleBtn(viewMode === 'calendar')} flex items-center gap-1.5`}>
                            <CalendarIcon size={13} /> Week
                        </button>
                    </div>
                </div>
            </div>

            <div className="flex justify-between items-center mb-2 flex-wrap gap-2">
                {/* Legend */}
                <div className="flex gap-4 flex-wrap">
                    <div className="flex items-center gap-1.5 text-xs text-slate-600 font-medium border-r border-slate-200 pr-4 dark:text-slate-400 dark:border-slate-700">
                        <span className="w-3 h-3 rounded-sm bg-purple-600 dark:bg-purple-500" />
                        Booked Session
                    </div>
                    {buddies.map((b, i) => (
                        <div key={b.id} className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                            <span className={`w-2.5 h-2.5 rounded-full ${BUDDY_BG_COLORS[i % BUDDY_BG_COLORS.length]}`} />
                            {b.name}
                        </div>
                    ))}
                </div>
            </div>

            {viewMode === "month" ? (
                <CalendarMonthView
                    slots={availabilities}
                    renderSlot={(slot) => renderSlot(slot, false)}
                />
            ) : (
                <CalendarWeeklyView
                    slots={availabilities}
                    weekOffset={weekOffset}
                    renderSlot={(slot) => renderSlot(slot, true)}
                />
            )}
        </div>
    );
}
