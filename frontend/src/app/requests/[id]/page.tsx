"use client";
import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useEffect, useMemo, useState } from "react";
import { Ticket } from "../../../lib/types/tickets/ticket";
import ticketsService from "../../../services/tickets-service";
import { cn } from "../../../lib/utils";
import { Icon } from "@iconify/react";
import { AspectRatio } from "../../../components/ui/aspect-ratio";
import Spinner from "../../../components/spinner";
import { useAuth } from "../../../context/auth-context";

export default function RequestDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const { isLoading: isUserLoading, user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const bgBadgeColor = useMemo(
    () => (ticket ? ticketsService.statusToBgColorClass(ticket.status) : ""),
    [ticket]
  );
  const badgeColor = useMemo(
    () => (ticket ? ticketsService.statusToColorClass(ticket.status) : ""),
    [ticket]
  );

  const fetchTicket = async () => {
    try {
      if (user) {
        setIsLoading(true);
        const { id } = await params;
        const ticketResponse = await ticketsService.getTicketDetails(
          Number(id)
        );
        setTicket(ticketResponse);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTicket();
  }, [user]);

  return (
    <>
      <div className="border-b mb-4">
        <button
          onClick={() => router.back()}
          className="m-4 text-xl font-bold flex items-center cursor-pointer"
        >
          <ChevronLeft className="text-xl font-bold" />
          <h1>Заявка</h1>
        </button>
      </div>
      {isLoading || isUserLoading ? (
        <div className="flex h-screen w-full">
          <Spinner className="m-auto" />
        </div>
      ) : !user ? (
        <div className="flex h-screen w-full">
          <h1 className="m-auto">Вы не авторизованы</h1>
        </div>
      ) : !ticket ? (
        <div className="flex h-screen w-full">
          <h1 className="m-auto">Не удалось загрузить заявку</h1>
        </div>
      ) : (
        <div>
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

            <div className="text-muted-foreground">
              <div className="flex items-center flex-wrap space-x-1">
                <p>{ticket.type.category.title}</p>
                <Icon icon={"solar:arrow-right-linear"} className="" />
                <p>{ticket.type.title}</p>
              </div>
              <p>{ticket.address}</p>
            </div>

            <div className="pt-2">
              <p>{ticket.description}</p>
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
      )}
    </>
  );
}
