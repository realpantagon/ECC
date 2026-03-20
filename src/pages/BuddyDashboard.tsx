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
        const timeout = setTimeout(() => setToast(null), 2400);
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
            endDate.setHours(hours, minutes + 20);
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
        addAvailability({ buddyId: user.id, date, start, end, booked: false });
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

    // Shared toggle-button group styles
    const toggleBtn = (active: boolean) =>
        `px-3 py-1.5 text-xs font-medium rounded-md border-none cursor-pointer transition-all ${active ? "bg-white shadow-sm text-blue-600" : "bg-transparent text-slate-500 hover:text-slate-700"}`;

    return (
        <div className="py-6 flex flex-col gap-6 font-[Inter,sans-serif]">

            {/* Add Availability */}
            <div className="bg-white/85 backdrop-blur-md border border-blue-100 rounded-2xl shadow-md shadow-blue-100/30 p-6">
                <h2 className="text-lg font-semibold text-slate-800 mb-1">Add Availability</h2>
                <p className="text-sm text-slate-500 mb-4">Schedule your weekly mentoring slots</p>
                <form onSubmit={handleAddSlot} className="flex gap-3 items-end flex-wrap">
                    <div className="flex-1 min-w-[140px] flex flex-col gap-1.5">
                        <label className="text-xs font-medium text-slate-600">Date</label>
                        <input type="date" className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition" value={date} onChange={e => setDate(e.target.value)} required />
                    </div>
                    <div className="flex-1 min-w-[120px] flex flex-col gap-1.5">
                        <label className="text-xs font-medium text-slate-600">Start Time</label>
                        <input type="time" className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition" value={start} onChange={handleStartChange} required />
                    </div>
                    <div className="flex-1 min-w-[120px] flex flex-col gap-1.5">
                        <label className="text-xs font-medium text-slate-600">End Time</label>
                        <input type="time" className="px-3 py-2 bg-white/70 border border-slate-200 rounded-lg text-sm opacity-60 cursor-not-allowed" value={end} disabled />
                    </div>
                    <button type="submit" className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors cursor-pointer h-[42px]">
                        <Plus size={16} /> Add Slot
                    </button>
                </form>
            </div>

            {/* My Schedule */}
            <div>
                <div className="flex justify-between items-center mb-4 flex-wrap gap-3">
                    <h2 className="text-lg font-semibold text-slate-800">My Schedule</h2>
                    <div className="flex items-center gap-2 flex-wrap">
                        {viewMode === 'calendar' && (
                            <div className="flex gap-1 bg-emerald-50 border border-emerald-100 p-1 rounded-lg">
                                <button onClick={() => setWeekOffset(0)} className={toggleBtn(weekOffset === 0)}>This Week</button>
                                <button onClick={() => setWeekOffset(1)} className={toggleBtn(weekOffset === 1)}>Next Week</button>
                            </div>
                        )}
                        <div className="flex gap-1 bg-blue-50 border border-blue-100 p-1 rounded-lg">
                            <button onClick={() => setViewMode('month')} className={`${toggleBtn(viewMode === 'month')} flex items-center gap-1.5`}>
                                <CalendarDays size={14} /> Month
                            </button>
                            <button onClick={() => setViewMode('calendar')} className={`${toggleBtn(viewMode === 'calendar')} flex items-center gap-1.5`}>
                                <CalendarIcon size={14} /> Week
                            </button>
                        </div>
                    </div>
                </div>

                {allBuddySlots.length === 0 ? (
                    <div className="bg-white/85 border border-blue-100 rounded-2xl shadow-md shadow-blue-100/30 py-12 text-center text-slate-500 text-sm">
                        No availability slots have been added yet.
                    </div>
                ) : viewMode === "month" ? (
                    <CalendarMonthView
                        slots={allBuddySlots}
                        renderSlot={(slot) => {
                            const isMine = slot.buddyId === user.id;
                            const buddyName = isMine ? user.name : (users.find(u => u.id === slot.buddyId)?.name || 'Unknown');
                            return (
                                <div
                                    className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-[0.65rem] font-medium whitespace-nowrap cursor-pointer transition-all
                                        ${slot.booked ? "bg-emerald-50 border border-emerald-300 text-emerald-700" : isMine ? "bg-blue-50 border border-blue-300 text-blue-600 hover:bg-blue-100" : "bg-slate-50 border border-slate-200 text-slate-500"}`}
                                    title={`${slot.start} - ${slot.end} (${isMine ? 'Me' : buddyName})`}
                                    onClick={() => isMine && setSelectedOwnSlotId(slot.id)}
                                    style={{ cursor: isMine ? 'pointer' : 'default' }}
                                >
                                    <Clock size={9} />
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
                                    className={`relative text-xs rounded-md p-1.5 flex flex-col gap-0.5 transition-all cursor-default
                                        ${isMine ? "bg-blue-50 border border-blue-200 shadow-sm" : "bg-slate-50 border border-slate-200 opacity-75"}
                                        ${slot.booked ? "bg-emerald-50 border-emerald-200" : ""}`}
                                    style={{ opacity: isMine ? 1 : 0.72, cursor: isMine ? 'pointer' : 'default' }}
                                    onClick={() => isMine && setSelectedOwnSlotId(slot.id)}
                                >
                                    <div className="flex items-center gap-1 font-medium text-slate-700">
                                        <Clock size={10} />
                                        <span className="hidden sm:inline">{slot.start} - {slot.end}</span>
                                        <span className="sm:hidden">{slot.start}</span>
                                    </div>
                                    {isMine && <div className="text-[0.6rem] font-bold text-blue-500 uppercase">My Slot</div>}
                                    <div className={`text-[0.6rem] ${isMine ? "text-blue-600" : "text-slate-400"}`}>{buddyName}</div>
                                    {slot.booked && <div className="text-[0.6rem] font-bold text-emerald-600 uppercase">Booked</div>}
                                    {isMine && !slot.booked && (
                                        <button
                                            className="absolute top-1 right-1 w-4 h-4 flex items-center justify-center rounded bg-red-50 text-red-400 hover:bg-red-100 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                                            onClick={(e) => { e.stopPropagation(); setSlotToDelete(slot.id); }}
                                        >
                                            <Trash2 size={9} />
                                        </button>
                                    )}
                                </div>
                            );
                        }}
                    />
                )}
            </div>

            {/* Add Confirm Modal */}
            {isAddConfirmOpen && (
                <Modal onClose={() => setIsAddConfirmOpen(false)}>
                    <h2 className="text-lg font-semibold text-slate-800 mb-1">Confirm Add Slot</h2>
                    <p className="text-sm text-slate-500 mb-4">Please confirm this availability slot before saving.</p>
                    <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 mb-5 text-sm flex flex-col gap-1">
                        <div><span className="text-slate-500">Date:</span> <strong>{new Date(date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' })}</strong></div>
                        <div><span className="text-slate-500">Time:</span> <strong>{start} – {end}</strong></div>
                    </div>
                    <div className="flex gap-3 justify-end">
                        <button className="px-4 py-2 text-sm bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors cursor-pointer" onClick={() => setIsAddConfirmOpen(false)}>Cancel</button>
                        <button className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors cursor-pointer" onClick={confirmAddSlot}>Add Slot</button>
                    </div>
                </Modal>
            )}

            {/* Slot Detail Modal */}
            {selectedOwnSlotId && (() => {
                const slot = availabilities.find(a => a.id === selectedOwnSlotId);
                if (!slot) return null;
                return (
                    <Modal onClose={() => setSelectedOwnSlotId(null)}>
                        <h2 className="text-lg font-semibold text-slate-800 mb-1">Slot Detail</h2>
                        <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 mb-5 mt-3 text-sm flex flex-col gap-1">
                            <div><span className="text-slate-500">Date:</span> <strong>{new Date(slot.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' })}</strong></div>
                            <div><span className="text-slate-500">Time:</span> <strong>{slot.start} – {slot.end}</strong></div>
                            <div><span className="text-slate-500">Status:</span> <strong>{slot.booked ? 'Booked' : 'Available'}</strong></div>
                        </div>
                        <div className="flex gap-3 justify-end">
                            <button className="px-4 py-2 text-sm bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors cursor-pointer" onClick={() => setSelectedOwnSlotId(null)}>Close</button>
                            {!slot.booked && (
                                <button
                                    className="inline-flex items-center gap-1.5 px-4 py-2 text-sm bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-lg transition-colors cursor-pointer"
                                    onClick={() => { setSelectedOwnSlotId(null); setSlotToDelete(slot.id); }}
                                >
                                    <Trash2 size={14} /> Remove Slot
                                </button>
                            )}
                        </div>
                    </Modal>
                );
            })()}

            {/* Delete Confirm Modal */}
            {slotToDelete && (() => {
                const slot = availabilities.find(a => a.id === slotToDelete);
                return (
                    <Modal onClose={() => setSlotToDelete(null)}>
                        <div className="text-center">
                            <div className="flex justify-center mb-3 text-red-500"><AlertTriangle size={44} /></div>
                            <h2 className="text-lg font-semibold text-slate-800 mb-3">Delete Availability Slot?</h2>
                            {slot && (
                                <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 mb-4 text-sm text-left flex flex-col gap-1">
                                    <div><span className="text-slate-500">Date:</span> <strong>{new Date(slot.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' })}</strong></div>
                                    <div><span className="text-slate-500">Time:</span> <strong>{slot.start} – {slot.end}</strong></div>
                                </div>
                            )}
                            <p className="text-sm text-slate-500 mb-5">Are you sure you want to delete this slot? This action cannot be undone.</p>
                            <div className="flex gap-3 justify-center">
                                <button className="px-4 py-2 text-sm bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors cursor-pointer" onClick={() => setSlotToDelete(null)}>Cancel</button>
                                <button className="px-4 py-2 text-sm bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors cursor-pointer" onClick={confirmDelete}>Delete Slot</button>
                            </div>
                        </div>
                    </Modal>
                );
            })()}

            {/* Toast */}
            {toast && <Toast message={toast.message} type={toast.type} />}
        </div>
    );
}

/* ── Shared sub-components ── */

function Modal({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div
                className="relative bg-white/95 backdrop-blur-md border border-blue-100 rounded-2xl shadow-2xl w-full max-w-md p-6 animate-fade-in"
                onClick={e => e.stopPropagation()}
            >
                <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 cursor-pointer transition-colors">
                    <X size={20} />
                </button>
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
