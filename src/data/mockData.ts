import type { User } from "../types/User";
import type { Availability, SlotRequest } from "../types/Availability";
import type { Meeting, SessionLog } from "../types/Meeting";

export const users: User[] = [
  { id: "u1", name: "Admin", role: "admin" },
  { id: "b1", name: "Alice", role: "buddy" },
  { id: "b2", name: "John", role: "buddy" },
  { id: "p1", name: "Mike", role: "participant" },
  { id: "p2", name: "Sarah", role: "participant" },
  { id: "p3", name: "David", role: "participant" }
];

export const buddyAvailability: Availability[] = [
  {
    id: "a1",
    buddyId: "b1",
    date: new Date().toISOString().split("T")[0], // Today
    start: "10:00",
    end: "11:00",
    booked: false
  },
  {
    id: "a2",
    buddyId: "b1",
    date: new Date(Date.now() + 86400000 * 2).toISOString().split("T")[0], // 2 Days from now
    start: "14:00",
    end: "15:00",
    booked: false
  },
  {
    id: "a3",
    buddyId: "b2",
    date: new Date(Date.now() + 86400000 * 1).toISOString().split("T")[0], // Tomorrow
    start: "13:00",
    end: "14:00",
    booked: false
  }
];

export const participantRequests: SlotRequest[] = [
  {
    id: "r1",
    participantId: "p1",
    availabilityId: "a1"
  },
  {
    id: "r2",
    participantId: "p2",
    availabilityId: "a1"
  },
  {
    id: "r3",
    participantId: "p3",
    availabilityId: "a3"
  }
];

export const meetings: Meeting[] = [
  {
    id: "m1",
    availabilityId: "a1",
    buddyId: "b1",
    participants: ["p1", "p2"],
    start: `${new Date().toISOString().split("T")[0]} 10:00`,
    end: `${new Date().toISOString().split("T")[0]} 11:00`,
    status: "completed"
  }
];

export const sessionLogs: SessionLog[] = [
  {
    id: "log1",
    meetingId: "m1",
    buddyId: "b1",
    participants: ["p1", "p2"],
    durationMinutes: 60
  }
];
