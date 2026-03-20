import { useEffect, useState, type ReactNode } from "react";
import { useAuth } from "../hooks/useAuth";
import { useData } from "../hooks/useData";
import { MeetingTable } from "../components/MeetingTable";
import { CalendarMonthView } from "../components/CalendarMonthView";
import { Users as UsersIcon, Award, Clock, X, CheckCircle, Download, Filter, ChevronRight } from "lucide-react";
import type { Meeting } from "../types/Meeting";

const TOTAL_WEEKS = 28;

function exportCSV(rows: string[][], filename: string) {
    const csv = rows.map(r => r.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = filename; a.click();
    URL.revokeObjectURL(url);
}

/* ── Sub-components ── */

function Modal({ children, onClose, maxWidth = "max-w-md" }: { children: ReactNode; onClose: () => void; maxWidth?: string }) {
    return (
        <div className="fixed inset-0 bg-black/55 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className={`relative bg-white/95 backdrop-blur-md border border-blue-100 rounded-2xl shadow-2xl w-full ${maxWidth} p-6 animate-fade-in`} onClick={e => e.stopPropagation()}>
                <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 cursor-pointer transition-colors"><X size={20} /></button>
                {children}
            </div>
        </div>
    );
}

function Toast({ message, type }: { message: string; type: "success" | "info" }) {
    return (
        <div className={`fixed top-5 right-5 z-[1200] max-w-sm w-full px-4 py-3 rounded-xl border font-semibold text-sm text-white shadow-xl animate-fade-in
            ${type === 'success' ? 'bg-emerald-600/95 border-emerald-500/30' : 'bg-blue-600/95 border-blue-500/30'}`}>
            {message}
        </div>
    );
}

/* ── AdminDashboard ── */

export function AdminDashboard() {
    const { user } = useAuth();
    const { availabilities, users, requests, meetings, sessionLogs, createMeeting, cancelMeeting, cancelRequest, completeMeeting } = useData();
    const [cancelMeetingTarget, setCancelMeetingTarget] = useState<Meeting | null>(null);
    const [cancelRequestTarget, setCancelRequestTarget] = useState<{ id: string; participantName: string; slotDate: string } | null>(null);
    const [completeMeetingTarget, setCompleteMeetingTarget] = useState<Meeting | null>(null);
    const [adminTab, setAdminTab] = useState<"overview" | "participants" | "report">("overview");
    const [filterDate, setFilterDate] = useState("");
    const [filterWeek, setFilterWeek] = useState("");
    const [filterBuddy, setFilterBuddy] = useState("");
    const [filterParticipant, setFilterParticipant] = useState("");
    const [filterStatus, setFilterStatus] = useState("");
    const [selectedParticipantId, setSelectedParticipantId] = useState<string | null>(null);
    const [toast, setToast] = useState<{ message: string; type: "success" | "info" } | null>(null);

    if (!user) return null;

    const buddies = users.filter(u => u.role === "buddy");
    const participants = users.filter(u => u.role === "participant");

    useEffect(() => {
        if (!toast) return;
        const timeout = setTimeout(() => setToast(null), 2600);
        return () => clearTimeout(timeout);
    }, [toast]);

    const buddyStats = buddies.map(buddy => ({
        name: buddy.name,
        sessions: sessionLogs.filter(log => log.buddyId === buddy.id).length,
    }));

    const handleCreateMeeting = async (availabilityId: string, buddyId: string, partIds: string[]) => {
        await createMeeting(availabilityId, buddyId, partIds);
        setToast({ message: "Meeting created successfully", type: "success" });
    };

    const handleCancelMeetingConfirm = async () => {
        if (cancelMeetingTarget) {
            await cancelMeeting(cancelMeetingTarget.id);
            setCancelMeetingTarget(null);
            setToast({ message: "Meeting canceled", type: "info" });
        }
    };

    const handleCancelRequestClick = (requestId: string) => {
        const req = requests.find(r => r.id === requestId);
        if (!req) return;
        const slot = availabilities.find(a => a.id === req.availabilityId);
        const participant = participants.find(p => p.id === req.participantId);
        const slotLabel = slot ? `${new Date(slot.date).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })} ${slot.start}–${slot.end}` : 'Unknown slot';
        setCancelRequestTarget({ id: requestId, participantName: participant?.name || 'Unknown', slotDate: slotLabel });
    };

    const handleCancelRequestConfirm = async () => {
        if (cancelRequestTarget) {
            await cancelRequest(cancelRequestTarget.id);
            setCancelRequestTarget(null);
            setToast({ message: "Request canceled", type: "info" });
        }
    };

    const handleCompleteConfirm = async () => {
        if (completeMeetingTarget) {
            await completeMeeting(completeMeetingTarget.id);
            setCompleteMeetingTarget(null);
            setToast({ message: "Meeting marked completed", type: "success" });
        }
    };

    const handleExportCSV = () => {
        const weekHeaders = Array.from({ length: TOTAL_WEEKS }, (_, i) => `Week${i + 1}`);
        const headers = ["No.", "Name", "Attendance %", "Sessions Completed", ...weekHeaders, "Status"];
        const rows = participants.map((p, idx) => {
            const pMeetings = meetings.filter(m => m.participants.includes(p.id) && m.status === 'completed').sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());
            const completed = pMeetings.length;
            const pct = Math.round((completed / TOTAL_WEEKS) * 10000) / 100;
            const weekCells = Array.from({ length: TOTAL_WEEKS }, (_, wi) => {
                const m = pMeetings[wi];
                if (m) { const dateStr = m.start.split(' ')[0]; return m.topic ? `${dateStr} - ${m.topic}` : dateStr; }
                return wi < completed ? '' : 'No Reason';
            });
            const status = pct >= 93 ? 'Hit Target' : pct >= 80 ? 'Good' : pct >= 50 ? 'Needs Improvement' : 'At Risk';
            return [String(idx + 1), p.name, `${pct}%`, String(completed), ...weekCells, status];
        });
        const totalParticipants = participants.length;
        const avgAttendance = totalParticipants > 0 ? Math.round(participants.reduce((sum, p) => {
            const c = meetings.filter(m => m.participants.includes(p.id) && m.status === 'completed').length;
            return sum + (c / TOTAL_WEEKS) * 100;
        }, 0) / totalParticipants) : 0;
        const hitTarget = participants.filter(p => { const c = meetings.filter(m => m.participants.includes(p.id) && m.status === 'completed').length; return (c / TOTAL_WEEKS) * 100 >= 93; }).length;
        const needsImprovement = participants.filter(p => { const c = meetings.filter(m => m.participants.includes(p.id) && m.status === 'completed').length; return (c / TOTAL_WEEKS) * 100 < 80; }).length;
        const emptyWeeks = Array(TOTAL_WEEKS).fill('');
        const summaryRows = [
            ['', '', '', '', ...emptyWeeks, ''],
            ['', 'Total Participants', String(totalParticipants), '', ...emptyWeeks, ''],
            ['', 'Average Attendance', `${avgAttendance}%`, '', ...emptyWeeks, ''],
            ['', 'Hit Target (≥93%)', String(hitTarget), '', ...emptyWeeks, ''],
            ['', 'Needs Improvement (<80%)', String(needsImprovement), '', ...emptyWeeks, ''],
        ];
        exportCSV([headers, ...rows, ...summaryRows], `ATS-ECC-Attendance-${new Date().toISOString().split("T")[0]}.csv`);
    };

    const tabBtn = (id: typeof adminTab, label: string, icon: ReactNode) => (
        <button
            onClick={() => setAdminTab(id)}
            className={`inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-lg transition-all cursor-pointer border-none
                ${adminTab === id ? "bg-blue-600 text-white" : "bg-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-100"}`}
        >{icon}{label}</button>
    );

    return (
        <div className="py-6 flex flex-col gap-6 font-[Inter,sans-serif]">

            {/* Tabs */}
            <div className="bg-white/85 backdrop-blur-md border border-blue-100 rounded-2xl shadow-md shadow-blue-100/30 px-4 py-2 animate-fade-in">
                <div className="flex gap-1 flex-wrap">
                    {tabBtn("overview", "Overview", <Award size={14} />)}
                    {tabBtn("participants", "Participants", <UsersIcon size={14} />)}
                    {tabBtn("report", "Session Report", <Clock size={14} />)}
                </div>
            </div>

            {/* ── OVERVIEW ── */}
            {adminTab === "overview" && (
                <>
                    <div className="animate-fade-in">
                        <h2 className="text-lg font-semibold text-slate-800 mb-1">Pending Meeting Requests</h2>
                        <p className="text-sm text-slate-500 mb-4">Match buddies with participants who have requested slots.</p>
                        <MeetingTable
                            slots={availabilities} buddies={buddies} participants={participants}
                            requests={requests} onCreateMeeting={handleCreateMeeting} onCancelRequest={handleCancelRequestClick}
                        />
                    </div>

                    {/* Buddy Availability Calendar */}
                    <div className="animate-fade-in">
                        <div className="flex justify-between items-center mb-3 flex-wrap gap-2">
                            <h2 className="text-lg font-semibold text-slate-800">Buddy Availability Calendar</h2>
                            <div className="flex gap-3 flex-wrap">
                                {buddies.map((b, i) => {
                                    const colors = ['bg-blue-500', 'bg-emerald-500', 'bg-amber-500', 'bg-violet-500', 'bg-pink-500'];
                                    return (
                                        <div key={b.id} className="flex items-center gap-1.5 text-xs text-slate-500">
                                            <span className={`w-2.5 h-2.5 rounded-full ${colors[i % colors.length]}`} />
                                            {b.name}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                        <CalendarMonthView
                            slots={availabilities}
                            renderSlot={(slot) => {
                                const buddyIndex = buddies.findIndex(b => b.id === slot.buddyId);
                                const bgColors = ['bg-blue-50 border-blue-300 text-blue-600', 'bg-emerald-50 border-emerald-300 text-emerald-700', 'bg-amber-50 border-amber-300 text-amber-700', 'bg-violet-50 border-violet-300 text-violet-700', 'bg-pink-50 border-pink-300 text-pink-700'];
                                const color = slot.booked ? 'bg-emerald-50 border-emerald-300 text-emerald-700' : (bgColors[buddyIndex % bgColors.length] ?? bgColors[0]);
                                const buddy = buddies[buddyIndex];
                                return (
                                    <div
                                        className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-[0.64rem] font-medium whitespace-nowrap border ${color}`}
                                        title={`${buddy?.name || 'Buddy'} – ${slot.start}–${slot.end}${slot.booked ? ' (Booked)' : ''}`}
                                    >
                                        <Clock size={8} />
                                        <span className="overflow-hidden text-ellipsis">{slot.start} {buddy?.name?.split(' ')[0]}</span>
                                    </div>
                                );
                            }}
                        />
                    </div>

                    {/* Buddy Session Statistics */}
                    <div className="bg-white/85 border border-blue-100 rounded-2xl shadow-md shadow-blue-100/30 p-6 animate-fade-in">
                        <h2 className="text-lg font-semibold text-slate-800 mb-4">Buddy Session Statistics</h2>
                        {(() => {
                            const sorted = [...buddyStats].sort((a, b) => b.sessions !== a.sessions ? b.sessions - a.sessions : a.name.localeCompare(b.name));
                            const maxSessions = Math.max(1, ...sorted.map(s => s.sessions));
                            const barColors = ['bg-blue-500', 'bg-emerald-500', 'bg-amber-500', 'bg-violet-500', 'bg-pink-500', 'bg-cyan-500'];
                            return (
                                <div className="flex flex-col gap-3 p-3 border border-blue-100 rounded-xl bg-gradient-to-b from-blue-50/50 to-transparent">
                                    {sorted.map((stat, index) => {
                                        const barWidth = (stat.sessions / maxSessions) * 100;
                                        return (
                                            <div key={stat.name} className="grid grid-cols-[160px_1fr] items-center gap-3">
                                                <div>
                                                    <div className="text-xs font-bold text-slate-700 uppercase tracking-wide">{stat.name}</div>
                                                    <div className="text-xs text-slate-400">{stat.sessions} sessions</div>
                                                </div>
                                                <div className="relative h-6 bg-slate-100 rounded-lg overflow-hidden">
                                                    {stat.sessions > 0 && (
                                                        <div className={`h-full rounded-lg ${barColors[index % barColors.length]} transition-all`} style={{ width: `${Math.max(barWidth, 3)}%` }} />
                                                    )}
                                                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-600">{stat.sessions}</span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            );
                        })()}
                    </div>
                </>
            )}

            {/* ── PARTICIPANTS ── */}
            {adminTab === "participants" && (
                <div className="animate-fade-in">
                    <div className="flex justify-between items-center mb-4">
                        <div>
                            <h2 className="text-lg font-semibold text-slate-800">Participant Records</h2>
                            <p className="text-sm text-slate-500 mt-0.5">Open a participant card to view full details and session table.</p>
                        </div>
                        <button className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors cursor-pointer" onClick={handleExportCSV}>
                            <Download size={15} /> Export CSV
                        </button>
                    </div>
                    <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-4">
                        {participants.map(p => {
                            const completed = meetings.filter(m => m.participants.includes(p.id) && m.status === 'completed').length;
                            const pct = Math.round((completed / TOTAL_WEEKS) * 10000) / 100;
                            const statusBadge = pct >= 93
                                ? <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">🎯 Hit Target</span>
                                : pct >= 80
                                ? <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">Good</span>
                                : pct >= 50
                                ? <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">⚠ Needs Improvement</span>
                                : completed > 0
                                ? <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-full">At Risk</span>
                                : null;
                            const barColor = pct >= 80 ? "bg-emerald-500" : pct >= 50 ? "bg-amber-400" : "bg-red-400";
                            return (
                                <div key={p.id} className="bg-white/85 border border-blue-100 rounded-2xl shadow-md p-5 cursor-pointer hover:border-blue-300 hover:shadow-lg transition-all" onClick={() => setSelectedParticipantId(p.id)}>
                                    <div className="flex justify-between items-center mb-3">
                                        <h3 className="font-semibold text-slate-800 flex items-center gap-1.5"><UsersIcon size={16} /> {p.name}</h3>
                                        <ChevronRight size={18} className="text-blue-400" />
                                    </div>
                                    <div className="flex gap-5 mb-3 text-sm">
                                        <div className="text-center">
                                            <div className="text-xl font-bold text-blue-600">{completed}<span className="text-xs font-medium text-slate-400">/{TOTAL_WEEKS}</span></div>
                                            <div className="text-xs text-slate-400">Sessions</div>
                                        </div>
                                        <div className="text-center">
                                            <div className={`text-xl font-bold ${pct >= 93 ? "text-emerald-600" : pct >= 50 ? "text-amber-600" : "text-red-500"}`}>{pct}%</div>
                                            <div className="text-xs text-slate-400">Attendance</div>
                                        </div>
                                        <div className="flex items-center">{statusBadge}</div>
                                    </div>
                                    <div className="h-1.5 bg-blue-50 rounded-full overflow-hidden">
                                        <div className={`h-full ${barColor} rounded-full transition-all`} style={{ width: `${pct}%` }} />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* ── SESSION REPORT ── */}
            {adminTab === "report" && (() => {
                const getWeekNum = (dateStr: string) => {
                    const d = new Date(dateStr);
                    const jan4 = new Date(d.getFullYear(), 0, 4);
                    const dayDiff = (d.getTime() - jan4.getTime()) / 86400000;
                    return Math.ceil((dayDiff + jan4.getDay() + 1) / 7);
                };
                const weekOptions = [...new Set(meetings.map(m => getWeekNum(m.start.split(' ')[0])))].sort((a, b) => a - b);
                const filteredMeetings = meetings.filter(m => {
                    const dateStr = m.start.split(' ')[0];
                    if (filterDate && dateStr !== filterDate) return false;
                    if (filterWeek && getWeekNum(dateStr) !== parseInt(filterWeek)) return false;
                    if (filterBuddy && m.buddyId !== filterBuddy) return false;
                    if (filterParticipant && !m.participants.includes(filterParticipant)) return false;
                    if (filterStatus && m.status !== filterStatus) return false;
                    return true;
                }).sort((a, b) => new Date(b.start).getTime() - new Date(a.start).getTime());
                const hasFilters = filterDate || filterWeek || filterBuddy || filterParticipant || filterStatus;
                const selCls = "px-3 py-1.5 text-sm border border-slate-200 rounded-lg bg-white text-slate-700 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition cursor-pointer";

                return (
                    <div className="animate-fade-in">
                        <div className="flex justify-between items-center mb-3">
                            <h2 className="text-lg font-semibold text-slate-800">Session Report</h2>
                            {hasFilters && (
                                <button className="px-3 py-1 text-xs bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg transition-colors cursor-pointer"
                                    onClick={() => { setFilterDate(''); setFilterWeek(''); setFilterBuddy(''); setFilterParticipant(''); setFilterStatus(''); }}>
                                    Clear Filters
                                </button>
                            )}
                        </div>
                        {/* Filter bar */}
                        <div className="bg-white/85 border border-blue-100 rounded-xl shadow-sm px-4 py-3 mb-4 flex gap-2 flex-wrap items-center">
                            <Filter size={14} className="text-slate-400" />
                            <input type="date" value={filterDate} onChange={e => setFilterDate(e.target.value)} className={selCls} title="Filter by date" />
                            <select value={filterWeek} onChange={e => setFilterWeek(e.target.value)} className={selCls}>
                                <option value="">All Weeks</option>
                                {weekOptions.map(w => <option key={w} value={w}>Week {w}</option>)}
                            </select>
                            <select value={filterBuddy} onChange={e => setFilterBuddy(e.target.value)} className={selCls}>
                                <option value="">All Buddies</option>
                                {buddies.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                            </select>
                            <select value={filterParticipant} onChange={e => setFilterParticipant(e.target.value)} className={selCls}>
                                <option value="">All Participants</option>
                                {participants.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                            </select>
                            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className={selCls}>
                                <option value="">All Statuses</option>
                                <option value="scheduled">Scheduled</option>
                                <option value="completed">Completed</option>
                                <option value="canceled">Canceled</option>
                            </select>
                        </div>

                        {filteredMeetings.length === 0 ? (
                            <div className="bg-white/85 border border-blue-100 rounded-2xl shadow-md py-12 text-center text-slate-400 text-sm">
                                {hasFilters ? 'No meetings match the selected filters.' : 'No meetings have been scheduled yet.'}
                            </div>
                        ) : (
                            <div className="bg-white/85 border border-blue-100 rounded-2xl shadow-md overflow-x-auto">
                                <table className="w-full text-sm text-left border-collapse">
                                    <thead>
                                        <tr>
                                            {["Date & Time", "Buddy", "Participant", "Topic / Note", "Status", "Actions"].map(h => (
                                                <th key={h} className="px-4 py-3 bg-blue-50/60 text-blue-600 font-semibold border-b border-blue-100">{h}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredMeetings.map(m => {
                                            const buddy = buddies.find(b => b.id === m.buddyId);
                                            const partNames = m.participants.map(pid => participants.find(p => p.id === pid)?.name || "Unknown").join(", ");
                                            const isCompleted = m.status === 'completed';
                                            const isCanceled = m.status === 'canceled';
                                            return (
                                                <tr key={m.id} className={`border-b border-slate-100 last:border-0 hover:bg-blue-50/20 ${isCanceled ? "opacity-50" : ""}`}>
                                                    <td className="px-4 py-3">
                                                        <div className="flex flex-col gap-0.5">
                                                            <span className="font-semibold text-slate-800">{m.start.split(' ')[0]}</span>
                                                            <span className="text-xs text-slate-400">{m.start.split(' ')[1]} - {m.end.split(' ')[1]}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3 font-medium text-slate-800">{buddy?.name}</td>
                                                    <td className="px-4 py-3 text-slate-700">{partNames}</td>
                                                    <td className="px-4 py-3">
                                                        <div className="text-xs text-slate-500 max-w-[140px] truncate" title={m.topic}>{m.topic ? `"${m.topic}"` : "-"}</div>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold uppercase
                                                            ${isCompleted ? "bg-emerald-50 text-emerald-700" : isCanceled ? "bg-red-50 text-red-500" : "bg-blue-50 text-blue-600"}`}>
                                                            {m.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        {m.status === 'scheduled' && (
                                                            <div className="flex gap-2">
                                                                <button onClick={() => setCompleteMeetingTarget(m)} className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-md transition-colors cursor-pointer">
                                                                    <CheckCircle size={11} /> Complete
                                                                </button>
                                                                <button onClick={() => setCancelMeetingTarget(m)} className="px-2 py-1 text-xs bg-red-50 hover:bg-red-100 text-red-500 border border-red-200 rounded-md transition-colors cursor-pointer">
                                                                    Cancel
                                                                </button>
                                                            </div>
                                                        )}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                );
            })()}

            {/* ── COMPLETE MEETING MODAL ── */}
            {completeMeetingTarget && (() => {
                const m = completeMeetingTarget;
                const buddy = buddies.find(b => b.id === m.buddyId);
                const partNames = m.participants.map(pid => participants.find(p => p.id === pid)?.name || "Unknown").join(", ");
                return (
                    <Modal onClose={() => setCompleteMeetingTarget(null)}>
                        <h3 className="flex items-center gap-2 text-lg font-semibold text-emerald-600 mb-2"><CheckCircle size={20} /> Mark Session Complete?</h3>
                        <p className="text-sm text-slate-500 mb-2">Confirming this session will:</p>
                        <ul className="list-disc pl-5 text-sm text-slate-500 mb-3 leading-loose">
                            <li>Mark the meeting as <strong className="text-slate-700">Completed</strong></li>
                            <li>Add <strong className="text-slate-700">+1 point</strong> to each participant's score</li>
                            <li>Record a session log entry</li>
                        </ul>
                        <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 mb-5 text-sm flex flex-col gap-1">
                            <div><span className="text-slate-500">Date:</span> <strong>{m.start.split(' ')[0]}</strong> at <strong>{m.start.split(' ')[1]}–{m.end.split(' ')[1]}</strong></div>
                            <div><span className="text-slate-500">Buddy:</span> <strong>{buddy?.name}</strong></div>
                            <div><span className="text-slate-500">Participant:</span> <strong>{partNames}</strong></div>
                        </div>
                        <div className="flex gap-3 justify-end">
                            <button className="px-4 py-2 text-sm bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg cursor-pointer" onClick={() => setCompleteMeetingTarget(null)}>Cancel</button>
                            <button className="inline-flex items-center gap-2 px-4 py-2 text-sm bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg cursor-pointer" onClick={handleCompleteConfirm}>
                                <CheckCircle size={14} /> Yes, Mark Complete
                            </button>
                        </div>
                    </Modal>
                );
            })()}

            {/* ── CANCEL REQUEST MODAL ── */}
            {cancelRequestTarget && (
                <Modal onClose={() => setCancelRequestTarget(null)}>
                    <h3 className="text-lg font-semibold text-red-500 mb-2">Cancel Meeting Request</h3>
                    <p className="text-sm text-slate-500 mb-2 leading-relaxed">
                        Cancel the request from <strong className="text-slate-700">{cancelRequestTarget.participantName}</strong> for:
                    </p>
                    <p className="bg-blue-50 border border-blue-100 px-3 py-2 rounded-lg mb-5 text-sm font-medium">{cancelRequestTarget.slotDate}</p>
                    <p className="text-xs text-slate-400 mb-5">The slot will become available again.</p>
                    <div className="flex gap-3 justify-end">
                        <button className="px-4 py-2 text-sm bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg cursor-pointer" onClick={() => setCancelRequestTarget(null)}>Keep Request</button>
                        <button className="px-4 py-2 text-sm bg-red-600 hover:bg-red-700 text-white rounded-lg cursor-pointer" onClick={handleCancelRequestConfirm}>Yes, Cancel Request</button>
                    </div>
                </Modal>
            )}

            {/* ── CANCEL MEETING MODAL ── */}
            {cancelMeetingTarget && (() => {
                const m = cancelMeetingTarget;
                const buddy = buddies.find(b => b.id === m.buddyId);
                const partNames = m.participants.map(pid => participants.find(p => p.id === pid)?.name || "Unknown").join(", ");
                return (
                    <Modal onClose={() => setCancelMeetingTarget(null)}>
                        <h3 className="text-lg font-semibold text-red-500 mb-2">Cancel Scheduled Meeting</h3>
                        <p className="text-sm text-slate-500 mb-3">Are you sure you want to cancel this meeting?</p>
                        <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 mb-5 text-sm flex flex-col gap-1">
                            <div><span className="text-slate-500">Date:</span> <strong>{m.start.split(' ')[0]}</strong> at <strong>{m.start.split(' ')[1]}–{m.end.split(' ')[1]}</strong></div>
                            <div><span className="text-slate-500">Buddy:</span> <strong>{buddy?.name}</strong></div>
                            <div><span className="text-slate-500">Participant:</span> <strong>{partNames}</strong></div>
                        </div>
                        <div className="flex gap-3 justify-end">
                            <button className="px-4 py-2 text-sm bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg cursor-pointer" onClick={() => setCancelMeetingTarget(null)}>Keep Meeting</button>
                            <button className="px-4 py-2 text-sm bg-red-600 hover:bg-red-700 text-white rounded-lg cursor-pointer" onClick={handleCancelMeetingConfirm}>Yes, Cancel Meeting</button>
                        </div>
                    </Modal>
                );
            })()}

            {/* ── PARTICIPANT DETAIL MODAL ── */}
            {selectedParticipantId && (() => {
                const participant = participants.find(p => p.id === selectedParticipantId);
                if (!participant) return null;
                const participantMeetings = meetings.filter(m => m.participants.includes(participant.id)).sort((a, b) => new Date(b.start).getTime() - new Date(a.start).getTime());
                const completedSessions = participantMeetings.filter(m => m.status === 'completed').length;
                const progress = Math.round((completedSessions / TOTAL_WEEKS) * 10000) / 100;
                const barColor = progress >= 80 ? "bg-emerald-500" : progress >= 50 ? "bg-amber-400" : "bg-red-400";
                return (
                    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[60] p-4" onClick={() => setSelectedParticipantId(null)}>
                        <div className="relative bg-white/95 backdrop-blur-md border border-blue-100 rounded-2xl shadow-2xl w-full max-w-2xl p-6 animate-fade-in max-h-[88vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                            <button onClick={() => setSelectedParticipantId(null)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 cursor-pointer"><X size={20} /></button>
                            <h2 className="text-lg font-semibold text-slate-800 mb-4">{participant.name} Details</h2>
                            {/* Stats */}
                            <div className="grid grid-cols-3 gap-3 mb-4">
                                {[{ label: "Name", value: participant.name }, { label: "Sessions", value: `${completedSessions}/${TOTAL_WEEKS}` }, { label: "Progress", value: `${progress}%` }].map(s => (
                                    <div key={s.label} className="bg-blue-50 border border-blue-100 rounded-xl p-3">
                                        <div className="text-xs text-slate-400 mb-0.5">{s.label}</div>
                                        <div className="font-bold text-slate-800">{s.value}</div>
                                    </div>
                                ))}
                            </div>
                            {/* Progress bar */}
                            <div className="mb-5">
                                <div className="text-xs text-slate-400 mb-1">Progress Bar</div>
                                <div className="h-2 bg-blue-50 rounded-full overflow-hidden">
                                    <div className={`h-full ${barColor} rounded-full transition-all`} style={{ width: `${progress}%` }} />
                                </div>
                            </div>
                            <h3 className="font-semibold text-slate-700 mb-3 text-sm">Session Table of Contents</h3>
                            {participantMeetings.length === 0 ? (
                                <div className="italic text-slate-400 text-sm text-center py-4">No meetings found for this participant.</div>
                            ) : (
                                <div className="overflow-x-auto border border-blue-100 rounded-xl">
                                    <table className="w-full text-sm border-collapse">
                                        <thead>
                                            <tr>
                                                {["Topic", "Date", "Buddy", "Participant"].map(h => (
                                                    <th key={h} className="px-3 py-2.5 text-blue-600 font-semibold bg-blue-50/60 border-b border-blue-100 text-left">{h}</th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {participantMeetings.map(m => {
                                                const buddy = buddies.find(b => b.id === m.buddyId);
                                                const pNames = m.participants.map(pid => participants.find(p => p.id === pid)?.name || "Unknown").join(", ");
                                                return (
                                                    <tr key={m.id} className={`border-b border-slate-100 last:border-0 ${m.status === 'canceled' ? "opacity-50" : ""}`}>
                                                        <td className="px-3 py-2.5">{m.topic ? `"${m.topic}"` : <span className="text-slate-400">-</span>}</td>
                                                        <td className="px-3 py-2.5 text-slate-500">{m.start.split(' ')[0]}</td>
                                                        <td className="px-3 py-2.5 text-slate-600">{buddy?.name || "Unknown"}</td>
                                                        <td className="px-3 py-2.5 text-slate-600">{pNames}</td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                );
            })()}

            {/* Toast */}
            {toast && <Toast message={toast.message} type={toast.type} />}
        </div>
    );
}
