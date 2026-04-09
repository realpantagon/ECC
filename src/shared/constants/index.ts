/** Total number of sessions in the ECC program. */
export const TOTAL_WEEKS = 26;

/** Tailwind background colors cycled for buddy legend/calendar dots. */
export const BUDDY_BG_COLORS = [
    'bg-blue-500',
    'bg-emerald-500',
    'bg-amber-500',
    'bg-violet-500',
    'bg-pink-500',
    'bg-cyan-500',
] as const;

/** Tailwind slot pill colors per buddy index (border + text + bg). */
export const BUDDY_PILL_COLORS = [
    'bg-blue-50 border-blue-300 text-blue-600',
    'bg-emerald-50 border-emerald-300 text-emerald-700',
    'bg-amber-50 border-amber-300 text-amber-700',
    'bg-violet-50 border-violet-300 text-violet-700',
    'bg-pink-50 border-pink-300 text-pink-700',
] as const;

/** Weekday short names Mon–Fri. */
export const WEEKDAY_SHORT = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'] as const;

/** Weekday full names Mon–Fri. */
export const WEEKDAY_FULL = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'] as const;
