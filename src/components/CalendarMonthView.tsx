import type { Availability } from "../types/Availability";
import type { ReactNode } from "react";

interface CalendarMonthViewProps {
    slots: Availability[];
    renderSlot: (slot: Availability) => ReactNode;
    monthOffset?: 0 | 1;
}

const DAYS_OF_WEEK = ["Mon", "Tue", "Wed", "Thu", "Fri"];

function getMonthDates(monthOffset = 0) {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth() + monthOffset;

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    const startDayOfWeek = firstDay.getDay();
    const colOffset = startDayOfWeek === 0 ? 0 : startDayOfWeek === 6 ? 0 : startDayOfWeek - 1;

    const dates: (string | null)[] = [];

    for (let i = 0; i < colOffset; i++) {
        dates.push(null);
    }

    for (let i = 1; i <= lastDay.getDate(); i++) {
        const d = new Date(year, month, i);
        const dow = d.getDay();
        if (dow === 0 || dow === 6) continue;
        const tzOffset = d.getTimezoneOffset() * 60000;
        dates.push(new Date(d.getTime() - tzOffset).toISOString().split('T')[0]);
    }

    while (dates.length % 5 !== 0) {
        dates.push(null);
    }

    return dates;
}

export function CalendarMonthView({ slots, renderSlot, monthOffset = 0 }: CalendarMonthViewProps) {
    const monthDates = getMonthDates(monthOffset);
    const viewMonthDate = new Date(new Date().getFullYear(), new Date().getMonth() + monthOffset, 1);
    const currentMonthName = viewMonthDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    const todayStr = (() => {
        const d = new Date();
        const tzOffset = d.getTimezoneOffset() * 60000;
        return new Date(d.getTime() - tzOffset).toISOString().split('T')[0];
    })();

    return (
        <div className="bg-white/85 backdrop-blur-md border border-blue-100 rounded-2xl shadow-md shadow-blue-100/30 overflow-x-auto p-3">
            <div className="text-base font-semibold text-center text-slate-700 mb-3">{currentMonthName}</div>

            <div className="grid grid-cols-5 gap-0.5 border border-blue-100 rounded-lg overflow-hidden bg-blue-100">
                {/* Day headers */}
                {DAYS_OF_WEEK.map((day) => (
                    <div key={day} className="bg-blue-50 px-2 py-1.5 text-center text-xs font-semibold uppercase tracking-wide text-blue-500">
                        {day}
                    </div>
                ))}

                {/* Date cells */}
                {monthDates.map((dateStr, index) => {
                    if (!dateStr) {
                        return <div key={`empty-${index}`} className="bg-white/60 min-h-[90px]" />;
                    }

                    const dayNum = new Date(dateStr).getDate();
                    const daySlots = slots
                        .filter((s) => s.date === dateStr)
                        .sort((a, b) => a.start.localeCompare(b.start));
                    const isToday = dateStr === todayStr;

                    return (
                        <div
                            key={dateStr}
                            className={`bg-white min-h-[90px] p-1.5 flex flex-col ${isToday ? "outline outline-2 outline-blue-400 outline-offset-[-2px]" : ""}`}
                        >
                            <div className={`text-xs font-medium mb-1 flex ${isToday ? "justify-start" : "justify-end"}`}>
                                {isToday ? (
                                    <span className="w-5 h-5 flex items-center justify-center bg-blue-600 text-white rounded-full text-xs font-bold">
                                        {dayNum}
                                    </span>
                                ) : (
                                    <span className="text-slate-400">{dayNum}</span>
                                )}
                            </div>
                            <div className="flex flex-col gap-0.5 flex-1 overflow-y-auto [&::-webkit-scrollbar]:w-0.5 [&::-webkit-scrollbar-thumb]:bg-blue-200">
                                {daySlots.map((slot) => (
                                    <div key={slot.id}>
                                        {renderSlot(slot)}
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
