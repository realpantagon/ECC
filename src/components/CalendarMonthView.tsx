import type { Availability } from "../types/Availability";
import "./CalendarMonthView.css";

import type { ReactNode } from "react";

interface CalendarMonthViewProps {
    slots: Availability[];
    renderSlot: (slot: Availability) => ReactNode;
}

const DAYS_OF_WEEK = ["Mon", "Tue", "Wed", "Thu", "Fri"];

function getMonthDates() {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();

    // Get the first day of the month
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    // Padding for Mon-Fri grid: find what weekday-column the 1st falls on (0=Mon..4=Fri)
    const startDayOfWeek = firstDay.getDay(); // 0=Sun,1=Mon..6=Sat
    // If Sunday skip to next Mon; otherwise offset from Monday
    const colOffset = startDayOfWeek === 0 ? 0 : startDayOfWeek === 6 ? 0 : startDayOfWeek - 1;

    const dates: (string | null)[] = [];

    // Add empty slots for days before the 1st (within Mon-Fri grid)
    for (let i = 0; i < colOffset; i++) {
        dates.push(null);
    }

    // Add days of current month, skipping weekends
    for (let i = 1; i <= lastDay.getDate(); i++) {
        const d = new Date(year, month, i);
        const dow = d.getDay();
        if (dow === 0 || dow === 6) continue; // skip Sat & Sun
        const tzOffset = d.getTimezoneOffset() * 60000;
        dates.push(new Date(d.getTime() - tzOffset).toISOString().split('T')[0]);
    }

    // Pad trailing empty cells so each month renders full Mon-Fri rows.
    while (dates.length % 5 !== 0) {
        dates.push(null);
    }

    return dates;
}

export function CalendarMonthView({ slots, renderSlot }: CalendarMonthViewProps) {
    const monthDates = getMonthDates();
    const currentMonthName = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    const todayStr = (() => {
        const d = new Date();
        const tzOffset = d.getTimezoneOffset() * 60000;
        return new Date(d.getTime() - tzOffset).toISOString().split('T')[0];
    })();

    return (
        <div className="calendar-month-container glass-panel">
            <div className="calendar-month-header-title">
                {currentMonthName}
            </div>
            <div className="calendar-month-grid workdays">
                {DAYS_OF_WEEK.map((day) => (
                    <div key={day} className="calendar-month-day-header">
                        {day}
                    </div>
                ))}

                {monthDates.map((dateStr, index) => {
                    if (!dateStr) {
                        return <div key={`empty-${index}`} className="calendar-month-cell empty"></div>;
                    }

                    const dayNum = new Date(dateStr).getDate();

                    // Get slots for this specific date
                    const daySlots = slots
                        .filter((s) => s.date === dateStr)
                        .sort((a, b) => a.start.localeCompare(b.start));

                    const isToday = dateStr === todayStr;
                    return (
                        <div key={dateStr} className={`calendar-month-cell${isToday ? ' today' : ''}`}>
                            <div className={`calendar-month-cell-header${isToday ? ' today' : ''}`}>{dayNum}</div>
                            <div className="calendar-month-cell-body">
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
