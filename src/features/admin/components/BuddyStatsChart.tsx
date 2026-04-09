import { BarChart3 } from "lucide-react";
import { BUDDY_BG_COLORS } from "../../../shared/constants";

interface BuddyStat {
    name: string;
    sessions: number;
}

interface BuddyStatsChartProps {
    stats: BuddyStat[];
}

export function BuddyStatsChart({ stats }: BuddyStatsChartProps) {
    const sorted = [...stats].sort((a, b) =>
        b.sessions !== a.sessions ? b.sessions - a.sessions : a.name.localeCompare(b.name)
    );
    const maxSessions = Math.max(1, ...sorted.map(s => s.sessions));

    return (
        <div className="bg-white/90 border border-blue-100 rounded-2xl shadow-md shadow-blue-100/30 p-4 sm:p-6 animate-fade-in">
            <div className="flex items-center gap-2 mb-4">
                <BarChart3 size={18} className="text-blue-600" />
                <h2 className="text-base sm:text-lg font-semibold text-slate-800">Buddy Session Statistics</h2>
            </div>
            <div className="flex flex-col gap-3 p-3 border border-blue-100 rounded-xl bg-gradient-to-b from-blue-50/40 to-transparent">
                {sorted.map((stat, index) => {
                    const barWidth = (stat.sessions / maxSessions) * 100;
                    return (
                        <div key={stat.name} className="flex items-center gap-3 min-w-0">
                            <div className="w-24 sm:w-40 shrink-0">
                                <div className="text-xs font-bold text-slate-700 uppercase tracking-wide truncate">
                                    {stat.name}
                                </div>
                                <div className="text-[0.65rem] text-slate-400">{stat.sessions} sessions</div>
                            </div>
                            <div className="relative flex-1 h-6 bg-slate-100 rounded-lg overflow-hidden">
                                {stat.sessions > 0 && (
                                    <div
                                        className={`h-full rounded-lg ${BUDDY_BG_COLORS[index % BUDDY_BG_COLORS.length]} transition-all`}
                                        style={{ width: `${Math.max(barWidth, 3)}%` }}
                                    />
                                )}
                                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-600">
                                    {stat.sessions}
                                </span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
