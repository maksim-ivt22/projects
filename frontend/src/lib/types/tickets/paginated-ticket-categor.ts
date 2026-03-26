import { PaginationBase } from "../pagination-base";
import { TicketCategory } from "./ticket-category";

export type PaginatedTicketCategory = PaginationBase & {
  results: TicketCategory[];
};
