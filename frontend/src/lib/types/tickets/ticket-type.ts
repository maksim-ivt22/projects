import { TicketCategory } from "./ticket-category";

export type TicketType = {
  id: number;
  title: string;
  category: TicketCategory;
};
