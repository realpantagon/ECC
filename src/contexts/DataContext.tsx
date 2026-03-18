import { useState, useEffect, createContext, type ReactNode } from "react";
import type { User } from "../types/User";
import type { Availability, SlotRequest } from "../types/Availability";
import type { Meeting, SessionLog } from "../types/Meeting";
import { supabase } from "../lib/supabase";

function getISOWeekKey(dateStr: string): string {
    const parts = dateStr.split('-');
    const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
    const jan4 = new Date(d.getFullYear(), 0, 4);
    const dayDiff = (d.getTime() - jan4.getTime()) / 86400000;
    const weekNum = Math.ceil((dayDiff + jan4.getDay() + 1) / 7);
    return `${d.getFullYear()}-W${weekNum}`;
}

export interface DataContextType {
    users: User[];
    availabilities: Availability[];
    requests: SlotRequest[];
    meetings: Meeting[];
    sessionLogs: SessionLog[];

    // Buddy Actions
    addAvailability: (availability: Omit<Availability, "id">) => Promise<void>;
    deleteAvailability: (id: string) => Promise<void>;

    // Participant Actions
    requestSlot: (participantId: string, availabilityId: string, topic: string) => Promise<void>;

    // Admin Actions
    createMeeting: (availabilityId: string, buddyId: string, participants: string[]) => Promise<void>;
    cancelMeeting: (meetingId: string) => Promise<void>;
    cancelRequest: (requestId: string) => Promise<void>;
    completeMeeting: (meetingId: string) => Promise<void>;
    updateParticipantScore: (participantId: string, newScore: number) => Promise<void>;
}

export const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
    const [users, setUsers] = useState<User[]>([]);
    const [availabilities, setAvailabilities] = useState<Availability[]>([]);
    const [requests, setRequests] = useState<SlotRequest[]>([]);
    const [meetings, setMeetings] = useState<Meeting[]>([]);
    const [sessionLogs, setSessionLogs] = useState<SessionLog[]>([]);

    const fetchData = async () => {
        const [
            { data: usersData },
            { data: availData },
            { data: reqData },
            { data: meetData },
            { data: meetPartData },
            { data: logData }
        ] = await Promise.all([
            supabase.from('users').select('*'),
            supabase.from('availabilities').select('*'),
            supabase.from('slot_requests').select('*'),
            supabase.from('meetings').select('*'),
            supabase.from('meeting_participants').select('*'),
            supabase.from('session_logs').select('*')
        ]);

        if (usersData) {
            setUsers(usersData.map(u => ({ id: u.id, name: u.name, role: u.role, score: u.score || 0 })));
        }

        if (availData) {
            setAvailabilities(availData.map(a => ({
                id: a.id,
                buddyId: a.buddy_id,
                date: a.date,
                start: a.start_time.substring(0, 5),
                end: a.end_time.substring(0, 5),
                booked: a.booked
            })));
        }

        if (reqData) {
            setRequests(reqData.map(r => ({
                id: r.id,
                participantId: r.participant_id,
                availabilityId: r.availability_id,
                topic: r.topic
            })));
        }

        if (meetData) {
            setMeetings(meetData.map(m => {
                const availability = availData?.find(a => a.id === m.availability_id);
                const participants = meetPartData ? meetPartData.filter(mp => mp.meeting_id === m.id).map(mp => mp.participant_id) : [];
                const startStr = availability ? `${availability.date} ${availability.start_time.substring(0, 5)}` : m.start_time;
                const endStr = availability ? `${availability.date} ${availability.end_time.substring(0, 5)}` : m.end_time;
                return {
                    id: m.id,
                    availabilityId: m.availability_id,
                    buddyId: m.buddy_id,
                    participants,
                    start: startStr,
                    end: endStr,
                    status: m.status as "scheduled" | "completed" | "canceled",
                    topic: m.topic
                };
            }));
        }

        if (logData) {
            setSessionLogs(logData.map(l => {
                const participants = meetPartData ? meetPartData.filter(mp => mp.meeting_id === l.meeting_id).map(mp => mp.participant_id) : [];
                return {
                    id: l.id,
                    meetingId: l.meeting_id,
                    buddyId: l.buddy_id,
                    participants,
                    durationMinutes: l.duration_minutes
                };
            }));
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const addAvailability = async (availability: Omit<Availability, "id">) => {
        const { data, error } = await supabase.from('availabilities').insert([{
            buddy_id: availability.buddyId,
            date: availability.date,
            start_time: `${availability.start}:00`,
            end_time: `${availability.end}:00`,
            booked: availability.booked
        }]).select().single();

        if (error) {
            console.error("Error adding availability:", error);
            return;
        }

        if (data) {
            setAvailabilities(prev => [...prev, {
                id: data.id,
                buddyId: data.buddy_id,
                date: data.date,
                start: data.start_time.substring(0, 5),
                end: data.end_time.substring(0, 5),
                booked: data.booked
            }]);
        }
    };

    const deleteAvailability = async (id: string) => {
        const { error } = await supabase.from('availabilities').delete().eq('id', id);
        if (error) {
            console.error("Error deleting availability:", error);
            return;
        }
        setAvailabilities(prev => prev.filter((a) => a.id !== id));
    };

    const requestSlot = async (participantId: string, availabilityId: string, topic: string) => {
        const hasCanceledMeetingForSlot = meetings.some(
            m => m.participants.includes(participantId) && m.availabilityId === availabilityId && m.status === 'canceled'
        );

        const exists = requests.find(r => r.participantId === participantId && r.availabilityId === availabilityId);
        if (exists && !hasCanceledMeetingForSlot) return;

        // If a previous canceled meeting left a stale request record, clear it so the participant can reserve again.
        if (exists && hasCanceledMeetingForSlot) {
            await supabase
                .from('slot_requests')
                .delete()
                .eq('participant_id', participantId)
                .eq('availability_id', availabilityId);

            setRequests(prev => prev.filter(r => !(r.participantId === participantId && r.availabilityId === availabilityId)));
        }

        const normalizedTopic = topic.trim();
        if (!normalizedTopic) {
            console.warn("Topic is required when requesting a slot");
            return;
        }

        const targetSlot = availabilities.find(a => a.id === availabilityId);
        if (!targetSlot) return;

        const weekKey = getISOWeekKey(targetSlot.date);
        let reservedCount = 0;
        const countedAvailabilityIds = new Set<string>();

        const participantMeetings = meetings.filter(m => m.participants.includes(participantId));
        const activeMeetingSlotIds = new Set(
            participantMeetings
                .filter(m => m.status === 'scheduled' || m.status === 'completed')
                .map(m => m.availabilityId)
        );

        const canceledMeetingSlotIds = new Set(
            participantMeetings
                .filter(m => m.status === 'canceled')
                .map(m => m.availabilityId)
        );

        requests
            .filter(r => r.participantId === participantId)
            .forEach(r => {
                if (activeMeetingSlotIds.has(r.availabilityId)) return;
                if (canceledMeetingSlotIds.has(r.availabilityId)) return;
                if (countedAvailabilityIds.has(r.availabilityId)) return;

                const slot = availabilities.find(a => a.id === r.availabilityId);
                if (slot && getISOWeekKey(slot.date) === weekKey) {
                    countedAvailabilityIds.add(r.availabilityId);
                    reservedCount += 1;
                }
            });

        activeMeetingSlotIds.forEach(availabilityId => {
            if (countedAvailabilityIds.has(availabilityId)) return;
            const slot = availabilities.find(a => a.id === availabilityId);
            if (slot && getISOWeekKey(slot.date) === weekKey) {
                countedAvailabilityIds.add(availabilityId);
                reservedCount += 1;
            }
        });

        if (reservedCount >= 3) {
            console.warn("Weekly reservation limit reached for participant", participantId);
            return;
        }

        const { data, error } = await supabase.from('slot_requests').insert([{
            participant_id: participantId,
            availability_id: availabilityId,
            topic: normalizedTopic
        }]).select().single();

        if (error) {
            console.error("Error requesting slot:", error);
            return;
        }
        if (data) {
            setRequests(prev => [...prev, {
                id: data.id,
                participantId: data.participant_id,
                availabilityId: data.availability_id,
                topic: data.topic
            }]);
        }
    };

    const createMeeting = async (availabilityId: string, buddyId: string, participants: string[]) => {
        const availability = availabilities.find(a => a.id === availabilityId);

        if (!availability) return;

        const localStart = new Date(`${availability.date}T${availability.start}:00`);
        const localEnd = new Date(`${availability.date}T${availability.end}:00`);

        // Find the topic from the slot request
        const request = requests.find(r => r.availabilityId === availabilityId && participants.includes(r.participantId));
        const meetingTopic = request?.topic || null;

        const { data: mData, error: mError } = await supabase.from('meetings').insert([{
            availability_id: availabilityId,
            buddy_id: buddyId,
            start_time: localStart.toISOString(),
            end_time: localEnd.toISOString(),
            status: 'scheduled',
            topic: meetingTopic
        }]).select().single();

        if (mError || !mData) {
            console.error("Error creating meeting:", mError);
            return;
        }

        const participantInserts = participants.map(pid => ({
            meeting_id: mData.id,
            participant_id: pid
        }));
        await supabase.from('meeting_participants').insert(participantInserts);

        const { data: lData } = await supabase.from('session_logs').insert([{
            meeting_id: mData.id,
            buddy_id: buddyId,
            duration_minutes: 20
        }]).select().single();

        await supabase.from('availabilities').update({ booked: true }).eq('id', availabilityId);

        setMeetings(prev => [...prev, {
            id: mData.id,
            availabilityId: mData.availability_id,
            buddyId: mData.buddy_id,
            participants,
            start: `${availability.date} ${availability.start}`,
            end: `${availability.date} ${availability.end}`,
            status: "scheduled",
            topic: mData.topic
        }]);

        setAvailabilities(prev => prev.map(a => a.id === availabilityId ? { ...a, booked: true } : a));

        if (lData) {
            setSessionLogs(prev => [...prev, {
                id: lData.id,
                meetingId: lData.meeting_id,
                buddyId: lData.buddy_id,
                participants,
                durationMinutes: lData.duration_minutes
            }]);
        }
    };

    const cancelMeeting = async (meetingId: string) => {
        const meeting = meetings.find(m => m.id === meetingId);
        if (!meeting) return;

        const { error } = await supabase.from('meetings').update({ status: 'canceled' }).eq('id', meetingId);
        if (error) {
            console.error("Error canceling meeting:", error);
            return;
        }

        // Unbook the availability slot so it becomes available again
        await supabase.from('availabilities').update({ booked: false }).eq('id', meeting.availabilityId);

        setMeetings(prev => prev.map(m => m.id === meetingId ? { ...m, status: 'canceled' } : m));
        setAvailabilities(prev => prev.map(a => a.id === meeting.availabilityId ? { ...a, booked: false } : a));
    };

    const cancelRequest = async (requestId: string) => {
        const { error } = await supabase.from('slot_requests').delete().eq('id', requestId);
        if (error) {
            console.error("Error canceling request:", error);
            return;
        }
        setRequests(prev => prev.filter(r => r.id !== requestId));
    };

    const completeMeeting = async (meetingId: string) => {
        const meeting = meetings.find(m => m.id === meetingId);
        if (!meeting) return;

        // Mark meeting as completed
        const { error } = await supabase.from('meetings').update({ status: 'completed' }).eq('id', meetingId);
        if (error) { console.error("Error completing meeting:", error); return; }

        // Increment score for each participant (+1 per session)
        for (const pid of meeting.participants) {
            const participant = users.find(u => u.id === pid);
            if (participant) {
                const newScore = (participant.score || 0) + 1;
                await supabase.from('users').update({ score: newScore }).eq('id', pid);
                setUsers(prev => prev.map(u => u.id === pid ? { ...u, score: newScore } : u));
            }
        }

        // Insert session log
        await supabase.from('session_logs').insert([{
            meeting_id: meetingId,
            buddy_id: meeting.buddyId,
            duration_minutes: 20
        }]);

        setMeetings(prev => prev.map(m => m.id === meetingId ? { ...m, status: 'completed' } : m));
    };

    const updateParticipantScore = async (participantId: string, newScore: number) => {
        const { error } = await supabase.from('users').update({ score: newScore }).eq('id', participantId);
        if (error) {
            console.error("Error updating participant score:", error);
            return;
        }
        setUsers(prev => prev.map(u => u.id === participantId ? { ...u, score: newScore } : u));
    };

    return (
        <DataContext.Provider
            value={{
                users,
                availabilities,
                requests,
                meetings,
                sessionLogs,
                addAvailability,
                deleteAvailability,
                requestSlot,
                createMeeting,
                cancelMeeting,
                cancelRequest,
                completeMeeting,
                updateParticipantScore,
            }}
        >
            {children}
        </DataContext.Provider>
    );
}
