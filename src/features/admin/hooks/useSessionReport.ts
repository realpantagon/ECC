import { useState } from "react";
import { getWeekNum } from "../../../shared/utils/dateUtils";
import type { Meeting } from "../../../types/Meeting";

export type ReportFilter = {
    date: string;
    week: string;
    buddyId: string;
    participantId: string;
    status: string;
};

const INITIAL_FILTER: ReportFilter = {
    date: "",
    week: "",
    buddyId: "",
    participantId: "",
    status: "",
};

/**
 * Manages filter state and derives filtered meetings for the Session Report tab.
 */
export function useSessionReport(meetings: Meeting[]) {
    const [filter, setFilter] = useState<ReportFilter>(INITIAL_FILTER);

    const hasFilters = Object.values(filter).some(v => v !== "");

    const clearFilters = () => setFilter(INITIAL_FILTER);

    const setField = (field: keyof ReportFilter) => (value: string) =>
        setFilter(prev => ({ ...prev, [field]: value }));

    const weekOptions = [...new Set(
        meetings.map(m => getWeekNum(m.start.split(' ')[0]))
    )].sort((a, b) => a - b);

    const filteredMeetings = meetings.filter(m => {
        const dateStr = m.start.split(' ')[0];
        if (filter.date && dateStr !== filter.date) return false;
        if (filter.week && getWeekNum(dateStr) !== parseInt(filter.week)) return false;
        if (filter.buddyId && m.buddyId !== filter.buddyId) return false;
        if (filter.participantId && !m.participants.includes(filter.participantId)) return false;
        if (filter.status && m.status !== filter.status) return false;
        return true;
    }).sort((a, b) => new Date(b.start).getTime() - new Date(a.start).getTime());

    return {
        filter,
        setField,
        hasFilters,
        clearFilters,
        weekOptions,
        filteredMeetings,
    };
}
