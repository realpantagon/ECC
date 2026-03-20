import { useState } from "react";
import { useData } from "../../../hooks/useData";
import { useAuth } from "../../../hooks/useAuth";
import { useToast } from "../../../shared/hooks/useToast";
export function useBuddySchedule() {
    const { user } = useAuth();
    const { availabilities, users, addAvailability, deleteAvailability } = useData();
    const { toast, showToast } = useToast(2400);

    const [formDate, setFormDate] = useState(() => new Date().toISOString().split("T")[0]);
    const [formStart, setFormStart] = useState("09:00");
    const [formEnd, setFormEnd] = useState("09:20");

    const [viewMode, setViewMode] = useState<"month" | "calendar">("month");
    const [weekOffset, setWeekOffset] = useState<0 | 1>(0);

    const [selectedOwnSlotId, setSelectedOwnSlotId] = useState<string | null>(null);
    const [slotToDelete, setSlotToDelete] = useState<string | null>(null);
    const [isAddConfirmOpen, setIsAddConfirmOpen] = useState(false);

    if (!user) throw new Error("Buddy hooks require user");

    const allBuddySlots = availabilities.filter(a => {
        if (a.buddyId === user.id) return true;
        const buddy = users.find(u => u.id === a.buddyId);
        return buddy && buddy.role === "buddy";
    });

    const handleStartChange = (newStart: string) => {
        setFormStart(newStart);
        if (newStart) {
            const [hours, minutes] = newStart.split(":").map(Number);
            const endDate = new Date();
            endDate.setHours(hours, minutes + 20);
            const endHours = String(endDate.getHours()).padStart(2, "0");
            const endMins = String(endDate.getMinutes()).padStart(2, "0");
            setFormEnd(`${endHours}:${endMins}`);
        }
    };

    const confirmAddSlot = () => {
        addAvailability({ buddyId: user.id, date: formDate, start: formStart, end: formEnd, booked: false });
        setIsAddConfirmOpen(false);
        showToast("Availability slot added", "success");
    };

    const confirmDelete = () => {
        if (slotToDelete) {
            deleteAvailability(slotToDelete);
            setSlotToDelete(null);
            showToast("Availability slot removed", "info");
        }
    };

    return {
        formState: { formDate, setFormDate, formStart, formEnd, handleStartChange },
        viewState: { viewMode, setViewMode, weekOffset, setWeekOffset },
        modalState: {
            isAddConfirmOpen, setIsAddConfirmOpen, confirmAddSlot,
            selectedOwnSlotId, setSelectedOwnSlotId,
            slotToDelete, setSlotToDelete, confirmDelete
        },
        allBuddySlots,
        toast
    };
}
