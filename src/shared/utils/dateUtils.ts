// Shared date utility functions — single source of truth across all features

/**
 * Returns a string key like "2026-W12" for a given ISO date string "YYYY-MM-DD".
 * Used for weekly reservation counting.
 */
export function getISOWeekKey(dateStr: string): string {
    const parts = dateStr.split('-');
    const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
    const jan4 = new Date(d.getFullYear(), 0, 4);
    const dayDiff = (d.getTime() - jan4.getTime()) / 86400000;
    const weekNum = Math.ceil((dayDiff + jan4.getDay() + 1) / 7);
    return `${d.getFullYear()}-W${weekNum}`;
}

/**
 * Returns the ISO week number for a date string "YYYY-MM-DD".
 */
export function getWeekNum(dateStr: string): number {
    const d = new Date(dateStr);
    const jan4 = new Date(d.getFullYear(), 0, 4);
    const dayDiff = (d.getTime() - jan4.getTime()) / 86400000;
    return Math.ceil((dayDiff + jan4.getDay() + 1) / 7);
}

/**
 * Returns today's date as "YYYY-MM-DD" in local time.
 */
export function getTodayStr(): string {
    const d = new Date();
    const tzOffset = d.getTimezoneOffset() * 60000;
    return new Date(d.getTime() - tzOffset).toISOString().split('T')[0];
}

/**
 * Returns iso "YYYY-MM-DD" for a Date object, adjusting for local timezone.
 */
export function toLocalISODate(d: Date): string {
    const tzOffset = d.getTimezoneOffset() * 60000;
    return new Date(d.getTime() - tzOffset).toISOString().split('T')[0];
}

/**
 * Returns the (Mon–Fri) date strings for the current month, used in CalendarMonthView.
 * Null entries represent empty cells before the first weekday.
 */
export function getMonthDates(): (string | null)[] {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    const startDayOfWeek = firstDay.getDay();
    const colOffset = startDayOfWeek === 0 ? 0 : startDayOfWeek === 6 ? 0 : startDayOfWeek - 1;

    const dates: (string | null)[] = [];
    for (let i = 0; i < colOffset; i++) dates.push(null);

    for (let i = 1; i <= lastDay.getDate(); i++) {
        const d = new Date(year, month, i);
        if (d.getDay() === 0 || d.getDay() === 6) continue;
        dates.push(toLocalISODate(d));
    }

    while (dates.length % 5 !== 0) dates.push(null);
    return dates;
}

/**
 * Returns Mon–Fri ISO date strings for a given week offset (0 = this week, 1 = next, etc.).
 */
export function getWeekDates(weekOffset = 1): string[] {
    const today = new Date();
    const currentDay = today.getDay();
    const distanceToMonday = currentDay === 0 ? -6 : 1 - currentDay;
    const targetOffset = distanceToMonday + weekOffset * 7;

    return Array.from({ length: 5 }, (_, i) => {
        const d = new Date(today.getFullYear(), today.getMonth(), today.getDate() + targetOffset + i);
        return toLocalISODate(d);
    });
}

/**
 * Returns the Monday of this week and the Sunday of next week as Date objects.
 */
export function getTwoWeekWindow() {
    const today = new Date();
    const currentDay = today.getDay();
    const distanceToMonday = currentDay === 0 ? -6 : 1 - currentDay;

    const thisWeekStart = new Date(today.getFullYear(), today.getMonth(), today.getDate() + distanceToMonday);
    thisWeekStart.setHours(0, 0, 0, 0);

    const nextWeekStart = new Date(thisWeekStart);
    nextWeekStart.setDate(nextWeekStart.getDate() + 7);

    const nextWeekEnd = new Date(nextWeekStart);
    nextWeekEnd.setDate(nextWeekEnd.getDate() + 4);
    nextWeekEnd.setHours(23, 59, 59, 999);

    return { thisWeekStart, nextWeekStart, nextWeekEnd };
}
