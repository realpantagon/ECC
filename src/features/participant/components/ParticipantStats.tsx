import { TOTAL_WEEKS } from "../../../shared/constants";
import { StatCard } from "../../../shared/components/StatCard";
import { ProgressBar } from "../../../shared/components/ProgressBar";
import { getAttendancePct, getBarColor } from "../../../shared/utils/attendanceUtils";

interface ParticipantStatsProps {
    name: string;
    completedCount: number;
}

export function ParticipantStats({ name, completedCount }: ParticipantStatsProps) {
    const pct = getAttendancePct(completedCount);
    const barColor = getBarColor(pct);

    return (
        <div>
            <div className="flex gap-3 flex-wrap mb-3">
                <StatCard label="Name" value={name} />
                <StatCard label="Sessions" value={`${completedCount}/${TOTAL_WEEKS}`} />
                <StatCard label="Progress" value={`${pct.toFixed(2)}%`} valueClass={pct >= 93 ? 'text-emerald-600' : 'text-blue-600'} />
            </div>
            <div>
                <div className="text-xs text-slate-500 mb-1">Progress Bar</div>
                <ProgressBar value={pct} colorClass={barColor} height="h-2" />
            </div>
        </div>
    );
}
