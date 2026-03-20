import { useAuth } from "../hooks/useAuth";
import { useData } from "../hooks/useData";
import { CalendarWeeklyView } from "../components/CalendarWeeklyView";
import { CalendarMonthView } from "../components/CalendarMonthView";
import { Calendar as CalendarIcon, CalendarDays, Clock, Check, X, Lock } from "lucide-react";
import { useEffect, useState } from "react";

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

    const today = new Date();
    const currentDay = today.getDay();
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
    const pendingRequests = myRequests.filter(r => !hasMeetingForSlot(user.id, r.availabilityId));
    const getSlotById = (slotId: string) => availabilities.find(a => a.id === slotId);

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
            const hasOtherRequest = requests.some(r => r.availabilityId === a.id && r.participantId !== user.id && !hasMeetingForSlot(r.participantId, r.availabilityId));
            if (hasOtherRequest) return false;
        }
        return true;
    });

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
        return dateComp !== 0 ? dateComp : a.start.localeCompare(b.start);
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
            if (reservedCount + selectedCount >= 3) return;
        }
        setSelectedSlots(prev => prev.includes(slotId) ? prev.filter(id => id !== slotId) : [...prev, slotId]);
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

    const toggleBtn = (active: boolean) =>
        `px-3 py-1.5 text-xs font-medium rounded-md border-none cursor-pointer transition-all ${active ? "bg-white shadow-sm text-blue-600" : "bg-transparent text-slate-500 hover:text-slate-700"}`;

    return (
        <div className="py-6 flex flex-col gap-6 font-[Inter,sans-serif]">

            {/* Stats row */}
            <div>
                <div className="flex gap-3 flex-wrap mb-3">
                    {[
                        { label: "Name", value: user.name },
                        { label: "Sessions", value: `${myMeetings.length}/28` },
                        { label: "Progress", value: `${((myMeetings.length / 28) * 100).toFixed(2)}%` },
                    ].map(s => (
                        <div key={s.label} className="flex-1 min-w-[100px] bg-white/85 border border-blue-100 rounded-xl shadow-sm p-3">
                            <div className="text-xs text-slate-500 mb-0.5">{s.label}</div>
                            <div className="text-lg font-semibold text-slate-800">{s.value}</div>
                        </div>
                    ))}
                </div>
                <div>
                    <div className="text-xs text-slate-500 mb-1">Progress Bar</div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-blue-500 rounded-full transition-all"
                            style={{ width: `${Math.min((myMeetings.length / 28) * 100, 100)}%` }}
                        />
                    </div>
                </div>
            </div>

            {/* Session Table of Contents */}
            <div>
                <h2 className="text-lg font-semibold text-slate-800 mb-3">Session Table of Contents</h2>
                <div className="bg-white/85 border border-blue-100 rounded-2xl shadow-md shadow-blue-100/30 overflow-x-auto">
                    <table className="w-full text-sm text-left border-collapse">
                        <thead>
                            <tr className="border-b border-blue-100">
                                {["Topic", "Date", "Buddy", "Participant"].map(h => (
                                    <th key={h} className="px-4 py-3 text-blue-600 font-semibold text-sm bg-blue-50/60">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {myMeetings.map(m => {
                                const buddy = users.find(u => u.id === m.buddyId);
                                const participants = m.participants.map(pId => users.find(u => u.id === pId)?.name).join(", ");
                                const slot = availabilities.find(a => a.id === m.availabilityId);
                                return (
                                    <tr key={m.id} className="border-b border-slate-100 last:border-0 hover:bg-blue-50/20">
                                        <td className="px-4 py-3">"{m.topic || 'No topic'}"</td>
                                        <td className="px-4 py-3 text-slate-600">{slot ? slot.date : 'Unknown date'}</td>
                                        <td className="px-4 py-3 text-slate-600">{buddy?.name || 'Unassigned'}</td>
                                        <td className="px-4 py-3 text-slate-600">{participants}</td>
                                    </tr>
                                );
                            })}
                            {myMeetings.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="px-4 py-8 text-center text-slate-400 italic text-sm">No sessions registered yet.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* My Meetings */}
            {myMeetings.length > 0 && (
                <div>
                    <h2 className="text-lg font-semibold text-slate-800 mb-4">My Meetings</h2>
                    <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-4">
                        {myMeetings.map(meeting => {
                            const buddy = users.find(u => u.id === meeting.buddyId);
                            const isCanceled = meeting.status === 'canceled';
                            const isCompleted = meeting.status === 'completed';
                            const borderColor = isCanceled ? "border-l-red-400" : isCompleted ? "border-l-emerald-400" : "border-l-blue-400";
                            const statusColor = isCanceled ? "text-red-500" : isCompleted ? "text-emerald-600" : "text-blue-600";
                            const statusLabel = isCanceled ? 'Canceled' : isCompleted ? 'Completed' : 'Scheduled';
                            const confirmBg = isCanceled ? "bg-red-50 text-red-600" : isCompleted ? "bg-emerald-50 text-emerald-700" : "bg-blue-50 text-blue-600";
                            return (
                                <div key={meeting.id} className={`bg-white/85 border border-blue-100 border-l-4 ${borderColor} rounded-2xl shadow-md p-5 animate-fade-in flex flex-col gap-3 ${isCanceled ? "opacity-75" : ""}`}>
                                    <div className="font-semibold text-slate-800">{meeting.start} - {meeting.end}</div>
                                    <div className="flex flex-col gap-1 text-sm">
                                        <div><span className="text-slate-500">Buddy:</span> {buddy?.name || 'Assigned'}</div>
                                        <div><span className="text-slate-500">Status:</span> <span className={statusColor}>{statusLabel}</span></div>
                                        {meeting.topic && (
                                            <div><span className="text-slate-500">Note:</span> <span className="italic">"{meeting.topic}"</span></div>
                                        )}
                                    </div>
                                    <div className={`mt-auto text-xs font-semibold text-center py-2 px-3 rounded-lg ${confirmBg}`}>
                                        {isCanceled ? '✕ Meeting Canceled' : isCompleted ? '✓ Meeting Completed' : '✓ Meeting Confirmed'}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Available Sessions */}
            <div>
                <div className="flex justify-between items-start mb-4 flex-wrap gap-3">
                    <div>
                        <h2 className="text-lg font-semibold text-slate-800 mb-0.5">Available Sessions</h2>
                        <p className="text-sm text-slate-500">Browse and request to join mentoring sessions.</p>
                        <p className="text-xs text-slate-400 mt-0.5">Reservation limit: max 3 slots per participant per week.</p>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                        <div className="flex gap-1 bg-blue-50 border border-blue-100 p-1 rounded-lg">
                            <button onClick={() => setViewMode('month')} className={`${toggleBtn(viewMode === 'month')} flex items-center gap-1.5`}>
                                <CalendarDays size={13} /> Month
                            </button>
                            <button onClick={() => setViewMode('calendar')} className={`${toggleBtn(viewMode === 'calendar')} flex items-center gap-1.5`}>
                                <CalendarIcon size={13} /> Week
                            </button>
                        </div>
                        {viewMode === 'calendar' && (
                            <div className="flex gap-1 bg-blue-50 border border-blue-100 p-1 rounded-lg">
                                <button onClick={() => setWeekFilter('this_week')} className={toggleBtn(weekFilter === 'this_week')}>This Week</button>
                                <button onClick={() => setWeekFilter('next_week')} className={toggleBtn(weekFilter === 'next_week')}>Next Week</button>
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
                                    className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-[0.64rem] font-medium whitespace-nowrap transition-all
                                        ${isWeekReserved ? "bg-slate-50 border border-slate-200 text-slate-400 opacity-60" :
                                        isMeeting ? "bg-emerald-50 border border-emerald-300 text-emerald-700" :
                                        isJoined ? "bg-blue-50 border border-blue-300 text-blue-600" :
                                        isSelected ? "bg-blue-600 border-blue-600 text-white" :
                                        "bg-blue-50 border border-blue-200 text-blue-500 hover:bg-blue-100 cursor-pointer"}`}
                                    title={isWeekReserved ? 'Weekly reservation limit reached (3/3)' : `${slot.start} - ${slot.end} (${slotRequests.length} participants)`}
                                    onClick={() => !isMeeting && !isJoined && !isWeekReserved && handleToggleSlot(slot.id)}
                                >
                                    {isWeekReserved ? <Lock size={8} /> : <Clock size={9} />}
                                    <span>{slot.start} {slotRequests.length > 0 && !isMeeting ? `(${slotRequests.length})` : ""}</span>
                                    {isMeeting ? <span className="text-emerald-400 text-[0.55rem]">★</span> :
                                     isJoined ? <span className="text-[0.55rem]">✓</span> :
                                     isSelected ? <Check size={8} /> : null}
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
                                    className={`text-xs rounded-lg p-1.5 flex flex-col gap-0.5 transition-all
                                        ${isWeekReserved ? "bg-slate-50 border border-slate-200 opacity-60" :
                                        isMeeting ? "bg-emerald-50 border border-emerald-200" :
                                        isJoined ? "bg-blue-100 border border-blue-300" :
                                        isSelected ? "bg-blue-600 border-blue-600 text-white" :
                                        "bg-blue-50 border border-blue-200 hover:bg-blue-100 cursor-pointer"}`}
                                    style={{ cursor: isMeeting || isJoined || isWeekReserved ? 'default' : 'pointer', opacity: isWeekReserved ? 0.7 : 1 }}
                                    onClick={() => !isMeeting && !isJoined && !isWeekReserved && handleToggleSlot(slot.id)}
                                >
                                    <div className="flex items-center gap-1 font-medium">
                                        {isWeekReserved ? <Lock size={10} /> : <Clock size={10} />}
                                        <span className="hidden sm:inline">{slot.start} - {slot.end}</span>
                                        <span className="sm:hidden">{slot.start}</span>
                                    </div>
                                    {!isMeeting && (
                                        <div className={`text-[0.6rem] ${isSelected ? "text-blue-100" : "text-slate-400"}`}>
                                            {isWeekReserved ? 'Limit (3/3)' : `${slotRequests.length} participant${slotRequests.length !== 1 ? 's' : ''}`}
                                        </div>
                                    )}
                                    <div className={`text-[0.65rem] font-semibold ${isSelected ? "text-white" : isMeeting ? "text-emerald-600" : isJoined ? "text-blue-400" : isWeekReserved ? "text-slate-400" : "text-blue-500"}`}>
                                        {isMeeting ? "CONFIRMED" : isJoined ? "REQUESTED" : isSelected ? "SELECTED" : isWeekReserved ? "LIMIT REACHED" : "Available"}
                                    </div>
                                </div>
                            );
                        }}
                    />
                )}
            </div>

            {/* Floating selection bar */}
            {selectedSlots.length > 0 && (
                <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-white/95 border border-blue-200 rounded-full px-6 py-3 shadow-2xl flex items-center gap-4 backdrop-blur-md">
                    <span className="font-semibold text-slate-800 text-sm">{selectedSlots.length} slot(s) selected</span>
                    <button className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-full transition-colors cursor-pointer" onClick={() => setIsConfirmModalOpen(true)}>
                        Review & Confirm
                    </button>
                    <button className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer" onClick={() => setSelectedSlots([])}>
                        <X size={16} />
                    </button>
                </div>
            )}

            {/* Confirm modal */}
            {isConfirmModalOpen && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={() => setIsConfirmModalOpen(false)}>
                    <div className="relative bg-white/95 backdrop-blur-md border border-blue-100 rounded-2xl shadow-2xl w-full max-w-md p-6 animate-fade-in" onClick={e => e.stopPropagation()}>
                        <button onClick={() => setIsConfirmModalOpen(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 cursor-pointer transition-colors">
                            <X size={20} />
                        </button>
                        <h2 className="text-lg font-semibold text-slate-800 mb-1">Confirm Session Requests</h2>
                        <p className="text-sm text-slate-500 mb-4">You are about to request to join {selectedSlots.length} session(s). An admin will review and assign you a buddy.</p>

                        <div className="max-h-[200px] overflow-y-auto mb-4 flex flex-col gap-2">
                            {selectedSlots.map(id => {
                                const slot = availabilities.find(a => a.id === id);
                                if (!slot) return null;
                                return (
                                    <div key={id} className="flex items-center gap-3 px-3 py-2 bg-blue-50 rounded-lg text-sm">
                                        <Clock size={14} className="text-slate-400" />
                                        <span>{slot.date} | {slot.start} - {slot.end}</span>
                                    </div>
                                );
                            })}
                        </div>

                        <div className="mb-4 flex flex-col gap-1.5">
                            <label className="text-sm font-medium text-slate-700">
                                Topic to talk with the buddy <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-lg text-sm placeholder:text-slate-400 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition resize-vertical"
                                rows={3}
                                placeholder="E.g. I want to learn about React hooks"
                                value={topic}
                                onChange={(e) => setTopic(e.target.value)}
                                required
                            />
                            <div className="text-xs text-slate-400">This field is required.</div>
                        </div>

                        <div className="flex gap-3 justify-end">
                            <button className="px-4 py-2 text-sm bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors cursor-pointer" onClick={() => setIsConfirmModalOpen(false)}>Cancel</button>
                            <button className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white rounded-lg transition-colors cursor-pointer" onClick={handleConfirmSelection} disabled={!topic.trim()}>
                                Confirm Requests
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Toast */}
            {toast && (
                <div className={`fixed top-5 right-5 z-[1200] max-w-sm w-full px-4 py-3 rounded-xl border font-semibold text-sm text-white shadow-xl animate-fade-in
                    ${toast.type === 'success' ? 'bg-emerald-600/95 border-emerald-500/30' : 'bg-blue-600/95 border-blue-500/30'}`}>
                    {toast.message}
                </div>
            )}
        </div>
    );
}
