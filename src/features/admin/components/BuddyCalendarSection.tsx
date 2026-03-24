import { CalendarMonthView } from "../../../components/CalendarMonthView";
import { BUDDY_BG_COLORS, BUDDY_PILL_COLORS } from "../../../shared/constants";
import type { Availability } from "../../../types/Availability";
import type { User } from "../../../types/User";
import { Clock } from "lucide-react";

interface BuddyCalendarSectionProps {
    availabilities: Availability[];
    buddies: User[];
    onSlotClick?: (slot: Availability) => void;
}

export function BuddyCalendarSection({ availabilities, buddies, onSlotClick }: BuddyCalendarSectionProps) {
    return (
        <div className="animate-fade-in">
            <div className="flex justify-between items-center mb-2 flex-wrap gap-2">
                <h2 className="text-sm font-semibold text-slate-800">Buddy Availability Calendar</h2>
                {/* Legend */}
                <div className="flex gap-4 flex-wrap">
                    <div className="flex items-center gap-1.5 text-xs text-slate-600 font-medium border-r border-slate-200 pr-4">
                        <span className="w-3 h-3 rounded-sm bg-purple-600" />
                        Booked Session
                    </div>
                    {buddies.map((b, i) => (
                        <div key={b.id} className="flex items-center gap-1.5 text-xs text-slate-500">
                            <span className={`w-2.5 h-2.5 rounded-full ${BUDDY_BG_COLORS[i % BUDDY_BG_COLORS.length]}`} />
                            {b.name}
                        </div>
                    ))}
                </div>
            </div>
            <CalendarMonthView
                slots={availabilities}
                renderSlot={(slot) => {
                    const buddyIndex = buddies.findIndex(b => b.id === slot.buddyId);
                    const color = slot.booked
                        ? 'bg-purple-600 border-purple-700 text-white shadow-sm font-bold z-10'
                        : (BUDDY_PILL_COLORS[buddyIndex % BUDDY_PILL_COLORS.length] ?? BUDDY_PILL_COLORS[0]);
                    const buddy = buddies[buddyIndex];
                    return (
                        <div
                            className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-[0.64rem] font-medium whitespace-nowrap transition-transform hover:scale-[1.02] cursor-pointer ${color} ${slot.booked ? 'border' : 'border'}`}
                            title={`${buddy?.name || 'Buddy'} – ${slot.start}–${slot.end}${slot.booked ? ' (Booked)' : ''}`}
                            onClick={() => onSlotClick && onSlotClick(slot)}
                        >
                            <Clock size={8} className={slot.booked ? "text-purple-200" : ""} />
                            <span className="overflow-hidden text-ellipsis">
                                {slot.start} {buddy?.name?.split(' ')[0]}
                            </span>
                        </div>
                    );
                }}
            />
        </div>
    );
}
