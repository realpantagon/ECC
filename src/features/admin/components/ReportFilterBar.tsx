import { Filter, X } from "lucide-react";
import type { ReportFilter } from "../hooks/useSessionReport";
import type { User } from "../../../types/User";
import { Button } from "../../../components/ui/button";

interface ReportFilterBarProps {
    filter: ReportFilter;
    setField: (field: keyof ReportFilter) => (value: string) => void;
    hasFilters: boolean;
    clearFilters: () => void;
    weekOptions: number[];
    buddies: User[];
    participants: User[];
}

const selCls = "px-2.5 py-1.5 text-sm border border-slate-200 rounded-lg bg-white text-slate-700 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition cursor-pointer min-w-0";

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
        <div className="mb-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                <h2 className="text-sm font-semibold text-slate-800">Session Report</h2>
                {hasFilters && (
                    <Button
                        variant="outline"
                        size="xs"
                        onClick={clearFilters}
                        className="self-start sm:self-auto text-slate-600 border-slate-200 hover:bg-slate-50 cursor-pointer"
                    >
                        <X size={12} /> Clear Filters
                    </Button>
                )}
            </div>

            <div className="bg-white/90 border border-blue-100 rounded-xl shadow-sm p-3">
                <div className="flex items-center gap-1.5 text-slate-400 mb-2">
                    <Filter size={13} />
                    <span className="text-xs font-medium text-slate-500">Filter by</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
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
            </div>
        </div>
    );
}
