import { CalendarDays, Calendar as CalendarIcon, Clock, Check, Lock } from "lucide-react";
import { CalendarMonthView } from "../../../components/CalendarMonthView";
import { CalendarWeeklyView } from "../../../components/CalendarWeeklyView";
import { getISOWeekKey } from "../../../shared/utils/dateUtils";
import type { Availability, SlotRequest } from "../../../types/Availability";
import type { Meeting } from "../../../types/Meeting";

interface AvailableSessionsCalendarProps {
    viewMode: "month" | "calendar";
    setViewMode: (val: "month" | "calendar") => void;
    weekFilter: "this_week" | "next_week";
    setWeekFilter: (val: "this_week" | "next_week") => void;
    visibleSlots: Availability[];
    weeklySlots: Availability[];
    requests: SlotRequest[];
    pendingRequests: SlotRequest[];
    activeMeetings: Meeting[];
    selectedSlots: string[];
    handleToggleSlot: (id: string) => void;
    onViewPendingSlot: (slotId: string) => void;
    reservedCountByWeek: Map<string, number>;
    selectedCountByWeek: Map<string, number>;
}

export function AvailableSessionsCalendar({
    viewMode,
    setViewMode,
    weekFilter,
    setWeekFilter,
    visibleSlots,
    weeklySlots,
    requests,
    pendingRequests,
    activeMeetings,
    selectedSlots,
    handleToggleSlot,
    onViewPendingSlot,
    reservedCountByWeek,
    selectedCountByWeek,
}: AvailableSessionsCalendarProps) {
    const toggleBtn = (active: boolean) =>
        `px-3 py-1.5 text-xs font-medium rounded-md border-none cursor-pointer transition-all ${active ? "bg-white shadow-sm text-blue-600" : "bg-transparent text-slate-500 hover:text-slate-700"}`;

    const renderSlotContent = (slot: Availability, isMonthView: boolean) => {
        const slotRequests = requests.filter(r => r.availabilityId === slot.id);
        const isJoined = pendingRequests.some(r => r.availabilityId === slot.id);
        const isMeeting = activeMeetings.some(m => m.availabilityId === slot.id);
        const isReserved = slot.booked && !isMeeting;
        const isSelected = selectedSlots.includes(slot.id);
        const isPendingOther = !isJoined && !isMeeting && !isReserved && slotRequests.length > 0;

        const weekKey = getISOWeekKey(slot.date);
        const currentWeekCount = (reservedCountByWeek.get(weekKey) || 0) + (selectedCountByWeek.get(weekKey) || 0);
        const isWeekReserved = !isJoined && !isMeeting && !isReserved && !isPendingOther && !isSelected && currentWeekCount >= 3;
        const isDisabled = isMeeting || isReserved || isPendingOther || isWeekReserved;
        const handleSlotClick = () => {
            if (isJoined) {
                onViewPendingSlot(slot.id);
                return;
            }

            if (!isDisabled) {
                handleToggleSlot(slot.id);
            }
        };

        if (isMonthView) {
            return (
                <div
                    className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-[0.64rem] font-medium whitespace-nowrap transition-all
                        ${isWeekReserved ? "bg-slate-50 border border-slate-200 text-slate-400 opacity-60" :
                        isMeeting ? "bg-emerald-50 border border-emerald-300 text-emerald-700" :
                        isReserved ? "bg-slate-100 border border-slate-300 text-slate-500 opacity-80" :
                        isPendingOther ? "bg-slate-50 border border-slate-200 text-slate-400 opacity-70" :
                        isJoined ? "bg-amber-50 border border-amber-300 text-amber-700 hover:bg-amber-100 cursor-pointer" :
                        isSelected ? "bg-blue-600 border-blue-600 text-white" :
                        "bg-blue-50 border border-blue-200 text-blue-500 hover:bg-blue-100 cursor-pointer"}`}
                    title={
                        isWeekReserved
                            ? 'Weekly limit reached (3/3)'
                            : isJoined
                            ? `${slot.start} - ${slot.end} (Pending admin) - Click to view`
                            : `${slot.start} - ${slot.end} (${slotRequests.length} participants)`
                    }
                    onClick={handleSlotClick}
                >
                    {isWeekReserved ? <Lock size={8} /> : <Clock size={9} />}
                    <span>{slot.start} {slotRequests.length > 0 && !isMeeting ? `(${slotRequests.length})` : ""}</span>
                    {isMeeting ? <span className="text-emerald-400 text-[0.55rem]">★</span> :
                     isReserved ? <span className="text-[0.55rem]">•</span> :
                     isPendingOther ? <span className="text-[0.55rem]">•</span> :
                     isJoined ? <span className="text-[0.55rem]">●</span> :
                     isSelected ? <Check size={8} /> : null}
                </div>
            );
        }

        return (
            <div
                className={`text-xs rounded-lg p-1.5 flex flex-col gap-0.5 transition-all
                    ${isWeekReserved ? "bg-slate-50 border border-slate-200 opacity-60" :
                    isMeeting ? "bg-emerald-50 border border-emerald-200" :
                    isReserved ? "bg-slate-100 border border-slate-300 opacity-80" :
                    isPendingOther ? "bg-slate-50 border border-slate-200 opacity-70" :
                    isJoined ? "bg-amber-50 border border-amber-300 hover:bg-amber-100 cursor-pointer" :
                    isSelected ? "bg-blue-600 border-blue-600 text-white" :
                    "bg-blue-50 border border-blue-200 hover:bg-blue-100 cursor-pointer"}`}
                style={{ cursor: isDisabled && !isJoined ? 'default' : 'pointer', opacity: isWeekReserved ? 0.7 : 1 }}
                onClick={handleSlotClick}
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
                <div className={`text-[0.65rem] font-semibold ${isSelected ? "text-white" : isMeeting ? "text-emerald-600" : isJoined ? "text-amber-700" : isReserved || isPendingOther ? "text-slate-500" : isWeekReserved ? "text-slate-400" : "text-blue-500"}`}>
                    {isMeeting ? "CONFIRMED" : isReserved ? "RESERVED" : isJoined ? "MY PENDING" : isPendingOther ? "PENDING ADMIN" : isSelected ? "SELECTED" : isWeekReserved ? "LIMIT REACHED" : "Available"}
                </div>
            </div>
        );
    };

    return (
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
                    renderSlot={(slot) => renderSlotContent(slot, true)}
                />
            ) : (
                <CalendarWeeklyView
                    slots={weeklySlots}
                    weekOffset={weekFilter === 'this_week' ? 0 : 1}
                    renderSlot={(slot) => renderSlotContent(slot, false)}
                />
            )}
        </div>
    );
}
