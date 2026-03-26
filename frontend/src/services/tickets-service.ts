import api from "../lib/api-client";
import { CreateTicketInput } from "../lib/types/tickets/create-ticket-input";
import { PaginatedTicketCategory } from "../lib/types/tickets/paginated-ticket-categor";
import { PaginatedTickets } from "../lib/types/tickets/paginated-tickets";
import { Ticket, TicketStatus } from "../lib/types/tickets/ticket";
import { TicketCategoryWithTypes } from "../lib/types/tickets/ticket-category-with-types";

class TicketsService {
  async createTicket(input: CreateTicketInput) {
    const formData = new FormData();

    formData.append("latitude", input.latitude.toString());
    formData.append("longitude", input.longitude.toString());
    formData.append("title", input.title);
    formData.append("address", input.address);
    formData.append("typeId", input.typeId.toString());

    if (input.description) {
      formData.append("description", input.description);
    }

    if (input.image) {
      formData.append("image", input.image);
    }

    const ticket: Ticket = (
      await api.post("tickets/", input, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
    ).data;
    return ticket;
  }

  async getTickets(): Promise<PaginatedTickets> {
    const data: PaginatedTickets = (await api.get(`tickets/`)).data;
    return data;
  }

  async getTicketDetails(id: number): Promise<Ticket> {
    const ticket: Ticket = (await api.get(`tickets/${id}/`)).data;
    return ticket;
  }

  async getCategories(): Promise<PaginatedTicketCategory> {
    const data: PaginatedTicketCategory = (await api.get(`ticket-categories/`))
      .data;
    return data;
  }

  async getCategory(id: number): Promise<TicketCategoryWithTypes> {
    const data: TicketCategoryWithTypes = (
      await api.get(`ticket-categories/${id}/`)
    ).data;
    return data;
  }

  statusToString(status: TicketStatus): string {
    switch (status) {
      case "PENDING_REVIEW":
        return "На рассмотрении";
      case "IN_PROGRESS":
        return "Работы ведутся";
      case "COMPLETED":
        return "Работы завершены";
      case "REJECTED":
        return "Отказано";
      default:
        const exhaustiveCheck: never = status;
        return exhaustiveCheck;
    }
  }

  statusToColorClass(status: TicketStatus): string {
    switch (status) {
      case "PENDING_REVIEW":
        return "bg-amber-300";
      case "IN_PROGRESS":
        return "bg-primary";
      case "COMPLETED":
        return "bg-secondary";
      case "REJECTED":
        return "bg-destructive";
      default:
        const exhaustiveCheck: never = status;
        return exhaustiveCheck;
    }
  }

  statusToBgColorClass(status: TicketStatus): string {
    switch (status) {
      case "PENDING_REVIEW":
        return "bg-amber-300/20";
      case "IN_PROGRESS":
        return "bg-primary/20";
      case "COMPLETED":
        return "bg-secondary/20";
      case "REJECTED":
        return "bg-destructive/20";
      default:
        const exhaustiveCheck: never = status;
        return exhaustiveCheck;
    }
  }
}

export default new TicketsService();
