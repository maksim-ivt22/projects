import { PaginationBase } from "../pagination-base";
import { Ticket } from "./ticket";

export type PaginatedTickets = PaginationBase & {
  results: Ticket[];
};
