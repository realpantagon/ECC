import { User, TrendingUp, CalendarCheck } from "lucide-react";
import { TOTAL_WEEKS } from "../../../shared/constants";
import { ProgressBar } from "../../../shared/components/ProgressBar";
import { getAttendancePct, getBarColor } from "../../../shared/utils/attendanceUtils";
import { Card, CardContent } from "../../../components/ui/card";

interface ParticipantStatsProps {
    name: string;
    completedCount: number;
}

export function ParticipantStats({ name, completedCount }: ParticipantStatsProps) {
    const pct = getAttendancePct(completedCount);
    const barColor = getBarColor(pct);
    const pctColor = pct >= 93 ? "text-emerald-600" : pct >= 50 ? "text-amber-600" : "text-blue-600";

    return (
        <Card className="bg-white/90 border-blue-100 shadow-md shadow-blue-100/30">
            <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    {/* Name */}
                    <div className="flex items-center gap-2.5 flex-1 min-w-0">
                        <div className="p-2 bg-blue-50 rounded-xl border border-blue-100 shrink-0">
                            <User size={18} className="text-blue-600" />
                        </div>
                        <div className="min-w-0">
                            <div className="text-xs text-slate-500 font-medium">Participant</div>
                            <div className="font-bold text-slate-800 text-sm truncate">{name}</div>
                        </div>
                    </div>

                    <div className="hidden sm:block w-px h-10 bg-slate-100" />

                    {/* Sessions */}
                    <div className="flex items-center gap-2.5 shrink-0">
                        <div className="p-2 bg-emerald-50 rounded-xl border border-emerald-100 shrink-0">
                            <CalendarCheck size={18} className="text-emerald-600" />
                        </div>
                        <div>
                            <div className="text-xs text-slate-500 font-medium">Sessions</div>
                            <div className="font-bold text-slate-800 text-sm">
                                {completedCount}
                                <span className="text-xs font-normal text-slate-400">/{TOTAL_WEEKS}</span>
                            </div>
                        </div>
                    </div>

                    <div className="hidden sm:block w-px h-10 bg-slate-100" />

                    {/* Progress */}
                    <div className="flex items-center gap-2.5 shrink-0">
                        <div className="p-2 bg-indigo-50 rounded-xl border border-indigo-100 shrink-0">
                            <TrendingUp size={18} className="text-indigo-600" />
                        </div>
                        <div>
                            <div className="text-xs text-slate-500 font-medium">Attendance</div>
                            <div className={`font-bold text-sm ${pctColor}`}>{pct.toFixed(1)}%</div>
                        </div>
                    </div>
                </div>

                {/* Progress bar */}
                <div className="mt-4">
                    <div className="flex justify-between text-xs text-slate-400 mb-1">
                        <span>Progress</span>
                        <span>{completedCount}/{TOTAL_WEEKS} sessions</span>
                    </div>
                    <ProgressBar value={pct} colorClass={barColor} height="h-2" />
                </div>
            </CardContent>
        </Card>
    );
}
