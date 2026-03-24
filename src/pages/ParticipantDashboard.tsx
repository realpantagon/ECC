import { useData } from "../hooks/useData";
import { useAuth } from "../hooks/useAuth";
import { useParticipantSlots } from "../features/participant/hooks/useParticipantSlots";
import { ParticipantStats } from "../features/participant/components/ParticipantStats";
import { SessionsTable } from "../features/participant/components/SessionsTable";
import { MeetingCards } from "../features/participant/components/MeetingCards";
import { AvailableSessionsCalendar } from "../features/participant/components/AvailableSessionsCalendar";
import { SlotSelectionBar } from "../features/participant/components/SlotSelectionBar";
import { ConfirmRequestModal } from "../features/participant/components/ConfirmRequestModal";
import { Toast } from "../shared/components/Toast";

export function ParticipantDashboard() {
    const { user } = useAuth();
    const { availabilities, requests, users } = useData();
    const {
        mySettings,
        slotsCtx,
        handleToggleSlot,
        modalState,
        toast,
        myMeetings,
    } = useParticipantSlots();

    if (!user) return null;

    const completedCount = myMeetings.filter(m => m.status === 'completed').length;

    return (
        <div className="py-6 flex flex-col gap-6 font-[Inter,sans-serif]">
            <ParticipantStats name={user.name} completedCount={completedCount} />

            <SessionsTable
                myMeetings={myMeetings}
                users={users}
                availabilities={availabilities}
            />

            <MeetingCards
                myMeetings={myMeetings}
                users={users}
            />

            <AvailableSessionsCalendar
                viewMode={mySettings.viewMode}
                setViewMode={mySettings.setViewMode}
                weekFilter={mySettings.weekFilter}
                setWeekFilter={mySettings.setWeekFilter}
                visibleSlots={slotsCtx.visibleSlots}
                weeklySlots={slotsCtx.weeklySlots}
                requests={requests}
                pendingRequests={slotsCtx.pendingRequests}
                activeMeetings={slotsCtx.activeMeetings}
                selectedSlots={slotsCtx.selectedSlots}
                handleToggleSlot={handleToggleSlot}
                reservedCountByWeek={slotsCtx.reservedCountByWeek}
                selectedCountByWeek={slotsCtx.selectedCountByWeek}
            />

            <SlotSelectionBar
                selectedCount={slotsCtx.selectedSlots.length}
                onReviewClick={() => modalState.setIsConfirmModalOpen(true)}
                onClear={() => slotsCtx.selectedSlots.forEach(id => handleToggleSlot(id))}
            />

            {modalState.isConfirmModalOpen && (
                <ConfirmRequestModal
                    selectedSlots={slotsCtx.selectedSlots}
                    availabilities={availabilities}
                    topics={modalState.topics}
                    setTopics={modalState.setTopics}
                    onConfirm={modalState.handleConfirmSelection}
                    onClose={() => modalState.setIsConfirmModalOpen(false)}
                />
            )}

            {toast && <Toast message={toast.message} type={toast.type} />}
        </div>
    );
}
