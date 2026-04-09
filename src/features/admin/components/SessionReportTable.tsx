import { CheckCircle, XCircle, CalendarClock } from "lucide-react";
import type { Meeting } from "../../../types/Meeting";
import type { User } from "../../../types/User";
import { Card } from "../../../components/ui/card";
import { Badge } from "../../../components/ui/badge";
import { Button } from "../../../components/ui/button";
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "../../../components/ui/table";

interface SessionReportTableProps {
    meetings: Meeting[];
    buddies: User[];
    participants: User[];
    hasFilters: boolean;
    onComplete: (meeting: Meeting) => void;
    onCancel: (meeting: Meeting) => void;
}

const statusConfig = {
    scheduled: { label: "Scheduled", cls: "bg-blue-50 text-blue-600 border-blue-200" },
    completed: { label: "Completed", cls: "bg-emerald-50 text-emerald-700 border-emerald-200" },
    canceled:  { label: "Canceled",  cls: "bg-red-50 text-red-500 border-red-200" },
};

export function SessionReportTable({
    meetings,
    buddies,
    participants,
    hasFilters,
    onComplete,
    onCancel,
}: SessionReportTableProps) {
    if (meetings.length === 0) {
        return (
            <Card className="bg-white/90 border-blue-100 shadow-md py-10 text-center">
                <CalendarClock className="mx-auto mb-2 text-slate-300" size={32} />
                <p className="text-slate-400 text-sm">
                    {hasFilters ? "No meetings match the selected filters." : "No meetings have been scheduled yet."}
                </p>
            </Card>
        );
    }

    return (
        <Card className="bg-white/90 border-blue-100 shadow-md overflow-hidden">
            <div className="overflow-x-auto">
                <Table className="text-sm">
                    <TableHeader>
                        <TableRow className="bg-blue-50/60 hover:bg-blue-50/60">
                            {["Date & Time", "Buddy", "Participant", "Topic", "Status", "Actions"].map(h => (
                                <TableHead key={h} className="text-blue-600 font-semibold text-xs px-3 py-2 whitespace-nowrap">
                                    {h}
                                </TableHead>
                            ))}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {meetings.map(m => {
                            const buddy = buddies.find(b => b.id === m.buddyId);
                            const partNames = m.participants
                                .map(pid => participants.find(p => p.id === pid)?.name || "Unknown")
                                .join(", ");
                            const isCanceled = m.status === "canceled";
                            const cfg = statusConfig[m.status] ?? statusConfig.scheduled;

                            return (
                                <TableRow
                                    key={m.id}
                                    className={`border-b border-slate-100 last:border-0 hover:bg-blue-50/20 ${isCanceled ? "opacity-50" : ""}`}
                                >
                                    <TableCell className="px-3 py-2 whitespace-nowrap">
                                        <div className="font-semibold text-slate-800 text-xs">{m.start.split(" ")[0]}</div>
                                        <div className="text-[0.7rem] text-slate-400">{m.start.split(" ")[1]} – {m.end.split(" ")[1]}</div>
                                    </TableCell>
                                    <TableCell className="px-3 py-2 font-medium text-slate-800 whitespace-nowrap">{buddy?.name ?? "—"}</TableCell>
                                    <TableCell className="px-3 py-2 text-slate-700 max-w-[120px] truncate">{partNames}</TableCell>
                                    <TableCell className="px-3 py-2">
                                        <span className="text-xs text-slate-500 max-w-[130px] truncate block" title={m.topic ?? ""}>
                                            {m.topic ? `"${m.topic}"` : <span className="italic opacity-50">—</span>}
                                        </span>
                                    </TableCell>
                                    <TableCell className="px-3 py-2">
                                        <Badge className={`text-[0.65rem] font-semibold uppercase px-2 py-0.5 rounded-full border ${cfg.cls}`}>
                                            {cfg.label}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="px-3 py-2">
                                        {m.status === "scheduled" && (
                                            <div className="flex items-center gap-1.5">
                                                <Button
                                                    size="xs"
                                                    onClick={() => onComplete(m)}
                                                    className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 cursor-pointer"
                                                    variant="outline"
                                                >
                                                    <CheckCircle size={11} /> Complete
                                                </Button>
                                                <Button
                                                    size="xs"
                                                    onClick={() => onCancel(m)}
                                                    className="bg-red-50 hover:bg-red-100 text-red-500 border border-red-200 cursor-pointer"
                                                    variant="outline"
                                                >
                                                    <XCircle size={11} /> Cancel
                                                </Button>
                                            </div>
                                        )}
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </div>
        </Card>
    );
}
