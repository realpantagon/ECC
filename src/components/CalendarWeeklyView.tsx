import type { Availability } from "../types/Availability";
import "./CalendarWeeklyView.css";

import type { ReactNode } from "react";

interface CalendarWeeklyViewProps {
    slots: Availability[];
    renderSlot: (slot: Availability) => ReactNode;
    weekOffset?: number;
}

const DAYS_OF_WEEK = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

function getWeekDates(weekOffset = 1) {
    const today = new Date();
    const currentDay = today.getDay(); // 0 is Sunday, 1 is Monday
    const distanceToMonday = currentDay === 0 ? -6 : 1 - currentDay;
    const targetWeekOffset = distanceToMonday + weekOffset * 7;

    const dates = [];
    for (let i = 0; i < 5; i++) { // Mon–Fri only
        const d = new Date(today.getFullYear(), today.getMonth(), today.getDate() + targetWeekOffset + i);
        // Format as YYYY-MM-DD for easy comparison
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
        <div className="calendar-container glass-panel">
            <div className="calendar-grid">
                {weekDates.map((dateStr, index) => {
                    const dayName = DAYS_OF_WEEK[index];
                    const shortDate = new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

                    // Get slots for this specific date and sort by start time
                    const daySlots = slots
                        .filter((s) => s.date === dateStr)
                        .sort((a, b) => a.start.localeCompare(b.start));

                    const isToday = dateStr === todayStr;
                    return (
                        <div key={dateStr} className="calendar-column">
                            <div className={`calendar-header${isToday ? ' today' : ''}`}>
                                <div>{dayName.substring(0, 3)}</div>
                                <div style={{ fontSize: '0.65em' }}>{shortDate}</div>
                            </div>
                            <div className="calendar-body">
                                {daySlots.length === 0 ? (
                                    <div className="empty-day">-</div>
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
