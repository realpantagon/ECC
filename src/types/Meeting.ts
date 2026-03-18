export interface Meeting {
  id: string;
  availabilityId: string;
  buddyId: string;
  participants: string[];
  start: string;
  end: string;
  status: "scheduled" | "completed" | "canceled";
  topic?: string;
}

export interface SessionLog {
  id: string;
  meetingId: string;
  buddyId: string;
  participants: string[];
  durationMinutes: number;
}
