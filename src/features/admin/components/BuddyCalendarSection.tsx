import { CalendarMonthView } from "../../../components/CalendarMonthView";
import { BUDDY_BG_COLORS, BUDDY_PILL_COLORS } from "../../../shared/constants";
import type { Availability } from "../../../types/Availability";
import type { User } from "../../../types/User";
import { Clock } from "lucide-react";

interface BuddyCalendarSectionProps {
    availabilities: Availability[];
    buddies: User[];
}

export function BuddyCalendarSection({ availabilities, buddies }: BuddyCalendarSectionProps) {
    return (
        <div className="animate-fade-in">
            <div className="flex justify-between items-center mb-3 flex-wrap gap-2">
                <h2 className="text-lg font-semibold text-slate-800">Buddy Availability Calendar</h2>
                {/* Legend */}
                <div className="flex gap-3 flex-wrap">
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
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                        : (BUDDY_PILL_COLORS[buddyIndex % BUDDY_PILL_COLORS.length] ?? BUDDY_PILL_COLORS[0]);
                    const buddy = buddies[buddyIndex];
                    return (
                        <div
                            className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-[0.64rem] font-medium whitespace-nowrap border ${color}`}
                            title={`${buddy?.name || 'Buddy'} – ${slot.start}–${slot.end}${slot.booked ? ' (Booked)' : ''}`}
                        >
                            <Clock size={8} />
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
