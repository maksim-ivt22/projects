"use client";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Ticket } from "../lib/types/tickets/ticket";
import ticketsService from "../services/tickets-service";
import { cn } from "../lib/utils";
import { Icon } from "@iconify/react";
import { AspectRatio } from "./ui/aspect-ratio";

export function TicketCard({ ticket }: { ticket: Ticket }) {
  const bgBadgeColor = ticketsService.statusToBgColorClass(ticket.status);
  const badgeColor = ticketsService.statusToColorClass(ticket.status);

  return (
    <Link href={`/requests/${ticket.id}`} className="block">
      <div className="hover:bg-gray-50 transition-colors">
        <div className="px-4 rounded-lg mb-4">
          <div className="flex justify-between items-center mb-3">
            <Badge className={cn(bgBadgeColor, "p-1 pr-3 text-foreground")}>
              <div className={cn(badgeColor, "h-4 w-4 rounded-full")} />
              <span className="font-semibold">
                {ticketsService.statusToString(ticket.status)}
              </span>
            </Badge>
            <span className="text-sm text-gray-500">
              {new Date(ticket.createdAt).toLocaleDateString()}
            </span>
          </div>

          <h6 className="font-semibold text-xl">{ticket.title}</h6>

          <div className="">
            <div className="flex items-center flex-wrap space-x-1">
              <p>{ticket.type.category.title}</p>
              <Icon icon={"solar:arrow-right-linear"} className="" />
              <p>{ticket.type.title}</p>
            </div>
            <p className="text-sm mt-0.5">{ticket.address}</p>
          </div>
        </div>

        {ticket.image && (
          <AspectRatio ratio={16 / 9}>
            <img
              src={ticket.image}
              alt={`Фото заявки: ${ticket.title}`}
              className="object-cover w-full h-full"
            />
          </AspectRatio>
        )}
      </div>
    </Link>
  );
}
