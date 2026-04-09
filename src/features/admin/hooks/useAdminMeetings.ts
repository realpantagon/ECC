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
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleCreateMeeting = async (availabilityId: string, buddyId: string, partIds: string[]) => {
        if (isSubmitting) return;
        setIsSubmitting(true);
        try {
            await createMeeting(availabilityId, buddyId, partIds);
            showToast("Meeting created successfully", "success");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCompleteConfirm = async () => {
        if (!completeMeetingTarget || isSubmitting) return;
        setIsSubmitting(true);
        try {
            await completeMeeting(completeMeetingTarget.id);
            setCompleteMeetingTarget(null);
            showToast("Meeting marked completed", "success");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCancelMeetingConfirm = async () => {
        if (!cancelMeetingTarget || isSubmitting) return;
        setIsSubmitting(true);
        try {
            await cancelMeeting(cancelMeetingTarget.id);
            setCancelMeetingTarget(null);
            showToast("Meeting canceled", "info");
        } finally {
            setIsSubmitting(false);
        }
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
        if (!cancelRequestTarget || isSubmitting) return;
        setIsSubmitting(true);
        try {
            await cancelRequest(cancelRequestTarget.id);
            setCancelRequestTarget(null);
            showToast("Request canceled", "info");
        } finally {
            setIsSubmitting(false);
        }
    };

    return {
        toast,
        isSubmitting,
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
