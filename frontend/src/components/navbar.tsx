"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "./ui/button";
import { Home, ListChecks, Newspaper, User } from "lucide-react";
import { cn } from "../lib/utils";

export function Navbar({ className }: { className?: string }) {
  const pathname = usePathname();

  const navItems = [
    { name: "Карта", icon: <Home className="h-5 w-5" />, path: "/dashboard" },
    {
      name: "Заявки",
      icon: <ListChecks className="h-5 w-5" />,
      path: "/requests",
    },
    { name: "Новости", icon: <Newspaper className="h-5 w-5" />, path: "/news" },
    { name: "Профиль", icon: <User className="h-5 w-5" />, path: "/profile" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 border-t bg-white p-2">
      <div className="flex justify-around">
        {navItems.map((item) => (
          <Button
            key={item.name}
            asChild
            variant="ghost"
            className={cn(
              `flex-col h-auto gap-1 ${
                pathname === item.path
                  ? "text-primary"
                  : "text-muted-foreground"
              }`,
              className
            )}
          >
            <Link href={item.path}>
              {item.icon}
              <span className="text-xs capitalize">{item.name}</span>
            </Link>
          </Button>
        ))}
      </div>
    </nav>
  );
}
