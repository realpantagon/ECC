import { Filter } from "lucide-react";
import type { ReportFilter } from "../hooks/useSessionReport";
import type { User } from "../../../types/User";

interface ReportFilterBarProps {
    filter: ReportFilter;
    setField: (field: keyof ReportFilter) => (value: string) => void;
    hasFilters: boolean;
    clearFilters: () => void;
    weekOptions: number[];
    buddies: User[];
    participants: User[];
}

const selCls = "px-3 py-1.5 text-sm border border-slate-200 rounded-lg bg-white text-slate-700 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition cursor-pointer";

export function ReportFilterBar({
    filter,
    setField,
    hasFilters,
    clearFilters,
    weekOptions,
    buddies,
    participants,
}: ReportFilterBarProps) {
    return (
        <div className="flex justify-between items-center mb-3 flex-wrap gap-2">
            <h2 className="text-lg font-semibold text-slate-800">Session Report</h2>
            <div className="flex items-center gap-2 flex-wrap">
                <div className="bg-white/85 border border-blue-100 rounded-xl shadow-sm px-4 py-2 flex gap-2 flex-wrap items-center">
                    <Filter size={14} className="text-slate-400" />
                    <input
                        type="date"
                        value={filter.date}
                        onChange={e => setField('date')(e.target.value)}
                        className={selCls}
                        title="Filter by date"
                    />
                    <select value={filter.week} onChange={e => setField('week')(e.target.value)} className={selCls}>
                        <option value="">All Weeks</option>
                        {weekOptions.map(w => <option key={w} value={w}>Week {w}</option>)}
                    </select>
                    <select value={filter.buddyId} onChange={e => setField('buddyId')(e.target.value)} className={selCls}>
                        <option value="">All Buddies</option>
                        {buddies.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                    </select>
                    <select value={filter.participantId} onChange={e => setField('participantId')(e.target.value)} className={selCls}>
                        <option value="">All Participants</option>
                        {participants.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                    <select value={filter.status} onChange={e => setField('status')(e.target.value)} className={selCls}>
                        <option value="">All Statuses</option>
                        <option value="scheduled">Scheduled</option>
                        <option value="completed">Completed</option>
                        <option value="canceled">Canceled</option>
                    </select>
                </div>
                {hasFilters && (
                    <button
                        className="px-3 py-1 text-xs bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg transition-colors cursor-pointer"
                        onClick={clearFilters}
                    >
                        Clear Filters
                    </button>
                )}
            </div>
        </div>
    );
}
