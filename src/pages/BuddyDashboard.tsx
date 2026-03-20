import { useAuth } from "../hooks/useAuth";
import { useData } from "../hooks/useData";
import { useBuddySchedule } from "../features/buddy/hooks/useBuddySchedule";
import { AvailabilityForm } from "../features/buddy/components/AvailabilityForm";
import { BuddyScheduleCalendar } from "../features/buddy/components/BuddyScheduleCalendar";
import { AddSlotConfirmModal } from "../features/buddy/components/AddSlotConfirmModal";
import { SlotDetailModal } from "../features/buddy/components/SlotDetailModal";
import { DeleteSlotModal } from "../features/buddy/components/DeleteSlotModal";
import { Toast } from "../shared/components/Toast";

export function BuddyDashboard() {
    const { user } = useAuth();
    const { users, availabilities } = useData();

    if (!user) return null;

    const {
        formState,
        viewState,
        modalState,
        allBuddySlots,
        toast
    } = useBuddySchedule();

    const handleAddSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        modalState.setIsAddConfirmOpen(true);
    };

    const handleDeleteRequest = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        modalState.setSlotToDelete(id);
    };

    return (
        <div className="py-6 flex flex-col gap-6 font-[Inter,sans-serif]">
            <AvailabilityForm
                date={formState.formDate}
                setDate={formState.setFormDate}
                start={formState.formStart}
                onStartChange={formState.handleStartChange}
                end={formState.formEnd}
                onAddSubmit={handleAddSubmit}
            />

            <BuddyScheduleCalendar
                slots={allBuddySlots}
                users={users}
                currentUserId={user.id}
                viewMode={viewState.viewMode}
                setViewMode={viewState.setViewMode}
                weekOffset={viewState.weekOffset}
                setWeekOffset={viewState.setWeekOffset}
                onSelectOwnSlot={modalState.setSelectedOwnSlotId}
                onDeleteSlot={handleDeleteRequest}
            />

            {modalState.isAddConfirmOpen && (
                <AddSlotConfirmModal
                    date={formState.formDate}
                    start={formState.formStart}
                    end={formState.formEnd}
                    onConfirm={modalState.confirmAddSlot}
                    onClose={() => modalState.setIsAddConfirmOpen(false)}
                />
            )}

            {modalState.selectedOwnSlotId && (() => {
                const slot = availabilities.find(a => a.id === modalState.selectedOwnSlotId);
                if (!slot) return null;
                return (
                    <SlotDetailModal
                        slot={slot}
                        onClose={() => modalState.setSelectedOwnSlotId(null)}
                        onDeleteRequest={() => {
                            modalState.setSelectedOwnSlotId(null);
                            modalState.setSlotToDelete(slot.id);
                        }}
                    />
                );
            })()}

            {modalState.slotToDelete && (
                <DeleteSlotModal
                    slot={availabilities.find(a => a.id === modalState.slotToDelete) || null}
                    onConfirm={modalState.confirmDelete}
                    onClose={() => modalState.setSlotToDelete(null)}
                />
            )}

            {toast && <Toast message={toast.message} type={toast.type} />}
        </div>
    );
}
