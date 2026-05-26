"use client";

import { TicketCard } from "@/components/ticket-card";
import { Navbar } from "@/components/navbar";
import { useAuth } from "../../context/auth-context";
import Spinner from "../../components/spinner";
import { useEffect, useState } from "react";
import ticketsService from "../../services/tickets-service";
import { Ticket, TicketStatus } from "../../lib/types/tickets/ticket";
import { Separator } from "../../components/ui/separator";

export default function TicketsPage() {
  const { isLoading, user } = useAuth();
  const [ticketsList, setTickets] = useState<Ticket[]>([]);
  const [statusFilter, setStatusFilter] = useState<TicketStatus | "">("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [ordering, setOrdering] = useState<"created_at" | "-created_at">(
    "-created_at"
  );

  const fetchTickets = async () => {
    const tickets = await ticketsService.getTickets({
      status: statusFilter || undefined,
      dateFrom: dateFrom || undefined,
      dateTo: dateTo || undefined,
      ordering,
    });
    setTickets(tickets.results);
  };

  useEffect(() => {
    if (user) {
      fetchTickets();
    }
  }, [user, statusFilter, dateFrom, dateTo, ordering]);

  return (
    <>
      <div className="border-b mb-4">
        <h1 className="m-4 text-xl font-bold">Мои заявки</h1>
      </div>
      {isLoading && (
        <div className="flex h-[calc(100vh-160px)]">
          <Spinner className="m-auto" />
        </div>
      )}
      {!user ? (
        <div className="flex h-[calc(100vh-160px)]">
          <h1 className="m-auto font-medium">
            Вы не авторизованы. Пожалуйста, войдите в аккаунт
          </h1>
        </div>
      ) : (
        <div className="pb-20">
          <div className="px-4 mb-4 grid grid-cols-1 gap-2">
            <select
              className="border rounded-md p-2"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as TicketStatus | "")}
            >
              <option value="">Все статусы</option>
              <option value="PENDING_REVIEW">На рассмотрении</option>
              <option value="IN_PROGRESS">Работы ведутся</option>
              <option value="COMPLETED">Работы завершены</option>
              <option value="REJECTED">Отказано</option>
            </select>
            <input
              type="date"
              className="border rounded-md p-2"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
            />
            <input
              type="date"
              className="border rounded-md p-2"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
            />
            <select
              className="border rounded-md p-2"
              value={ordering}
              onChange={(e) =>
                setOrdering(e.target.value as "created_at" | "-created_at")
              }
            >
              <option value="-created_at">Сначала новые</option>
              <option value="created_at">Сначала старые</option>
            </select>
          </div>
          {ticketsList.map((ticket) => (
            <div key={ticket.id}>
              <TicketCard ticket={ticket} />
              <Separator className="my-4" />
            </div>
          ))}
        </div>
      )}
      <Navbar />
    </>
  );
}
