import type { Meeting } from "../../../types/Meeting";
import type { User } from "../../../types/User";
import { TOTAL_WEEKS } from "../../../shared/constants";
import { getAttendancePct } from "../../../shared/utils/attendanceUtils";

/**
 * Writes an array of rows to a UTF-8 CSV file and triggers browser download.
 */
export function downloadCSV(rows: string[][], filename: string): void {
    const csv = rows
        .map(r => r.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(","))
        .join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
}

/**
 * Builds the attendance CSV rows and triggers download.
 */
export function exportAttendanceCSV(participants: User[], meetings: Meeting[]): void {
    const weekHeaders = Array.from({ length: TOTAL_WEEKS }, (_, i) => `Week${i + 1}`);
    const headers = ["No.", "Name", "Attendance %", "Sessions Completed", ...weekHeaders, "Status"];

    const rows = participants.map((p, idx) => {
        const pMeetings = meetings
            .filter(m => m.participants.includes(p.id) && m.status === 'completed')
            .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());

        const completed = pMeetings.length;
        const pct = getAttendancePct(completed);

        const weekCells = Array.from({ length: TOTAL_WEEKS }, (_, wi) => {
            const m = pMeetings[wi];
            if (m) {
                const dateStr = m.start.split(' ')[0];
                return m.topic ? `${dateStr} - ${m.topic}` : dateStr;
            }
            return wi < completed ? '' : 'No Reason';
        });

        const status =
            pct >= 93 ? 'Hit Target' :
            pct >= 80 ? 'Good' :
            pct >= 50 ? 'Needs Improvement' : 'At Risk';

        return [String(idx + 1), p.name, `${pct}%`, String(completed), ...weekCells, status];
    });

    const totalParticipants = participants.length;
    const avgAttendance = totalParticipants > 0
        ? Math.round(
            participants.reduce((sum, p) => {
                const c = meetings.filter(m => m.participants.includes(p.id) && m.status === 'completed').length;
                return sum + (c / TOTAL_WEEKS) * 100;
            }, 0) / totalParticipants
          )
        : 0;

    const hitTarget = participants.filter(p => {
        const c = meetings.filter(m => m.participants.includes(p.id) && m.status === 'completed').length;
        return getAttendancePct(c) >= 93;
    }).length;

    const needsImprovement = participants.filter(p => {
        const c = meetings.filter(m => m.participants.includes(p.id) && m.status === 'completed').length;
        return getAttendancePct(c) < 80;
    }).length;

    const emptyWeeks = Array(TOTAL_WEEKS).fill('');
    const summaryRows = [
        ['', '', '', '', ...emptyWeeks, ''],
        ['', 'Total Participants', String(totalParticipants), '', ...emptyWeeks, ''],
        ['', 'Average Attendance', `${avgAttendance}%`, '', ...emptyWeeks, ''],
        ['', 'Hit Target (≥93%)', String(hitTarget), '', ...emptyWeeks, ''],
        ['', 'Needs Improvement (<80%)', String(needsImprovement), '', ...emptyWeeks, ''],
    ];

    downloadCSV(
        [headers, ...rows, ...summaryRows],
        `ATS-ECC-Attendance-${new Date().toISOString().split("T")[0]}.csv`
    );
}
