export type UserRole = "admin" | "partner" | "investor" | null;

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
}
