import { MeetingTable } from "../../../components/MeetingTable";
import type { Availability, SlotRequest } from "../../../types/Availability";
import type { User } from "../../../types/User";

interface PendingRequestsSectionProps {
    availabilities: Availability[];
    buddies: User[];
    participants: User[];
    requests: SlotRequest[];
    onCreateMeeting: (availabilityId: string, buddyId: string, partIds: string[]) => void;
    onCancelRequest: (requestId: string) => void;
}

export function PendingRequestsSection({
    availabilities,
    buddies,
    participants,
    requests,
    onCreateMeeting,
    onCancelRequest,
}: PendingRequestsSectionProps) {
    return (
        <div className="animate-fade-in">
            <h2 className="text-sm font-semibold text-slate-800 mb-0.5">Pending Meeting Requests</h2>
            <p className="text-xs text-slate-500 mb-2">
                Match buddies with participants who have requested slots.
            </p>
            <MeetingTable
                slots={availabilities}
                buddies={buddies}
                participants={participants}
                requests={requests}
                onCreateMeeting={onCreateMeeting}
                onCancelRequest={onCancelRequest}
            />
        </div>
    );
}
