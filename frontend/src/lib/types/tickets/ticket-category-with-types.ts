import { TicketCategory } from "./ticket-category";
import { TicketType } from "./ticket-type";

export type TicketCategoryWithTypes = TicketCategory & {
  types: TicketType[];
};
