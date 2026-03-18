import { useEffect, useState, type CSSProperties, type ReactNode } from "react";
import { useAuth } from "../hooks/useAuth";
import { useData } from "../hooks/useData";
import { MeetingTable } from "../components/MeetingTable";
import { CalendarMonthView } from "../components/CalendarMonthView";
import { Users as UsersIcon, Award, Clock, X, CheckCircle, Download, Filter, ChevronRight } from "lucide-react";
import type { Meeting } from "../types/Meeting";

const TOTAL_WEEKS = 28;

// ── CSV Export helper ──────────────────────────────────────────────────────────
function exportCSV(rows: string[][], filename: string) {
    const csv = rows.map(r => r.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = filename; a.click();
    URL.revokeObjectURL(url);
}

export function AdminDashboard() {
    const { user } = useAuth();
    const { availabilities, users, requests, meetings, sessionLogs, createMeeting, cancelMeeting, cancelRequest, completeMeeting } = useData();
    const [cancelMeetingTarget, setCancelMeetingTarget] = useState<Meeting | null>(null);
    const [cancelRequestTarget, setCancelRequestTarget] = useState<{ id: string; participantName: string; slotDate: string } | null>(null);
    const [completeMeetingTarget, setCompleteMeetingTarget] = useState<Meeting | null>(null);
    const [adminTab, setAdminTab] = useState<"overview" | "participants" | "report">("overview");
    // Session report filters
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

    const buddyStats = buddies.map(buddy => {
        const sessions = sessionLogs.filter(log => log.buddyId === buddy.id).length;
        return { name: buddy.name, sessions };
    });

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
        // Build weekly columns header
        const weekHeaders = Array.from({ length: TOTAL_WEEKS }, (_, i) => `Week${i + 1}`);
        const headers = ["No.", "Name", "Attendance %", "Sessions Completed", ...weekHeaders, "Status"];

        const rows = participants.map((p, idx) => {
            const pMeetings = meetings
                .filter(m => m.participants.includes(p.id) && m.status === 'completed')
                .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());
            const completed = pMeetings.length;
            const pct = Math.round((completed / TOTAL_WEEKS) * 10000) / 100; // 2 decimal

            // Fill weekly columns with date+topic or "No Reason"
            const weekCells = Array.from({ length: TOTAL_WEEKS }, (_, wi) => {
                const m = pMeetings[wi];
                if (m) {
                    const dateStr = m.start.split(' ')[0];
                    return m.topic ? `${dateStr} - ${m.topic}` : dateStr;
                }
                return wi < completed ? '' : 'No Reason';
            });

            const status = pct >= 93 ? 'Hit Target' : pct >= 80 ? 'Good' : pct >= 50 ? 'Needs Improvement' : 'At Risk';

            return [String(idx + 1), p.name, `${pct}%`, String(completed), ...weekCells, status];
        });

        // Summary rows
        const totalParticipants = participants.length;
        const avgAttendance = totalParticipants > 0
            ? Math.round(participants.reduce((sum, p) => {
                const c = meetings.filter(m => m.participants.includes(p.id) && m.status === 'completed').length;
                return sum + (c / TOTAL_WEEKS) * 100;
            }, 0) / totalParticipants)
            : 0;
        const hitTarget = participants.filter(p => {
            const c = meetings.filter(m => m.participants.includes(p.id) && m.status === 'completed').length;
            return (c / TOTAL_WEEKS) * 100 >= 93;
        }).length;
        const needsImprovement = participants.filter(p => {
            const c = meetings.filter(m => m.participants.includes(p.id) && m.status === 'completed').length;
            const pct = (c / TOTAL_WEEKS) * 100;
            return pct < 80;
        }).length;

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
            style={{
                padding: '0.5rem 1.1rem', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600,
                background: adminTab === id ? 'var(--accent-color)' : 'transparent',
                color: adminTab === id ? 'white' : 'var(--text-secondary)',
                display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.875rem', transition: 'all 0.2s'
            }}
        >{icon}{label}</button>
    );

    return (
        <div className="page-container">
            {/* Tab Navigation */}
            <div className="glass-panel animate-fade-in" style={{ padding: '0.5rem 1rem' }}>
                <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap' }}>
                    {tabBtn("overview", "Overview", <Award size={15} />)}
                    {tabBtn("participants", "Participants", <UsersIcon size={15} />)}
                    {tabBtn("report", "Session Report", <Clock size={15} />)}
                </div>
            </div>

            {/* ── OVERVIEW ── */}
            {adminTab === "overview" && (
                <>
                    

                    <div className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
                        <h2 style={{ marginBottom: '1rem' }}>Pending Meeting Requests</h2>
                        <p style={{ marginBottom: '1.5rem', color: 'var(--text-secondary)' }}>Match buddies with participants who have requested slots.</p>
                        <MeetingTable
                            slots={availabilities} buddies={buddies} participants={participants}
                            requests={requests} onCreateMeeting={handleCreateMeeting} onCancelRequest={handleCancelRequestClick}
                        />
                    </div>

                    {/* Buddy Availability Calendar (merged into overview) */}
                    <div className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                            <h2>Buddy Availability Calendar</h2>
                            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                                {buddies.map((b, i) => {
                                    const colors = ['#2563eb', '#059669', '#d97706', '#7c3aed', '#db2777'];
                                    return (
                                        <div key={b.id} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                            <span style={{ width: 10, height: 10, borderRadius: '50%', background: colors[i % colors.length], display: 'inline-block' }} />
                                            {b.name}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                        <div className="glass-panel" style={{ padding: '1rem' }}>
                            <CalendarMonthView
                                slots={availabilities}
                                renderSlot={(slot) => {
                                    const buddyIndex = buddies.findIndex(b => b.id === slot.buddyId);
                                    const colors = ['rgba(37,99,235,0.1)', 'rgba(5,150,105,0.1)', 'rgba(217,119,6,0.1)', 'rgba(124,58,237,0.1)', 'rgba(219,39,119,0.1)'];
                                    const borderColors = ['rgba(37,99,235,0.4)', 'rgba(5,150,105,0.4)', 'rgba(217,119,6,0.4)', 'rgba(124,58,237,0.4)', 'rgba(219,39,119,0.4)'];
                                    const textColors = ['#2563eb', '#059669', '#d97706', '#7c3aed', '#db2777'];
                                    const buddy = buddies[buddyIndex];
                                    return (
                                        <div
                                            className={`calendar-month-slot ${slot.booked ? 'booked' : ''}`}
                                            style={{
                                                backgroundColor: slot.booked ? 'rgba(5,150,105,0.12)' : colors[buddyIndex % colors.length],
                                                borderColor: slot.booked ? 'rgba(5,150,105,0.4)' : borderColors[buddyIndex % borderColors.length],
                                                color: slot.booked ? '#059669' : textColors[buddyIndex % textColors.length],
                                                cursor: 'default'
                                            }}
                                            title={`${buddy?.name || 'Buddy'} – ${slot.start}–${slot.end}${slot.booked ? ' (Booked)' : ''}`}
                                        >
                                            <Clock size={9} />
                                            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{slot.start} {buddy?.name?.split(' ')[0]}</span>
                                        </div>
                                    );
                                }}
                            />
                        </div>
                    </div>

                    <div className="glass-panel animate-fade-in" style={{ padding: '2rem' }}>
                        <h2 style={{ marginBottom: '1.5rem' }}>Buddy Session Statistics</h2>
                        {(() => {
                            const sortedBuddyStats = [...buddyStats].sort((a, b) => {
                                if (b.sessions !== a.sessions) return b.sessions - a.sessions;
                                return a.name.localeCompare(b.name);
                            });
                            const maxSessions = Math.max(1, ...sortedBuddyStats.map(s => s.sessions));
                            const barColors = ['#2563eb', '#059669', '#d97706', '#7c3aed', '#db2777', '#0891b2', '#4f46e5', '#16a34a'];
                            const xTicks = 5;

                            return (
                                <div
                                    style={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: '0.75rem',
                                        padding: '1.1rem',
                                        border: '1px solid rgba(37,99,235,0.12)',
                                        borderRadius: 'var(--radius-sm)',
                                        background: 'linear-gradient(180deg, rgba(37,99,235,0.06), rgba(37,99,235,0.02))'
                                    }}
                                >
                                    <div style={{ display: 'grid', gridTemplateColumns: '180px 1fr', alignItems: 'center', marginBottom: '0.35rem' }}>
                                        <div style={{ color: 'var(--text-secondary)', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Buddy</div>
                                        <div style={{ color: 'var(--text-secondary)', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Sessions</div>
                                    </div>

                                    {sortedBuddyStats.map((stat, index) => {
                                        const barWidth = (stat.sessions / maxSessions) * 100;
                                        const color = barColors[index % barColors.length];

                                        return (
                                            <div key={stat.name} style={{ display: 'grid', gridTemplateColumns: '180px 1fr', alignItems: 'center', gap: '0.75rem' }}>
                                                <div>
                                                    <div style={{ color: 'var(--text-primary)', fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{stat.name}</div>
                                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{stat.sessions} sessions</div>
                                                </div>

                                                <div style={{ position: 'relative', height: '28px', borderRadius: '8px', background: 'rgba(148,163,184,0.12)', overflow: 'hidden' }}>
                                                    <div
                                                        style={{
                                                            position: 'absolute',
                                                            inset: 0,
                                                            backgroundImage: 'repeating-linear-gradient(to right, transparent, transparent calc(20% - 1px), rgba(100,116,139,0.25) calc(20% - 1px), rgba(100,116,139,0.25) 20%)',
                                                            pointerEvents: 'none'
                                                        }}
                                                    />
                                                    {stat.sessions > 0 && (
                                                        <div style={{ height: '100%', width: `${Math.max(barWidth, 3)}%`, borderRadius: '8px', background: `linear-gradient(90deg, ${color}, ${color}CC)`, boxShadow: `0 6px 14px ${color}33` }} />
                                                    )}
                                                    <div style={{ position: 'absolute', right: '0.5rem', top: '50%', transform: 'translateY(-50%)', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-primary)' }}>{stat.sessions}</div>
                                                </div>
                                            </div>
                                        );
                                    })}

                                    <div style={{ display: 'grid', gridTemplateColumns: '180px 1fr', marginTop: '0.2rem' }}>
                                        <div />
                                        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${xTicks + 1}, 1fr)`, fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                                            {Array.from({ length: xTicks + 1 }, (_, i) => (
                                                <span key={i} style={{ textAlign: i === xTicks ? 'right' : 'left' }}>{Math.round((maxSessions / xTicks) * i)}</span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            );
                        })()}
                    </div>
                </>
            )}

            {/* ── PARTICIPANTS ── */}
            {adminTab === "participants" && (
                <div className="animate-fade-in">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <div>
                            <h2>Participant Records</h2>
                            <p style={{ marginTop: '0.25rem' }}>Open a participant card to view full details and session table.</p>
                        </div>
                        <button className="btn btn-primary" onClick={handleExportCSV}>
                            <Download size={16} /> Export CSV
                        </button>
                    </div>
                    <div className="grid-cards">
                        {participants.map(p => {
                            const completed = meetings.filter(m => m.participants.includes(p.id) && m.status === 'completed').length;
                            const pct = Math.round((completed / TOTAL_WEEKS) * 10000) / 100;

                            return (
                                <div
                                    key={p.id}
                                    className="glass-panel"
                                    style={{ padding: '1.5rem', cursor: 'pointer', border: '1px solid rgba(37,99,235,0.18)' }}
                                    onClick={() => setSelectedParticipantId(p.id)}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                        <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <UsersIcon size={18} /> {p.name}
                                        </h3>
                                        <div style={{ color: 'var(--accent-color)', display: 'flex', alignItems: 'center' }}>
                                            <ChevronRight size={20} />
                                        </div>
                                    </div>

                                    {/* Attendance stats */}
                                    <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '1rem', fontSize: '0.875rem' }}>
                                        <div style={{ textAlign: 'center' }}>
                                            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--accent-color)' }}>{completed}<span style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-secondary)' }}>/{TOTAL_WEEKS}</span></div>
                                            <div style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>Sessions</div>
                                        </div>
                                        <div style={{ textAlign: 'center' }}>
                                            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: pct >= 93 ? '#059669' : pct >= 50 ? '#d97706' : '#dc2626' }}>{pct}%</div>
                                            <div style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>Attendance</div>
                                        </div>
                                        <div style={{ textAlign: 'center' }}>
                                            {pct >= 93 ? (
                                                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#059669', background: 'rgba(5,150,105,0.1)', padding: '0.35rem 0.75rem', borderRadius: '1rem', marginTop: '0.25rem' }}>🎯 Hit Target</div>
                                            ) : pct >= 80 ? (
                                                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--accent-color)', background: 'rgba(37,99,235,0.08)', padding: '0.35rem 0.75rem', borderRadius: '1rem', marginTop: '0.25rem' }}>Good</div>
                                            ) : pct >= 50 ? (
                                                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#d97706', background: 'rgba(217,119,6,0.1)', padding: '0.35rem 0.75rem', borderRadius: '1rem', marginTop: '0.25rem' }}>⚠ Needs Improvement</div>
                                            ) : completed > 0 ? (
                                                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#dc2626', background: 'rgba(220,38,38,0.08)', padding: '0.35rem 0.75rem', borderRadius: '1rem', marginTop: '0.25rem' }}>At Risk</div>
                                            ) : null}
                                        </div>
                                    </div>

                                    {/* Progress bar */}
                                    <div style={{ height: '6px', background: 'rgba(37,99,235,0.1)', borderRadius: '3px', marginBottom: '1rem', overflow: 'hidden' }}>
                                        <div style={{ height: '100%', width: `${pct}%`, background: pct >= 80 ? '#059669' : pct >= 50 ? '#d97706' : '#dc2626', borderRadius: '3px', transition: 'width 0.5s' }} />
                                    </div>

                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* ── SESSION REPORT ── */}
            {adminTab === "report" && (() => {
                // Helper: get ISO week number
                const getWeekNum = (dateStr: string) => {
                    const d = new Date(dateStr);
                    const jan4 = new Date(d.getFullYear(), 0, 4);
                    const dayDiff = (d.getTime() - jan4.getTime()) / 86400000;
                    return Math.ceil((dayDiff + jan4.getDay() + 1) / 7);
                };

                // Get unique weeks from meetings for the dropdown
                const weekOptions = [...new Set(meetings.map(m => {
                    const dateStr = m.start.split(' ')[0];
                    return getWeekNum(dateStr);
                }))].sort((a, b) => a - b);

                // Apply filters
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

                const selectStyle: CSSProperties = {
                    padding: '0.4rem 0.6rem', fontSize: '0.8rem', border: '1px solid var(--border-color)',
                    borderRadius: '6px', background: 'white', color: 'var(--text-primary)',
                    minWidth: '120px', cursor: 'pointer'
                };

                return (
                    <div className="animate-fade-in">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                            <h2>Session Report</h2>
                            {hasFilters && (
                                <button className="btn btn-secondary" style={{ fontSize: '0.8rem', padding: '0.3rem 0.75rem' }}
                                    onClick={() => { setFilterDate(''); setFilterWeek(''); setFilterBuddy(''); setFilterParticipant(''); setFilterStatus(''); }}>
                                    Clear Filters
                                </button>
                            )}
                        </div>

                        {/* Filter Bar */}
                        <div className="glass-panel" style={{ padding: '0.75rem 1rem', marginBottom: '1rem', display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
                            <Filter size={15} style={{ color: 'var(--text-secondary)' }} />
                            <input type="date" value={filterDate} onChange={e => setFilterDate(e.target.value)}
                                style={{ ...selectStyle, minWidth: '140px' }} title="Filter by date" />
                            <select value={filterWeek} onChange={e => setFilterWeek(e.target.value)} style={selectStyle}>
                                <option value="">All Weeks</option>
                                {weekOptions.map(w => <option key={w} value={w}>Week {w}</option>)}
                            </select>
                            <select value={filterBuddy} onChange={e => setFilterBuddy(e.target.value)} style={selectStyle}>
                                <option value="">All Buddies</option>
                                {buddies.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                            </select>
                            <select value={filterParticipant} onChange={e => setFilterParticipant(e.target.value)} style={selectStyle}>
                                <option value="">All Participants</option>
                                {participants.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                            </select>
                            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={selectStyle}>
                                <option value="">All Statuses</option>
                                <option value="scheduled">Scheduled</option>
                                <option value="completed">Completed</option>
                                <option value="canceled">Canceled</option>
                            </select>
                        </div>

                        {filteredMeetings.length === 0 ? (
                            <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center' }}><p>{hasFilters ? 'No meetings match the selected filters.' : 'No meetings have been scheduled yet.'}</p></div>
                        ) : (
                            <div className="glass-panel table-container">
                                <table className="meeting-table">
                                    <thead>
                                        <tr>
                                            <th>Date & Time</th>
                                            <th>Buddy</th>
                                            <th>Participant</th>
                                            <th>Topic / Note</th>
                                            <th>Status</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredMeetings.map(m => {
                                            const buddy = buddies.find(b => b.id === m.buddyId);
                                            const partNames = m.participants.map(pid => participants.find(p => p.id === pid)?.name || "Unknown").join(", ");
                                            const isCompleted = m.status === 'completed';
                                            const isCanceled = m.status === 'canceled';

                                            return (
                                                <tr key={m.id} style={{ opacity: isCanceled ? 0.5 : 1 }}>
                                                    <td>
                                                        <div className="slot-time-col">
                                                            <span className="slot-day">{m.start.split(' ')[0]}</span>
                                                            <span className="slot-hours">{m.start.split(' ')[1]} - {m.end.split(' ')[1]}</span>
                                                        </div>
                                                    </td>
                                                    <td><span className="buddy-name">{buddy?.name}</span></td>
                                                    <td><div className="participants-col" style={{ fontWeight: 500 }}>{partNames}</div></td>
                                                    <td>
                                                        <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', maxWidth: '160px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={m.topic}>
                                                            {m.topic ? `"${m.topic}"` : "-"}
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <span style={{
                                                            padding: '0.25rem 0.5rem', borderRadius: '1rem', fontSize: '0.75rem',
                                                            textTransform: 'uppercase', fontWeight: 600,
                                                            background: isCompleted ? 'rgba(5,150,105,0.1)' : isCanceled ? 'rgba(220,38,38,0.1)' : 'rgba(37,99,235,0.1)',
                                                            color: isCompleted ? '#059669' : isCanceled ? '#dc2626' : 'var(--accent-color)'
                                                        }}>
                                                            {m.status}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        {m.status === 'scheduled' && (
                                                            <div style={{ display: 'flex', gap: '0.4rem' }}>
                                                                <button
                                                                    onClick={() => setCompleteMeetingTarget(m)}
                                                                    style={{ padding: '0.25rem 0.6rem', fontSize: '0.75rem', background: 'rgba(5,150,105,0.1)', color: '#059669', border: '1px solid rgba(5,150,105,0.3)', borderRadius: '4px', cursor: 'pointer', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                                                                ><CheckCircle size={12} /> Complete</button>
                                                                <button
                                                                    onClick={() => setCancelMeetingTarget(m)}
                                                                    style={{ padding: '0.25rem 0.6rem', fontSize: '0.75rem', background: 'rgba(220,38,38,0.08)', color: '#dc2626', border: '1px solid rgba(220,38,38,0.25)', borderRadius: '4px', cursor: 'pointer', whiteSpace: 'nowrap' }}
                                                                >Cancel</button>
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

            {/* ── CONFIRM COMPLETE MODAL ── */}
            {completeMeetingTarget && (() => {
                const m = completeMeetingTarget;
                const buddy = buddies.find(b => b.id === m.buddyId);
                const partNames = m.participants.map(pid => participants.find(p => p.id === pid)?.name || "Unknown").join(", ");
                return (
                    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
                        <div className="glass-panel animate-fade-in" style={{ maxWidth: '440px', width: '100%', padding: '2rem', position: 'relative' }}>
                            <button onClick={() => setCompleteMeetingTarget(null)} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}><X size={20} /></button>
                            <h3 style={{ marginBottom: '0.75rem', color: '#059669', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><CheckCircle size={20} /> Mark Session Complete?</h3>
                            <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem', lineHeight: 1.6 }}>Confirming this session will:</p>
                            <ul style={{ paddingLeft: '1.25rem', color: 'var(--text-secondary)', marginBottom: '1rem', lineHeight: 2 }}>
                                <li>Mark the meeting as <strong style={{ color: 'var(--text-primary)' }}>Completed</strong></li>
                                <li>Add <strong style={{ color: 'var(--text-primary)' }}>+1 point</strong> to each participant's score</li>
                                <li>Record a session log entry</li>
                            </ul>
                            <div style={{ background: 'rgba(37,99,235,0.05)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', padding: '0.75rem 1rem', marginBottom: '1.5rem', fontSize: '0.9rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                                <div><span style={{ color: 'var(--text-secondary)' }}>Date:</span> <strong>{m.start.split(' ')[0]}</strong> at <strong>{m.start.split(' ')[1]}–{m.end.split(' ')[1]}</strong></div>
                                <div><span style={{ color: 'var(--text-secondary)' }}>Buddy:</span> <strong>{buddy?.name}</strong></div>
                                <div><span style={{ color: 'var(--text-secondary)' }}>Participant:</span> <strong>{partNames}</strong></div>
                            </div>
                            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                                <button className="btn btn-secondary" onClick={() => setCompleteMeetingTarget(null)}>Cancel</button>
                                <button className="btn" style={{ background: '#059669', color: 'white' }} onClick={handleCompleteConfirm}>
                                    <CheckCircle size={15} /> Yes, Mark Complete
                                </button>
                            </div>
                        </div>
                    </div>
                );
            })()}

            {/* ── CANCEL REQUEST MODAL ── */}
            {cancelRequestTarget && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
                    <div className="glass-panel animate-fade-in" style={{ maxWidth: '440px', width: '100%', padding: '2rem', position: 'relative' }}>
                        <button onClick={() => setCancelRequestTarget(null)} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}><X size={20} /></button>
                        <h3 style={{ marginBottom: '0.75rem', color: '#dc2626' }}>Cancel Meeting Request</h3>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem', lineHeight: 1.6 }}>
                            Cancel the request from <strong style={{ color: 'var(--text-primary)' }}>{cancelRequestTarget.participantName}</strong> for:
                        </p>
                        <p style={{ background: 'rgba(37,99,235,0.05)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-sm)', marginBottom: '1.5rem', fontWeight: 500, border: '1px solid var(--border-color)' }}>
                            {cancelRequestTarget.slotDate}
                        </p>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>The slot will become available again.</p>
                        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                            <button className="btn btn-secondary" onClick={() => setCancelRequestTarget(null)}>Keep Request</button>
                            <button className="btn" style={{ background: '#dc2626', color: 'white' }} onClick={handleCancelRequestConfirm}>Yes, Cancel Request</button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── CANCEL MEETING MODAL ── */}
            {cancelMeetingTarget && (() => {
                const m = cancelMeetingTarget;
                const buddy = buddies.find(b => b.id === m.buddyId);
                const partNames = m.participants.map(pid => participants.find(p => p.id === pid)?.name || "Unknown").join(", ");
                return (
                    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
                        <div className="glass-panel animate-fade-in" style={{ maxWidth: '460px', width: '100%', padding: '2rem', position: 'relative' }}>
                            <button onClick={() => setCancelMeetingTarget(null)} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}><X size={20} /></button>
                            <h3 style={{ marginBottom: '0.75rem', color: '#dc2626' }}>Cancel Scheduled Meeting</h3>
                            <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem', lineHeight: 1.6 }}>Are you sure you want to cancel this meeting?</p>
                            <div style={{ background: 'rgba(37,99,235,0.05)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', padding: '1rem', marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.9rem' }}>
                                <div><span style={{ color: 'var(--text-secondary)' }}>Date:</span> <strong>{m.start.split(' ')[0]}</strong> at <strong>{m.start.split(' ')[1]}–{m.end.split(' ')[1]}</strong></div>
                                <div><span style={{ color: 'var(--text-secondary)' }}>Buddy:</span> <strong>{buddy?.name}</strong></div>
                                <div><span style={{ color: 'var(--text-secondary)' }}>Participant:</span> <strong>{partNames}</strong></div>
                            </div>
                            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                                <button className="btn btn-secondary" onClick={() => setCancelMeetingTarget(null)}>Keep Meeting</button>
                                <button className="btn" style={{ background: '#dc2626', color: 'white' }} onClick={handleCancelMeetingConfirm}>Yes, Cancel Meeting</button>
                            </div>
                        </div>
                    </div>
                );
            })()}

            {selectedParticipantId && (() => {
                const participant = participants.find(p => p.id === selectedParticipantId);
                if (!participant) return null;

                const participantMeetings = meetings
                    .filter(m => m.participants.includes(participant.id))
                    .sort((a, b) => new Date(b.start).getTime() - new Date(a.start).getTime());
                const completedSessions = participantMeetings.filter(m => m.status === 'completed').length;
                const progress = Math.round((completedSessions / TOTAL_WEEKS) * 10000) / 100;

                return (
                    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.65)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1200, padding: '1rem' }}>
                        <div className="glass-panel animate-fade-in" style={{ maxWidth: '820px', width: '100%', padding: '2rem', position: 'relative', maxHeight: '88vh', overflowY: 'auto' }}>
                            <button onClick={() => setSelectedParticipantId(null)} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}><X size={20} /></button>

                            <h2 style={{ marginBottom: '1rem' }}>{participant.name} Details</h2>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.75rem', marginBottom: '1.25rem' }}>
                                <div className="glass-panel" style={{ padding: '0.75rem' }}><div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Name</div><div style={{ fontWeight: 700 }}>{participant.name}</div></div>
                                <div className="glass-panel" style={{ padding: '0.75rem' }}><div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Sessions</div><div style={{ fontWeight: 700 }}>{completedSessions}/{TOTAL_WEEKS}</div></div>
                                <div className="glass-panel" style={{ padding: '0.75rem' }}><div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Progress</div><div style={{ fontWeight: 700 }}>{progress}%</div></div>
                            </div>

                            <div style={{ marginBottom: '1.25rem' }}>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>Progress Bar</div>
                                <div style={{ height: '8px', background: 'rgba(37,99,235,0.1)', borderRadius: '4px', overflow: 'hidden' }}>
                                    <div style={{ height: '100%', width: `${progress}%`, background: progress >= 80 ? '#059669' : progress >= 50 ? '#d97706' : '#dc2626', transition: 'width 0.4s ease' }} />
                                </div>
                            </div>

                            <h3 style={{ marginBottom: '0.75rem' }}>Session Table of Contents</h3>
                            {participantMeetings.length === 0 ? (
                                <div style={{ fontStyle: 'italic', opacity: 0.7 }}>No meetings found for this participant.</div>
                            ) : (
                                <div className="table-container" style={{ border: '1px solid var(--border-color)', borderRadius: '10px', overflow: 'hidden' }}>
                                    <table className="meeting-table">
                                        <thead>
                                            <tr>
                                                <th>Topic</th>
                                                <th>Date</th>
                                                <th>Buddy</th>
                                                <th>Participant</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {participantMeetings.map(m => {
                                                const buddy = buddies.find(b => b.id === m.buddyId);
                                                const participantNames = m.participants.map(pid => participants.find(p => p.id === pid)?.name || "Unknown").join(", ");
                                                return (
                                                    <tr key={m.id} style={{ opacity: m.status === 'canceled' ? 0.55 : 1 }}>
                                                        <td>{m.topic ? `"${m.topic}"` : <span style={{ color: 'var(--text-secondary)' }}>-</span>}</td>
                                                        <td>{m.start.split(' ')[0]}</td>
                                                        <td>{buddy?.name || "Unknown"}</td>
                                                        <td>{participantNames}</td>
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

            {toast && (
                <div
                    className="animate-fade-in"
                    style={{
                        position: 'fixed',
                        top: '1.25rem',
                        right: '1.25rem',
                        zIndex: 1300,
                        maxWidth: '420px',
                        width: 'calc(100% - 2.5rem)',
                        background: toast.type === 'success' ? 'rgba(5,150,105,0.95)' : 'rgba(37,99,235,0.95)',
                        color: '#fff',
                        borderRadius: '12px',
                        padding: '1rem 1.25rem',
                        boxShadow: '0 14px 30px rgba(2,6,23,0.32)',
                        border: '1px solid rgba(255,255,255,0.28)',
                        fontWeight: 600,
                        fontSize: '1rem'
                    }}
                >
                    {toast.message}
                </div>
            )}
        </div>
    );
}
