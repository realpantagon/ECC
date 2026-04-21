import { useState } from "react";
import { useData } from "../../../hooks/useData";
import { useAuth } from "../../../hooks/useAuth";
import { useToast } from "../../../shared/hooks/useToast";
import { getISOWeekKey, getTwoWeekWindow } from "../../../shared/utils/dateUtils";

export function useParticipantSlots() {
    const { user } = useAuth();
    const { availabilities, requests, meetings, requestSlot } = useData();
    const { toast, showToast } = useToast();

    const [weekFilter, setWeekFilter] = useState<"this_week" | "next_week">("this_week");
    const [viewMode, setViewMode] = useState<"month" | "calendar">("month");
    const [selectedSlots, setSelectedSlots] = useState<string[]>([]);
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [topics, setTopics] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!user) throw new Error("Participant hooks require user");

    const myRequests = requests.filter(r => r.participantId === user.id);
    const myMeetings = meetings.filter(m => m.participants.includes(user.id));
    const activeMeetings = myMeetings.filter(m => m.status === 'scheduled' || m.status === 'completed');

    const hasMeetingForSlot = (participantId: string, availabilityId: string) =>
        meetings.some(m => m.availabilityId === availabilityId && m.participants.includes(participantId));

    const pendingRequests = myRequests.filter(r => !hasMeetingForSlot(user.id, r.availabilityId));
    const getSlotById = (slotId: string) => availabilities.find(a => a.id === slotId);

    const { thisWeekStart, nextWeekStart, nextWeekEnd } = getTwoWeekWindow();

    const visibleSlots = availabilities.filter(a => {
        const parts = a.date.split('-');
        if (parts.length !== 3) return false;

        return true;
    });

    const reservedCountByWeek = new Map<string, number>();
    const incrementReserved = (slotId: string) => {
        const slot = getSlotById(slotId);
        if (!slot) return;
        const wk = getISOWeekKey(slot.date);
        reservedCountByWeek.set(wk, (reservedCountByWeek.get(wk) || 0) + 1);
    };
    pendingRequests.forEach(req => incrementReserved(req.availabilityId));
    activeMeetings.forEach(m => incrementReserved(m.availabilityId));

    const weeklySlots = visibleSlots.filter(a => {
        const parts = a.date.split('-');
        const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
        if (weekFilter === "this_week") {
            const thisWeekEnd = new Date(thisWeekStart);
            thisWeekEnd.setDate(thisWeekEnd.getDate() + 4);
            thisWeekEnd.setHours(23, 59, 59, 999);
            return d >= thisWeekStart && d <= thisWeekEnd;
        } else {
            return d >= nextWeekStart && d <= nextWeekEnd;
        }
    }).sort((a, b) => a.date.localeCompare(b.date) !== 0 ? a.date.localeCompare(b.date) : a.start.localeCompare(b.start));

    const selectedCountByWeek = new Map<string, number>();
    selectedSlots.forEach(id => {
        const slot = getSlotById(id);
        if (!slot) return;
        const wk = getISOWeekKey(slot.date);
        selectedCountByWeek.set(wk, (selectedCountByWeek.get(wk) || 0) + 1);
    });

    const handleToggleSlot = (slotId: string) => {
        const slot = getSlotById(slotId);
        if (!slot) return;

        const alreadySelected = selectedSlots.includes(slotId);
        if (!alreadySelected) {
            const wk = getISOWeekKey(slot.date);
            const reservedCount = reservedCountByWeek.get(wk) || 0;
            const selectedCount = selectedCountByWeek.get(wk) || 0;
            if (reservedCount + selectedCount >= 3) return; // limit 3 slots per week
        }

        setSelectedSlots(prev => {
            if (prev.includes(slotId)) {
                setTopics(t => {
                    const newT = { ...t };
                    delete newT[slotId];
                    return newT;
                });
                return prev.filter(id => id !== slotId);
            }
            return [...prev, slotId];
        });
    };

    const handleConfirmSelection = async () => {
        const missingTopics = selectedSlots.some(id => !topics[id]?.trim());
        if (missingTopics) {
            showToast("Topic is required for each session", "info");
            return;
        }
        if (isSubmitting) return;
        setIsSubmitting(true);
        try {
            await Promise.all(selectedSlots.map(slotId => requestSlot(user.id, slotId, topics[slotId].trim())));
            setSelectedSlots([]);
            setTopics({});
            setIsConfirmModalOpen(false);
            showToast("Reservation request sent", "success");
        } catch (error) {
            const message = error instanceof Error ? error.message : "Failed to request slot";

            if (message.includes("Slot already requested by another participant")) {
                showToast("Slot already requested by another participant", "error");
                return;
            }

            showToast(message, "error");
        } finally {
            setIsSubmitting(false);
        }
    };

    return {
        mySettings: { weekFilter, setWeekFilter, viewMode, setViewMode },
        slotsCtx: { visibleSlots, weeklySlots, pendingRequests, activeMeetings, reservedCountByWeek, selectedCountByWeek, selectedSlots },
        handleToggleSlot,
        modalState: { isConfirmModalOpen, setIsConfirmModalOpen, topics, setTopics, handleConfirmSelection, isSubmitting },
        toast,
        myMeetings,
    };
}
