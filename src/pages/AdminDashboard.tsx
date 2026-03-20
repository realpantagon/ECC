import { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { useData } from "../hooks/useData";

// Shared
import { Toast } from "../shared/components/Toast";

// Admin Hooks
import { useAdminMeetings } from "../features/admin/hooks/useAdminMeetings";
import { useSessionReport } from "../features/admin/hooks/useSessionReport";
import { exportAttendanceCSV } from "../features/admin/utils/exportCSV";

// Admin Components
import { AdminTabs } from "../features/admin/components/AdminTabs";
import { PendingRequestsSection } from "../features/admin/components/PendingRequestsSection";
import { BuddyCalendarSection } from "../features/admin/components/BuddyCalendarSection";
import { BuddyStatsChart } from "../features/admin/components/BuddyStatsChart";
import { ParticipantGrid } from "../features/admin/components/ParticipantGrid";
import { ParticipantDetailModal } from "../features/admin/components/ParticipantDetailModal";
import { ReportFilterBar } from "../features/admin/components/ReportFilterBar";
import { SessionReportTable } from "../features/admin/components/SessionReportTable";
import { CompleteMeetingModal } from "../features/admin/components/CompleteMeetingModal";
import { CancelMeetingModal } from "../features/admin/components/CancelMeetingModal";
import { CancelRequestModal } from "../features/admin/components/CancelRequestModal";

export function AdminDashboard() {
    const { user } = useAuth();
    const { availabilities, users, requests, meetings, sessionLogs } = useData();
    const [adminTab, setAdminTab] = useState<"overview" | "participants" | "report">("overview");
    const [selectedParticipantId, setSelectedParticipantId] = useState<string | null>(null);

    // Filter users
    const buddies = users.filter((u) => u.role === "buddy");
    const participants = users.filter((u) => u.role === "participant");

    // Derived stats
    const buddyStats = buddies.map(buddy => ({
        name: buddy.name,
        sessions: sessionLogs.filter(log => log.buddyId === buddy.id).length,
    }));

    // Custom Hooks
    const meetingActions = useAdminMeetings(availabilities, participants, requests);
    const sessionReport = useSessionReport(meetings);

    if (!user) return null;

    return (
        <div className="py-6 flex flex-col gap-6 font-[Inter,sans-serif]">
            <AdminTabs activeTab={adminTab} onChange={setAdminTab} />

            {/* ── OVERVIEW TAB ── */}
            {adminTab === "overview" && (
                <>
                    <PendingRequestsSection
                        availabilities={availabilities}
                        buddies={buddies}
                        participants={participants}
                        requests={requests}
                        onCreateMeeting={meetingActions.handleCreateMeeting}
                        onCancelRequest={meetingActions.handleCancelRequestClick}
                    />
                    <BuddyCalendarSection availabilities={availabilities} buddies={buddies} />
                    <BuddyStatsChart stats={buddyStats} />
                </>
            )}

            {/* ── PARTICIPANTS TAB ── */}
            {adminTab === "participants" && (
                <div className="animate-fade-in">
                    <div className="flex justify-between items-center mb-4">
                        <div>
                            <h2 className="text-lg font-semibold text-slate-800">Participant Records</h2>
                            <p className="text-sm text-slate-500 mt-0.5">Open a participant card to view full details and session table.</p>
                        </div>
                        <button
                            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors cursor-pointer"
                            onClick={() => exportAttendanceCSV(participants, meetings)}
                        >
                            Export CSV
                        </button>
                    </div>
                    <ParticipantGrid
                        participants={participants}
                        meetings={meetings}
                        onSelectParticipant={setSelectedParticipantId}
                    />
                </div>
            )}

            {/* ── SESSION REPORT TAB ── */}
            {adminTab === "report" && (
                <div className="animate-fade-in">
                    <ReportFilterBar
                        filter={sessionReport.filter}
                        setField={sessionReport.setField}
                        hasFilters={sessionReport.hasFilters}
                        clearFilters={sessionReport.clearFilters}
                        weekOptions={sessionReport.weekOptions}
                        buddies={buddies}
                        participants={participants}
                    />
                    <SessionReportTable
                        meetings={sessionReport.filteredMeetings}
                        buddies={buddies}
                        participants={participants}
                        hasFilters={sessionReport.hasFilters}
                        onComplete={meetingActions.setCompleteMeetingTarget}
                        onCancel={meetingActions.setCancelMeetingTarget}
                    />
                </div>
            )}

            {/* ── MODALS & TOAST ── */}

            {selectedParticipantId && (() => {
                const p = participants.find(part => part.id === selectedParticipantId);
                if (!p) return null;
                return (
                    <ParticipantDetailModal
                        participant={p}
                        meetings={meetings}
                        buddies={buddies}
                        participants={participants}
                        onClose={() => setSelectedParticipantId(null)}
                    />
                );
            })()}

            {meetingActions.completeMeetingTarget && (
                <CompleteMeetingModal
                    meeting={meetingActions.completeMeetingTarget}
                    buddies={buddies}
                    participants={participants}
                    onConfirm={meetingActions.handleCompleteConfirm}
                    onClose={() => meetingActions.setCompleteMeetingTarget(null)}
                />
            )}

            {meetingActions.cancelMeetingTarget && (
                <CancelMeetingModal
                    meeting={meetingActions.cancelMeetingTarget}
                    buddies={buddies}
                    participants={participants}
                    onConfirm={meetingActions.handleCancelMeetingConfirm}
                    onClose={() => meetingActions.setCancelMeetingTarget(null)}
                />
            )}

            {meetingActions.cancelRequestTarget && (
                <CancelRequestModal
                    target={meetingActions.cancelRequestTarget}
                    onConfirm={meetingActions.handleCancelRequestConfirm}
                    onClose={() => meetingActions.setCancelRequestTarget(null)}
                />
            )}

            {meetingActions.toast && <Toast message={meetingActions.toast.message} type={meetingActions.toast.type} />}
        </div>
    );
}
