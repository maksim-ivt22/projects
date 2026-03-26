import { TicketType } from "./ticket-type";
import { User } from "../auth/user";

export type TicketStatus =
  | "PENDING_REVIEW"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "REJECTED";

export type Ticket = {
  id: number;
  title: string;
  address: string;
  image: string;
  description: string;
  createdAt: string;
  latitude: number;
  longitude: number;
  user: User;
  type: TicketType;
  status: TicketStatus;
};
