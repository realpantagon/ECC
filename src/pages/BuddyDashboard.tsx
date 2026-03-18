import { useEffect, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { useData } from "../hooks/useData";
import { CalendarWeeklyView } from "../components/CalendarWeeklyView";
import { CalendarMonthView } from "../components/CalendarMonthView";
import { Plus, Calendar as CalendarIcon, CalendarDays, Clock, Trash2, X, AlertTriangle } from "lucide-react";

export function BuddyDashboard() {
    const { user } = useAuth();
    const { availabilities, users, addAvailability, deleteAvailability } = useData();
    const [date, setDate] = useState(() => new Date().toISOString().split("T")[0]);
    const [start, setStart] = useState("09:00");
    const [end, setEnd] = useState("09:20");
    const [viewMode, setViewMode] = useState<"month" | "calendar">("month");
    const [slotToDelete, setSlotToDelete] = useState<string | null>(null);
    const [isAddConfirmOpen, setIsAddConfirmOpen] = useState(false);
    const [selectedOwnSlotId, setSelectedOwnSlotId] = useState<string | null>(null);
    const [weekOffset, setWeekOffset] = useState<0 | 1>(0);
    const [toast, setToast] = useState<{ message: string; type: "success" | "info" } | null>(null);

    if (!user) return null;

    useEffect(() => {
        if (!toast) return;

        const timeout = setTimeout(() => {
            setToast(null);
        }, 2400);

        return () => clearTimeout(timeout);
    }, [toast]);

    const allBuddySlots = availabilities.filter(a => {
        if (a.buddyId === user.id) return true;
        const buddy = users.find(u => u.id === a.buddyId);
        return buddy && buddy.role === "buddy";
    });

    const handleStartChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newStart = e.target.value;
        setStart(newStart);

        if (newStart) {
            const [hours, minutes] = newStart.split(":").map(Number);
            const endDate = new Date();
            endDate.setHours(hours, minutes + 20); // 20 min intervals

            const endHours = String(endDate.getHours()).padStart(2, "0");
            const endMins = String(endDate.getMinutes()).padStart(2, "0");
            setEnd(`${endHours}:${endMins}`);
        }
    };

    const handleAddSlot = (e: React.FormEvent) => {
        e.preventDefault();
        setIsAddConfirmOpen(true);
    };

    const confirmAddSlot = () => {
        addAvailability({
            buddyId: user.id,
            date,
            start,
            end,
            booked: false
        });
        setIsAddConfirmOpen(false);
        setToast({ message: "Availability slot added", type: "success" });
    };

    const confirmDelete = () => {
        if (slotToDelete) {
            deleteAvailability(slotToDelete);
            setSlotToDelete(null);
            setToast({ message: "Availability slot removed", type: "info" });
        }
    };

    return (
        <div className="page-container">
            <div className="glass-panel" style={{ padding: '2rem' }}>
                <h2>Add Availability</h2>
                <p style={{ marginBottom: '1.5rem' }}>Schedule your weekly mentoring slots</p>

                <form onSubmit={handleAddSlot} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end', flexWrap: 'wrap' }}>
                    <div style={{ flex: '1', minWidth: '150px' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Date</label>
                        <input type="date" className="input" value={date} onChange={e => setDate(e.target.value)} required />
                    </div>
                    <div style={{ flex: '1', minWidth: '120px' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Start Time</label>
                        <input type="time" className="input" value={start} onChange={handleStartChange} required />
                    </div>
                    <div style={{ flex: '1', minWidth: '120px' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>End Time</label>
                        <input type="time" className="input" value={end} disabled style={{ opacity: 0.7, cursor: 'not-allowed' }} />
                    </div>
                    <button type="submit" className="btn btn-primary" style={{ height: '45px' }}>
                        <Plus size={18} /> Add Slot
                    </button>
                </form>
            </div>

            <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h2>My Schedule</h2>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                        {viewMode === 'calendar' && (
                            <div style={{ display: 'flex', gap: '0.4rem', background: 'rgba(5,150,105,0.08)', border: '1px solid rgba(5,150,105,0.2)', padding: '0.25rem', borderRadius: 'var(--radius-sm)' }}>
                                <button
                                    onClick={() => setWeekOffset(0)}
                                    style={{
                                        padding: '0.4rem 0.7rem',
                                        border: 'none',
                                        borderRadius: '4px',
                                        background: weekOffset === 0 ? 'var(--surface-color)' : 'transparent',
                                        color: weekOffset === 0 ? 'var(--success-color)' : 'var(--text-secondary)',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    This Week
                                </button>
                                <button
                                    onClick={() => setWeekOffset(1)}
                                    style={{
                                        padding: '0.4rem 0.7rem',
                                        border: 'none',
                                        borderRadius: '4px',
                                        background: weekOffset === 1 ? 'var(--surface-color)' : 'transparent',
                                        color: weekOffset === 1 ? 'var(--success-color)' : 'var(--text-secondary)',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    Next Week
                                </button>
                            </div>
                        )}

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
                    </div>
                </div>
                {allBuddySlots.length === 0 ? (
                    <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center' }}>
                        <p>No availability slots have been added yet.</p>
                    </div>
                ) : viewMode === "month" ? (
                    <CalendarMonthView
                        slots={allBuddySlots}
                        renderSlot={(slot) => {
                            const isMine = slot.buddyId === user.id;
                            const buddyName = isMine ? user.name : (users.find(u => u.id === slot.buddyId)?.name || 'Unknown');

                            return (
                                <div
                                    className={`calendar-month-slot ${slot.booked ? "booked" : ""}`}
                                    title={`${slot.start} - ${slot.end} (${isMine ? 'Me' : buddyName})`}
                                    onClick={() => isMine && setSelectedOwnSlotId(slot.id)}
                                    style={{
                                        cursor: isMine ? 'pointer' : 'default',
                                        background: slot.booked ? undefined : isMine ? undefined : 'rgba(156, 163, 175, 0.15)',
                                        borderColor: slot.booked ? undefined : isMine ? undefined : 'rgba(156, 163, 175, 0.3)',
                                        color: slot.booked ? undefined : isMine ? undefined : 'var(--text-secondary)'
                                    }}
                                >
                                    <Clock size={10} />
                                    <span>{slot.start} ({buddyName})</span>
                                </div>
                            );
                        }}
                    />
                ) : (
                    <CalendarWeeklyView
                        slots={allBuddySlots}
                        weekOffset={weekOffset}
                        renderSlot={(slot) => {
                            const isMine = slot.buddyId === user.id;
                            const buddyName = isMine ? user.name : (users.find(u => u.id === slot.buddyId)?.name || "Unknown");

                            return (
                                <div
                                    className={`calendar-slot ${slot.booked ? "booked" : ""} ${isMine ? "own-slot" : ""}`}
                                    style={{ opacity: isMine ? 1 : 0.72, cursor: isMine ? 'pointer' : 'default' }}
                                    onClick={() => isMine && setSelectedOwnSlotId(slot.id)}
                                >
                                    <div className="slot-time">
                                        <Clock size={12} />
                                        <span>{slot.start} - {slot.end}</span>
                                    </div>
                                    {isMine && <div className="slot-status">My Slot</div>}
                                    <div style={{ fontSize: '0.7rem', marginTop: '0.25rem', color: isMine ? 'var(--primary-color)' : 'var(--text-secondary)' }}>{buddyName}</div>
                                    {slot.booked && <div className="slot-status">Booked</div>}
                                </div>
                            );
                        }}
                    />
                )}
            </div>

            {isAddConfirmOpen && (
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
                        maxWidth: '420px',
                        width: '100%',
                        padding: '2rem',
                        position: 'relative'
                    }}>
                        <button
                            onClick={() => setIsAddConfirmOpen(false)}
                            style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
                        >
                            <X size={20} />
                        </button>
                        <h2 style={{ marginBottom: '0.75rem' }}>Confirm Add Slot</h2>
                        <p style={{ marginBottom: '1rem', color: 'var(--text-secondary)' }}>Please confirm this availability slot before saving.</p>
                        <div style={{ background: 'rgba(37,99,235,0.05)', border: '1px solid rgba(37,99,235,0.15)', borderRadius: 'var(--radius-sm)', padding: '0.75rem 1rem', marginBottom: '1.25rem' }}>
                            <div><span style={{ color: 'var(--text-secondary)' }}>Date:</span> <strong>{new Date(date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' })}</strong></div>
                            <div><span style={{ color: 'var(--text-secondary)' }}>Time:</span> <strong>{start} – {end}</strong></div>
                        </div>
                        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                            <button className="btn btn-secondary" onClick={() => setIsAddConfirmOpen(false)}>Cancel</button>
                            <button className="btn btn-primary" onClick={confirmAddSlot}>Add Slot</button>
                        </div>
                    </div>
                </div>
            )}

            {selectedOwnSlotId && (
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
                        maxWidth: '420px',
                        width: '100%',
                        padding: '2rem',
                        position: 'relative'
                    }}>
                        <button
                            onClick={() => setSelectedOwnSlotId(null)}
                            style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
                        >
                            <X size={20} />
                        </button>
                        {(() => {
                            const slot = availabilities.find(a => a.id === selectedOwnSlotId);
                            if (!slot) return null;
                            return (
                                <>
                                    <h2 style={{ marginBottom: '0.75rem' }}>Slot Detail</h2>
                                    <div style={{ background: 'rgba(37,99,235,0.05)', border: '1px solid rgba(37,99,235,0.15)', borderRadius: 'var(--radius-sm)', padding: '0.75rem 1rem', marginBottom: '1rem' }}>
                                        <div><span style={{ color: 'var(--text-secondary)' }}>Date:</span> <strong>{new Date(slot.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' })}</strong></div>
                                        <div><span style={{ color: 'var(--text-secondary)' }}>Time:</span> <strong>{slot.start} – {slot.end}</strong></div>
                                        <div><span style={{ color: 'var(--text-secondary)' }}>Status:</span> <strong>{slot.booked ? 'Booked' : 'Available'}</strong></div>
                                    </div>
                                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                                        <button className="btn btn-secondary" onClick={() => setSelectedOwnSlotId(null)}>Close</button>
                                        {!slot.booked && (
                                            <button
                                                className="btn btn-danger"
                                                onClick={() => {
                                                    setSelectedOwnSlotId(null);
                                                    setSlotToDelete(slot.id);
                                                }}
                                            >
                                                <Trash2 size={14} /> Remove Slot
                                            </button>
                                        )}
                                    </div>
                                </>
                            );
                        })()}
                    </div>
                </div>
            )}

            {slotToDelete && (
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
                        maxWidth: '400px',
                        width: '100%',
                        padding: '2rem',
                        position: 'relative',
                        textAlign: 'center'
                    }}>
                        <button
                            onClick={() => setSlotToDelete(null)}
                            style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
                        >
                            <X size={20} />
                        </button>
                        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem', color: 'var(--danger-color)' }}>
                            <AlertTriangle size={48} />
                        </div>
                        <h2 style={{ marginBottom: '0.75rem' }}>Delete Availability Slot?</h2>
                        {(() => {
                            const slot = availabilities.find(a => a.id === slotToDelete);
                            return slot ? (
                                <div style={{ background: 'rgba(37,99,235,0.05)', border: '1px solid rgba(37,99,235,0.15)', borderRadius: 'var(--radius-sm)', padding: '0.75rem 1rem', marginBottom: '1rem', fontSize: '0.9rem', textAlign: 'left' }}>
                                    <div><span style={{ color: 'var(--text-secondary)' }}>Date:</span> <strong>{new Date(slot.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' })}</strong></div>
                                    <div><span style={{ color: 'var(--text-secondary)' }}>Time:</span> <strong>{slot.start} – {slot.end}</strong></div>
                                </div>
                            ) : null;
                        })()}
                        <p style={{ marginBottom: '1.5rem', color: 'var(--text-secondary)' }}>Are you sure you want to delete this slot? This action cannot be undone.</p>

                        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                            <button className="btn btn-secondary" onClick={() => setSlotToDelete(null)}>Cancel</button>
                            <button className="btn btn-danger" onClick={confirmDelete}>Delete Slot</button>
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
                        zIndex: 1200,
                        maxWidth: '420px',
                        width: 'calc(100% - 2.5rem)',
                        background: toast.type === 'success' ? 'rgba(5,150,105,0.95)' : 'rgba(37,99,235,0.95)',
                        color: '#fff',
                        borderRadius: '12px',
                        padding: '1rem 1.25rem',
                        boxShadow: '0 14px 30px rgba(2,6,23,0.32)',
                        border: '1px solid rgba(255,255,255,0.3)',
                        fontWeight: 600,
                        fontSize: '1rem',
                        lineHeight: 1.35
                    }}
                >
                    {toast.message}
                </div>
            )}
        </div>
    );
}
