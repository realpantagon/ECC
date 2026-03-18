export interface Availability {
  id: string;
  buddyId: string;
  date: string; // Changed from 'day' to 'date' to store ISO strings like "2024-03-05"
  start: string;
  end: string;
  booked: boolean;
}

export interface SlotRequest {
  id: string;
  participantId: string;
  availabilityId: string;
  topic?: string;
}
