import { useState } from "react";
import { useData } from "../../../hooks/useData";
import { useToast } from "../../../shared/hooks/useToast";
import type { Meeting } from "../../../types/Meeting";
import type { Availability, SlotRequest } from "../../../types/Availability";
import type { User } from "../../../types/User";

interface CancelRequestTarget {
    id: string;
    participantName: string;
    slotDate: string;
}

/**
 * Encapsulates all admin meeting actions: create, complete, cancel meeting & request.
 * Returns handlers and confirmation-dialog state for each action.
 */
export function useAdminMeetings(
    availabilities: Availability[],
    participants: User[],
    requests: SlotRequest[],
) {
    const { createMeeting, cancelMeeting, cancelRequest, completeMeeting } = useData();
    const { toast, showToast } = useToast();

    const [completeMeetingTarget, setCompleteMeetingTarget] = useState<Meeting | null>(null);
    const [cancelMeetingTarget, setCancelMeetingTarget] = useState<Meeting | null>(null);
    const [cancelRequestTarget, setCancelRequestTarget] = useState<CancelRequestTarget | null>(null);

    const handleCreateMeeting = async (availabilityId: string, buddyId: string, partIds: string[]) => {
        await createMeeting(availabilityId, buddyId, partIds);
        showToast("Meeting created successfully", "success");
    };

    const handleCompleteConfirm = async () => {
        if (!completeMeetingTarget) return;
        await completeMeeting(completeMeetingTarget.id);
        setCompleteMeetingTarget(null);
        showToast("Meeting marked completed", "success");
    };

    const handleCancelMeetingConfirm = async () => {
        if (!cancelMeetingTarget) return;
        await cancelMeeting(cancelMeetingTarget.id);
        setCancelMeetingTarget(null);
        showToast("Meeting canceled", "info");
    };

    const handleCancelRequestClick = (requestId: string) => {
        const req = requests.find(r => r.id === requestId);
        if (!req) return;
        const slot = availabilities.find(a => a.id === req.availabilityId);
        const participant = participants.find(p => p.id === req.participantId);
        const slotLabel = slot
            ? `${new Date(slot.date).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })} ${slot.start}–${slot.end}`
            : 'Unknown slot';
        setCancelRequestTarget({ id: requestId, participantName: participant?.name || 'Unknown', slotDate: slotLabel });
    };

    const handleCancelRequestConfirm = async () => {
        if (!cancelRequestTarget) return;
        await cancelRequest(cancelRequestTarget.id);
        setCancelRequestTarget(null);
        showToast("Request canceled", "info");
    };

    return {
        toast,
        // Complete
        completeMeetingTarget,
        setCompleteMeetingTarget,
        handleCompleteConfirm,
        // Cancel meeting
        cancelMeetingTarget,
        setCancelMeetingTarget,
        handleCancelMeetingConfirm,
        // Cancel request
        cancelRequestTarget,
        setCancelRequestTarget,
        handleCancelRequestClick,
        handleCancelRequestConfirm,
        // Create
        handleCreateMeeting,
    };
}
