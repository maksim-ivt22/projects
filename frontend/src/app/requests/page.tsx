"use client";

import { TicketCard } from "@/components/ticket-card";
import { Navbar } from "@/components/navbar";
import { useAuth } from "../../context/auth-context";
import Spinner from "../../components/spinner";
import { useEffect, useState } from "react";
import ticketsService from "../../services/tickets-service";
import { Ticket } from "../../lib/types/tickets/ticket";
import { Separator } from "../../components/ui/separator";

export default function TicketsPage() {
  const { isLoading, user } = useAuth();
  const [ticketsList, setTickets] = useState<Ticket[]>([]);

  const fetchTickets = async () => {
    const tickets = await ticketsService.getTickets();
    setTickets(tickets.results);
  };

  useEffect(() => {
    if (user) {
      fetchTickets();
    }
  }, [user]);

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
