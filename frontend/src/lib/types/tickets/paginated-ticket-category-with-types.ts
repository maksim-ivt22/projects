import { PaginationBase } from "../pagination-base";
import { TicketCategoryWithTypes } from "./ticket-category-with-types";

export type PaginatedTicketCategoryWithTypes = PaginationBase & {
  results: TicketCategoryWithTypes[];
};
