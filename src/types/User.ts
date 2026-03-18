export type Role = "admin" | "buddy" | "participant";

export interface User {
  id: string;
  name: string;
  role: Role;
  score?: number;
}
