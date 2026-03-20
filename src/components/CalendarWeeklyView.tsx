import type { Availability } from "../types/Availability";
import type { ReactNode } from "react";

interface CalendarWeeklyViewProps {
    slots: Availability[];
    renderSlot: (slot: Availability) => ReactNode;
    weekOffset?: number;
}

const DAYS_OF_WEEK = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

function getWeekDates(weekOffset = 1) {
    const today = new Date();
    const currentDay = today.getDay();
    const distanceToMonday = currentDay === 0 ? -6 : 1 - currentDay;
    const targetWeekOffset = distanceToMonday + weekOffset * 7;

    const dates = [];
    for (let i = 0; i < 5; i++) {
        const d = new Date(today.getFullYear(), today.getMonth(), today.getDate() + targetWeekOffset + i);
        const tzOffset = d.getTimezoneOffset() * 60000;
        dates.push(new Date(d.getTime() - tzOffset).toISOString().split('T')[0]);
    }
    return dates;
}

export function CalendarWeeklyView({ slots, renderSlot, weekOffset = 1 }: CalendarWeeklyViewProps) {
    const weekDates = getWeekDates(weekOffset);
    const todayStr = (() => {
        const d = new Date();
        const tzOffset = d.getTimezoneOffset() * 60000;
        return new Date(d.getTime() - tzOffset).toISOString().split('T')[0];
    })();

    return (
        <div className="bg-white/85 backdrop-blur-md border border-blue-100 rounded-2xl shadow-md shadow-blue-100/30 overflow-x-auto p-3">
            <div className="grid grid-cols-5 gap-2 min-w-[500px]">
                {weekDates.map((dateStr, index) => {
                    const dayName = DAYS_OF_WEEK[index];
                    const shortDate = new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                    const daySlots = slots
                        .filter((s) => s.date === dateStr)
                        .sort((a, b) => a.start.localeCompare(b.start));
                    const isToday = dateStr === todayStr;

                    return (
                        <div key={dateStr} className="flex flex-col bg-blue-50/40 border border-blue-100 rounded-lg overflow-hidden">
                            {/* Column header */}
                            <div className={`px-2 py-2 text-center font-semibold uppercase text-xs tracking-wide border-b ${isToday ? "bg-blue-600 text-white border-blue-700" : "bg-blue-50 text-blue-500 border-blue-100"}`}>
                                <div>{dayName.substring(0, 3)}</div>
                                <div className="text-[0.6rem] font-normal opacity-80 mt-0.5">{shortDate}</div>
                            </div>
                            {/* Slots */}
                            <div className="p-1.5 flex flex-col gap-1.5 min-h-[80px]">
                                {daySlots.length === 0 ? (
                                    <div className="text-center text-slate-300 py-3 text-sm">-</div>
                                ) : (
                                    daySlots.map((slot) => (
                                        <div key={slot.id}>
                                            {renderSlot(slot)}
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
