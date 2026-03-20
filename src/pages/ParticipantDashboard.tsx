import { useAuth } from "../hooks/useAuth";
import { useData } from "../hooks/useData";
import { CalendarWeeklyView } from "../components/CalendarWeeklyView";
import { CalendarMonthView } from "../components/CalendarMonthView";
import { Calendar as CalendarIcon, CalendarDays, Clock, Check, X, Lock } from "lucide-react";
import { useEffect, useState } from "react";

// Helper: get ISO week number from a date string "YYYY-MM-DD"
function getISOWeekKey(dateStr: string): string {
    const parts = dateStr.split('-');
    const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
    const jan4 = new Date(d.getFullYear(), 0, 4);
    const dayDiff = (d.getTime() - jan4.getTime()) / 86400000;
    const weekNum = Math.ceil((dayDiff + jan4.getDay() + 1) / 7);
    return `${d.getFullYear()}-W${weekNum}`;
}

export function ParticipantDashboard() {
    const { user } = useAuth();
    const { availabilities, requests, users, requestSlot, meetings } = useData();
    const [weekFilter, setWeekFilter] = useState<"this_week" | "next_week">("this_week");
    const [viewMode, setViewMode] = useState<"month" | "calendar">("month");
    const [selectedSlots, setSelectedSlots] = useState<string[]>([]);
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [topic, setTopic] = useState("");
    const [toast, setToast] = useState<{ message: string; type: "success" | "info" } | null>(null);

    useEffect(() => {
        if (!toast) return;
        const timeout = setTimeout(() => setToast(null), 2600);
        return () => clearTimeout(timeout);
    }, [toast]);

    if (!user) return null;

    // Calculate start/end dates for week filtering
    const today = new Date();
    const currentDay = today.getDay(); // 0 is Sunday, 1 is Monday
    const distanceToMonday = currentDay === 0 ? -6 : 1 - currentDay;
    const thisWeekStart = new Date(today.getFullYear(), today.getMonth(), today.getDate() + distanceToMonday);
    thisWeekStart.setHours(0, 0, 0, 0);

    const nextWeekStart = new Date(thisWeekStart);
    nextWeekStart.setDate(nextWeekStart.getDate() + 7);
    const nextWeekEnd = new Date(nextWeekStart);
    nextWeekEnd.setDate(nextWeekEnd.getDate() + 4);
    nextWeekEnd.setHours(23, 59, 59, 999);

    const myRequests = requests.filter(r => r.participantId === user.id);
    const myMeetings = meetings.filter(m => m.participants.includes(user.id));
    const activeMeetings = myMeetings.filter(m => m.status === 'scheduled' || m.status === 'completed');

    const hasMeetingForSlot = (participantId: string, availabilityId: string) =>
        meetings.some(m => m.availabilityId === availabilityId && m.participants.includes(participantId));

    // Pending requests are requests without an attached meeting yet.
    const pendingRequests = myRequests.filter(r => !hasMeetingForSlot(user.id, r.availabilityId));

    const getSlotById = (slotId: string) => availabilities.find(a => a.id === slotId);

    // All unbooked slots for this+next week (Mon-Fri), plus slots already confirmed for this participant.
    const visibleSlots = availabilities.filter(a => {
        const isMyMeeting = activeMeetings.some(m => m.availabilityId === a.id);
        if (!isMyMeeting && a.booked) return false;

        const parts = a.date.split('-');
        if (parts.length !== 3) return false;
        const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
        const dow = d.getDay();
        if (dow === 0 || dow === 6) return false;
        if (!(d >= thisWeekStart && d <= nextWeekEnd)) return false;

        const iAlreadyRequested = pendingRequests.some(r => r.availabilityId === a.id);
        if (!iAlreadyRequested && !isMyMeeting) {
            const hasOtherRequest = requests.some(
                r => r.availabilityId === a.id && r.participantId !== user.id && !hasMeetingForSlot(r.participantId, r.availabilityId)
            );
            if (hasOtherRequest) return false;
        }
        return true;
    });

    // Max 3 reservations per ISO week.
    const reservedCountByWeek = new Map<string, number>();
    pendingRequests.forEach(req => {
        const slot = getSlotById(req.availabilityId);
        if (!slot) return;
        const weekKey = getISOWeekKey(slot.date);
        reservedCountByWeek.set(weekKey, (reservedCountByWeek.get(weekKey) || 0) + 1);
    });
    activeMeetings.forEach(m => {
        const slot = getSlotById(m.availabilityId);
        if (!slot) return;
        const weekKey = getISOWeekKey(slot.date);
        reservedCountByWeek.set(weekKey, (reservedCountByWeek.get(weekKey) || 0) + 1);
    });

    const weeklySlots = visibleSlots.filter(a => {
        const slotDateParts = a.date.split('-');
        if (slotDateParts.length !== 3) return false;
        const slotDateObj = new Date(parseInt(slotDateParts[0]), parseInt(slotDateParts[1]) - 1, parseInt(slotDateParts[2]));

        if (weekFilter === "this_week") {
            const thisWeekEnd = new Date(thisWeekStart);
            thisWeekEnd.setDate(thisWeekEnd.getDate() + 4);
            thisWeekEnd.setHours(23, 59, 59, 999);
            return slotDateObj >= thisWeekStart && slotDateObj <= thisWeekEnd;
        } else {
            return slotDateObj >= nextWeekStart && slotDateObj <= nextWeekEnd;
        }
    }).sort((a, b) => {
        const dateComp = a.date.localeCompare(b.date);
        if (dateComp !== 0) return dateComp;
        return a.start.localeCompare(b.start);
    });

    const selectedCountByWeek = new Map<string, number>();
    selectedSlots.forEach(selectedSlotId => {
        const slot = getSlotById(selectedSlotId);
        if (!slot) return;
        const weekKey = getISOWeekKey(slot.date);
        selectedCountByWeek.set(weekKey, (selectedCountByWeek.get(weekKey) || 0) + 1);
    });

    const handleToggleSlot = (slotId: string) => {
        const slot = getSlotById(slotId);
        if (!slot) return;

        const alreadySelected = selectedSlots.includes(slotId);
        if (!alreadySelected) {
            const weekKey = getISOWeekKey(slot.date);
            const reservedCount = reservedCountByWeek.get(weekKey) || 0;
            const selectedCount = selectedCountByWeek.get(weekKey) || 0;
            if (reservedCount + selectedCount >= 3) {
                return;
            }
        }

        setSelectedSlots(prev =>
            prev.includes(slotId) ? prev.filter(id => id !== slotId) : [...prev, slotId]
        );
    };

    const handleConfirmSelection = async () => {
        if (!topic.trim()) {
            setToast({ message: "Topic is required before sending requests", type: "info" });
            return;
        }

        await Promise.all(selectedSlots.map(slotId => requestSlot(user.id, slotId, topic.trim())));
        setSelectedSlots([]);
        setTopic("");
        setIsConfirmModalOpen(false);
        setToast({ message: "Reservation request sent", type: "success" });
    };

    return (
        <div className="page-container">
            <div style={{ marginBottom: '2rem' }}>
                {/* <h2 style={{ marginBottom: '1rem' }}>{user.name} Details</h2> */}
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                    <div className="glass-panel" style={{ flex: 1, padding: '1rem', borderRadius: 'var(--radius-md)' }}>
                        <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Name</div>
                        <div style={{ fontSize: '1.25rem', fontWeight: 600 }}>{user.name}</div>
                    </div>
                    <div className="glass-panel" style={{ flex: 1, padding: '1rem', borderRadius: 'var(--radius-md)' }}>
                        <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Sessions</div>
                        <div style={{ fontSize: '1.25rem', fontWeight: 600 }}>{myMeetings.length}/28</div>
                    </div>
                    <div className="glass-panel" style={{ flex: 1, padding: '1rem', borderRadius: 'var(--radius-md)' }}>
                        <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Progress</div>
                        <div style={{ fontSize: '1.25rem', fontWeight: 600 }}>{((myMeetings.length / 28) * 100).toFixed(2)}%</div>
                    </div>
                </div>
                <div style={{ marginTop: '1rem' }}>
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Progress Bar</div>
                    <div style={{ width: '100%', height: '8px', background: 'var(--surface-color)', borderRadius: '4px', overflow: 'hidden' }}>
                        <div style={{ width: `${Math.min((myMeetings.length / 28) * 100, 100)}%`, height: '100%', background: 'var(--primary-color)', borderRadius: '4px' }}></div>
                    </div>
                </div>
            </div>

            <div style={{ marginBottom: '2rem' }}>
                <h2 style={{ marginBottom: '1rem' }}>Session Table of Contents</h2>
                <div className="glass-panel" style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                                <th style={{ padding: '1rem', color: 'var(--primary-color)', fontWeight: 600 }}>Topic</th>
                                <th style={{ padding: '1rem', color: 'var(--primary-color)', fontWeight: 600 }}>Date</th>
                                <th style={{ padding: '1rem', color: 'var(--primary-color)', fontWeight: 600 }}>Buddy</th>
                                <th style={{ padding: '1rem', color: 'var(--primary-color)', fontWeight: 600 }}>Participant</th>
                            </tr>
                        </thead>
                        <tbody>
                            {myMeetings.map(m => {
                                const buddy = users.find(u => u.id === m.buddyId);
                                const participants = m.participants.map(pId => users.find(u => u.id === pId)?.name).join(", ");
                                const slot = availabilities.find(a => a.id === m.availabilityId);
                                
                                return (
                                    <tr key={m.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                        <td style={{ padding: '1rem' }}>"{m.topic || 'No topic'}"</td>
                                        <td style={{ padding: '1rem' }}>{slot ? slot.date : 'Unknown date'}</td>
                                        <td style={{ padding: '1rem' }}>{buddy?.name || 'Unassigned'}</td>
                                        <td style={{ padding: '1rem' }}>{participants}</td>
                                    </tr>
                                );
                            })}
                            {myMeetings.length === 0 && (
                                <tr>
                                    <td colSpan={4} style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-secondary)' }}>No sessions registered yet.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {myMeetings.length > 0 && (
                <div style={{ marginBottom: '1rem' }}>
                    <h2 style={{ marginBottom: '1.5rem' }}>My Meetings</h2>
                    <div className="grid-cards">
                        {myMeetings.map(meeting => {
                            const buddy = users.find(u => u.id === meeting.buddyId);
                            const isCanceled = meeting.status === 'canceled';
                            const isCompleted = meeting.status === 'completed';
                            const statusColor = isCanceled ? '#dc2626' : isCompleted ? '#059669' : 'var(--success-color)';
                            const statusLabel = isCanceled ? 'Canceled' : isCompleted ? 'Completed' : 'Scheduled';
                            const cardAccent = isCanceled ? '#dc2626' : isCompleted ? '#059669' : 'var(--success-color)';
                            return (
                                <div key={meeting.id} className="glass-panel animate-fade-in" style={{ padding: '1.5rem', borderLeft: `4px solid ${cardAccent}`, opacity: isCanceled ? 0.8 : 1 }}>
                                    <div style={{ marginBottom: '1rem', fontWeight: 600, fontSize: '1.1rem' }}>{meeting.start} - {meeting.end}</div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.875rem' }}>
                                        <div><span style={{ color: 'var(--text-secondary)' }}>Buddy:</span> {buddy?.name || 'Assigned'}</div>
                                        <div><span style={{ color: 'var(--text-secondary)' }}>Status:</span> <span style={{ color: statusColor }}>{statusLabel}</span></div>
                                        {meeting.topic && (
                                            <div>
                                                <span style={{ color: 'var(--text-secondary)' }}>Note:</span>
                                                <span style={{ fontStyle: 'italic', marginLeft: '0.25rem' }}>"{meeting.topic}"</span>
                                            </div>
                                        )}
                                    </div>
                                    <div style={{ marginTop: '1.25rem', padding: '0.6rem 1rem', borderRadius: 'var(--radius-sm)', background: isCanceled ? 'rgba(220,38,38,0.12)' : isCompleted ? 'rgba(5,150,105,0.12)' : 'rgba(16,185,129,0.1)', color: statusColor, fontWeight: 600, fontSize: '0.875rem', textAlign: 'center' }}>
                                        {isCanceled ? '✕ Meeting Canceled' : isCompleted ? '✓ Meeting Completed' : '✓ Meeting Confirmed'}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                    <div>
                        <h2 style={{ marginBottom: '0.5rem' }}>Available Sessions</h2>
                        <p style={{ color: 'var(--text-secondary)' }}>Browse and request to join mentoring sessions. Note: Your buddy will be assigned by an admin.</p>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '0.3rem' }}>Reservation limit: max 3 slots per participant per week.</p>
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                        <div style={{ display: 'flex', gap: '0.5rem', background: 'rgba(37,99,235,0.08)', border: '1px solid rgba(37,99,235,0.15)', padding: '0.25rem', borderRadius: 'var(--radius-sm)' }}>
                            <button
                                onClick={() => setViewMode('month')}
                                style={{
                                    padding: '0.4rem 0.75rem',
                                    border: 'none',
                                    borderRadius: '4px',
                                    background: viewMode === 'month' ? 'var(--surface-color)' : 'transparent',
                                    color: viewMode === 'month' ? 'var(--accent-color)' : 'var(--text-secondary)',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.4rem',
                                    transition: 'all 0.2s'
                                }}
                            >
                                <CalendarDays size={16} /> Month
                            </button>
                            <button
                                onClick={() => setViewMode('calendar')}
                                style={{
                                    padding: '0.4rem 0.75rem',
                                    border: 'none',
                                    borderRadius: '4px',
                                    background: viewMode === 'calendar' ? 'var(--surface-color)' : 'transparent',
                                    color: viewMode === 'calendar' ? 'var(--accent-color)' : 'var(--text-secondary)',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.4rem',
                                    transition: 'all 0.2s'
                                }}
                            >
                                <CalendarIcon size={16} /> Week
                            </button>
                        </div>

                        {viewMode === 'calendar' && (
                            <div style={{ display: 'flex', gap: '0.5rem', background: 'rgba(37,99,235,0.08)', border: '1px solid rgba(37,99,235,0.15)', padding: '0.25rem', borderRadius: 'var(--radius-sm)' }}>
                                <button
                                    onClick={() => setWeekFilter('this_week')}
                                    style={{
                                        padding: '0.5rem 1rem',
                                        border: 'none',
                                        borderRadius: '4px',
                                        background: weekFilter === 'this_week' ? 'var(--surface-color)' : 'transparent',
                                        color: weekFilter === 'this_week' ? 'var(--accent-color)' : 'var(--text-secondary)',
                                        fontWeight: weekFilter === 'this_week' ? 600 : 400,
                                        cursor: 'pointer',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    This Week
                                </button>
                                <button
                                    onClick={() => setWeekFilter('next_week')}
                                    style={{
                                        padding: '0.5rem 1rem',
                                        border: 'none',
                                        borderRadius: '4px',
                                        background: weekFilter === 'next_week' ? 'var(--surface-color)' : 'transparent',
                                        color: weekFilter === 'next_week' ? 'var(--accent-color)' : 'var(--text-secondary)',
                                        fontWeight: weekFilter === 'next_week' ? 600 : 400,
                                        cursor: 'pointer',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    Next Week
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {viewMode === 'month' ? (
                    <CalendarMonthView
                        slots={visibleSlots}
                        renderSlot={(slot) => {
                            const slotRequests = requests.filter(r => r.availabilityId === slot.id);
                            const isJoined = pendingRequests.some(r => r.availabilityId === slot.id);
                            const isMeeting = activeMeetings.some(m => m.availabilityId === slot.id);
                            const isSelected = selectedSlots.includes(slot.id);
                            const weekKey = getISOWeekKey(slot.date);
                            const currentWeekCount = (reservedCountByWeek.get(weekKey) || 0) + (selectedCountByWeek.get(weekKey) || 0);
                            const isWeekReserved = !isJoined && !isMeeting && !isSelected && currentWeekCount >= 3;

                            return (
                                <div
                                    className={`calendar-month-slot ${isMeeting || isJoined ? "booked" : isSelected ? "selected" : ""}`}
                                    title={isWeekReserved ? 'Weekly reservation limit reached (3/3)' : `${slot.start} - ${slot.end} (${slotRequests.length} participants)`}
                                    style={{
                                        cursor: isMeeting || isJoined || isWeekReserved ? 'default' : 'pointer',
                                        backgroundColor: isWeekReserved ? 'rgba(100,116,139,0.08)' : isMeeting ? 'rgba(16, 185, 129, 0.15)' : isJoined ? 'rgba(37, 99, 235, 0.12)' : isSelected ? 'var(--accent-color)' : 'rgba(37, 99, 235, 0.07)',
                                        borderColor: isWeekReserved ? 'rgba(100,116,139,0.2)' : isMeeting ? 'rgba(16, 185, 129, 0.4)' : isJoined ? 'rgba(37, 99, 235, 0.4)' : isSelected ? 'var(--accent-color)' : 'rgba(37, 99, 235, 0.35)',
                                        color: isWeekReserved ? 'rgba(100,116,139,0.5)' : isSelected && !isMeeting ? 'white' : isMeeting ? '#059669' : undefined,
                                        opacity: isWeekReserved ? 0.6 : 1,
                                    }}
                                    onClick={() => !isMeeting && !isJoined && !isWeekReserved && handleToggleSlot(slot.id)}
                                >
                                    {isWeekReserved ? <Lock size={9} /> : <Clock size={10} />}
                                    <span>{slot.start} {slotRequests.length > 0 && !isMeeting ? `(${slotRequests.length})` : ""}</span>
                                    {isMeeting ? <span style={{ marginLeft: '4px', fontSize: '0.6rem', color: '#6ee7b7' }}>★</span> : isJoined ? <span style={{ marginLeft: '4px', fontSize: '0.6rem' }}>✓</span> : isSelected ? <span style={{ marginLeft: '4px', fontSize: '0.6rem' }}><Check size={10} /></span> : null}
                                </div>
                            );
                        }}
                    />
                ) : (
                    <CalendarWeeklyView
                        slots={weeklySlots}
                        weekOffset={weekFilter === 'this_week' ? 0 : 1}
                        renderSlot={(slot) => {
                            const slotRequests = requests.filter(r => r.availabilityId === slot.id);
                            const isJoined = pendingRequests.some(r => r.availabilityId === slot.id);
                            const isMeeting = activeMeetings.some(m => m.availabilityId === slot.id);
                            const isSelected = selectedSlots.includes(slot.id);
                            const weekKey = getISOWeekKey(slot.date);
                            const currentWeekCount = (reservedCountByWeek.get(weekKey) || 0) + (selectedCountByWeek.get(weekKey) || 0);
                            const isWeekReserved = !isJoined && !isMeeting && !isSelected && currentWeekCount >= 3;

                            return (
                                <div
                                    className={`calendar-slot ${isMeeting || isJoined ? "booked" : isSelected ? "selected" : ""}`}
                                    style={{
                                        cursor: isMeeting || isJoined || isWeekReserved ? 'default' : 'pointer',
                                        backgroundColor: isSelected && !isJoined && !isMeeting ? 'var(--primary-color)' : undefined,
                                        borderColor: isSelected && !isJoined && !isMeeting ? 'var(--primary-color)' : isMeeting ? 'rgba(16, 185, 129, 0.3)' : undefined,
                                        color: isWeekReserved ? 'rgba(100,116,139,0.7)' : isSelected && !isJoined && !isMeeting ? 'white' : undefined,
                                        opacity: isWeekReserved ? 0.7 : 1,
                                    }}
                                    onClick={() => !isMeeting && !isJoined && !isWeekReserved && handleToggleSlot(slot.id)}
                                >
                                    <div className="slot-time">
                                        {isWeekReserved ? <Lock size={12} /> : <Clock size={12} />}
                                        <span>{slot.start} - {slot.end}</span>
                                    </div>
                                    {!isMeeting && (
                                        <div style={{ fontSize: '0.7rem', marginTop: '0.25rem', color: isSelected && !isJoined ? 'rgba(255,255,255,0.8)' : 'var(--text-secondary)' }}>
                                            {isWeekReserved ? 'Weekly limit reached (3/3)' : `${slotRequests.length} participant${slotRequests.length !== 1 ? 's' : ''}`}
                                        </div>
                                    )}
                                    <div style={{ fontSize: '0.75rem', marginTop: '0.25rem', fontWeight: 600 }}>
                                        {isMeeting ? <span style={{ color: 'var(--success-color)' }}>CONFIRMED</span> : isJoined ? <span style={{ color: '#6ee7b7' }}>REQUESTED</span> : isSelected ? <span>SELECTED</span> : isWeekReserved ? <span>LIMIT REACHED</span> : <span style={{ color: 'var(--accent-color)' }}>Available to join</span>}
                                    </div>
                                </div>
                            );
                        }}
                    />
                )}
            </div>


            {selectedSlots.length > 0 && (
                <div style={{
                    position: 'fixed',
                    bottom: '2rem',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: 'var(--surface-color)',
                    padding: '1rem 2rem',
                    borderRadius: '2rem',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1.5rem',
                    zIndex: 100,
                    border: '1px solid var(--border-color)'
                }}>
                    <div style={{ fontWeight: 600 }}>{selectedSlots.length} slot(s) selected</div>
                    <button className="btn btn-primary" onClick={() => setIsConfirmModalOpen(true)}>
                        Review & Confirm
                    </button>
                    <button className="btn icon-btn" onClick={() => setSelectedSlots([])} title="Clear selection">
                        <X size={18} />
                    </button>
                </div>
            )}

            {isConfirmModalOpen && (
                <div style={{
                    position: 'fixed',
                    top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.7)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000,
                    padding: '1rem'
                }}>
                    <div className="glass-panel animate-fade-in" style={{
                        maxWidth: '500px',
                        width: '100%',
                        padding: '2rem',
                        position: 'relative'
                    }}>
                        <button
                            onClick={() => setIsConfirmModalOpen(false)}
                            style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
                        >
                            <X size={20} />
                        </button>
                        <h2 style={{ marginBottom: '1rem' }}>Confirm Session Requests</h2>
                        <p style={{ marginBottom: '1.5rem', color: 'var(--text-secondary)' }}>You are about to request to join {selectedSlots.length} session(s). An admin will review and assign you a buddy.</p>

                        <div style={{ maxHeight: '300px', overflowY: 'auto', marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            {selectedSlots.map(id => {
                                const slot = availabilities.find(a => a.id === id);
                                if (!slot) return null;
                                return (
                                    <div key={id} style={{ padding: '1rem', background: 'rgba(255,255,255,0.05)', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                        <Clock size={16} className="icon-subtle" />
                                        <span>{slot.date} | {slot.start} - {slot.end}</span>
                                    </div>
                                );
                            })}
                        </div>

                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Topic to talk with the buddy <span style={{ color: '#dc2626' }}>*</span></label>
                            <textarea
                                className="input"
                                rows={3}
                                placeholder="E.g. I want to learn about React hooks"
                                value={topic}
                                onChange={(e) => setTopic(e.target.value)}
                                style={{ resize: 'vertical' }}
                                required
                            />
                            <div style={{ marginTop: '0.35rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>This field is required.</div>
                        </div>

                        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                            <button className="btn btn-secondary" onClick={() => setIsConfirmModalOpen(false)}>Cancel</button>
                            <button className="btn btn-primary" onClick={handleConfirmSelection} disabled={!topic.trim()}>Confirm Requests</button>
                        </div>
                    </div>
                </div>
            )}

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
