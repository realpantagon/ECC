import { Users as UsersIcon, ChevronRight } from "lucide-react";
import { TOTAL_WEEKS } from "../../../shared/constants";
import { getAttendancePct, getBarColor, getStatusBadgeClass, getStatusBadgeLabel } from "../../../shared/utils/attendanceUtils";
import { ProgressBar } from "../../../shared/components/ProgressBar";
import { Card, CardContent } from "../../../components/ui/card";
import { Badge } from "../../../components/ui/badge";
import type { Meeting } from "../../../types/Meeting";
import type { User } from "../../../types/User";

interface ParticipantGridProps {
    participants: User[];
    meetings: Meeting[];
    onSelectParticipant: (id: string) => void;
}

export function ParticipantGrid({ participants, meetings, onSelectParticipant }: ParticipantGridProps) {
    return (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-2">
            {participants.map(p => {
                const completed = meetings.filter(m => m.participants.includes(p.id) && m.status === 'completed').length;
                const pct = getAttendancePct(completed);
                const badgeLabel = getStatusBadgeLabel(pct, completed);
                const badgeClass = getStatusBadgeClass(pct);
                const barColor = getBarColor(pct);

                return (
                    <Card
                        key={p.id}
                        className="bg-white/85 border-blue-100 rounded-xl shadow-md p-0 cursor-pointer hover:border-blue-300 hover:shadow-lg transition-all"
                        onClick={() => onSelectParticipant(p.id)}
                    >
                        <CardContent className="p-3">
                            <div className="flex justify-between items-center mb-2">
                                <h3 className="font-semibold text-slate-800 flex items-center gap-1.5">
                                    <UsersIcon size={16} /> {p.name}
                                </h3>
                                <ChevronRight size={18} className="text-blue-400" />
                            </div>
                            <div className="flex gap-3 mb-2 text-sm">
                                <div className="text-center">
                                    <div className="text-base font-bold text-blue-600">
                                        {completed}<span className="text-xs font-medium text-slate-400">/{TOTAL_WEEKS}</span>
                                    </div>
                                    <div className="text-xs text-slate-400">Sessions</div>
                                </div>
                                <div className="text-center">
                                    <div className={`text-base font-bold ${pct >= 93 ? 'text-emerald-600' : pct >= 50 ? 'text-amber-600' : 'text-red-500'}`}>
                                        {pct}%
                                    </div>
                                    <div className="text-xs text-slate-400">Attendance</div>
                                </div>
                                {badgeLabel && (
                                    <div className="flex items-center">
                                        <Badge className={`text-xs font-bold px-2 py-0.5 rounded-full ${badgeClass}`}>
                                        {badgeLabel}
                                        </Badge>
                                    </div>
                                )}
                            </div>
                            <ProgressBar value={pct} colorClass={barColor} height="h-1.5" />
                        </CardContent>
                    </Card>
                );
            })}
        </div>
    );
}
