import { TOTAL_WEEKS } from "../constants";

/**
 * Returns attendance percentage (0–100) for a participant given completed sessions.
 */
export function getAttendancePct(completed: number): number {
    return Math.round((completed / TOTAL_WEEKS) * 10000) / 100;
}

/**
 * Returns a status label string based on attendance %.
 */
export function getAttendanceStatus(pct: number, completed: number): string {
    if (pct >= 93) return 'Hit Target';
    if (pct >= 80) return 'Good';
    if (pct >= 50) return 'Needs Improvement';
    if (completed > 0) return 'At Risk';
    return 'No Sessions';
}

/**
 * Returns classNames for the Tailwind progress bar color.
 */
export function getBarColor(pct: number): string {
    if (pct >= 80) return 'bg-emerald-500';
    if (pct >= 50) return 'bg-amber-400';
    return 'bg-red-400';
}

/**
 * Returns a JSX-ready Tailwind class string for a status badge.
 */
export function getStatusBadgeClass(pct: number): string {
    if (pct >= 93) return 'text-emerald-700 bg-emerald-50';
    if (pct >= 80) return 'text-blue-600 bg-blue-50';
    if (pct >= 50) return 'text-amber-700 bg-amber-50';
    return 'text-red-600 bg-red-50';
}

/**
 * Returns the status badge label string (with emoji prefix).
 */
export function getStatusBadgeLabel(pct: number, completed: number): string {
    if (pct >= 93) return '🎯 Hit Target';
    if (pct >= 80) return 'Good';
    if (pct >= 50) return '⚠ Needs Improvement';
    if (completed > 0) return 'At Risk';
    return '';
}

/**
 * Returns the attendance % text color class.
 */
export function getPctTextColor(pct: number): string {
    if (pct >= 93) return 'text-emerald-600';
    if (pct >= 50) return 'text-amber-600';
    return 'text-red-500';
}
