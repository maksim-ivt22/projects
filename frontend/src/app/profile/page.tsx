"use client";

import { Navbar } from "@/components/navbar";
import { useState } from "react";
import Image from "next/image";
import { useAuth } from "../../context/auth-context";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [activeItem, setActiveItem] = useState<string | null>(null);

  const toggleItem = (itemName: string) => {
    setActiveItem(activeItem === itemName ? null : itemName);
  };

  return (
    <div
      className="w-full max-w-md mx-auto bg-white"
      style={{ minHeight: "917px" }}
    >
      <Navbar />

      <div className="p-4">
        <h1 className="text-2xl font-bold mb-6">Профиль</h1>

        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2">{user?.fullName}</h2>
          {/* <p className="text-gray-500 mb-1">15.04.1992</p> */}
          <p className="text-gray-500 mb-4">{user?.email}</p>

          {/* <button className="text-blue-500 font-medium">Редактировать</button> */}
        </div>

        <div className="border-t border-gray-200 pt-2">
          <AccordionItem
            title="Пользовательское соглашение"
            isActive={activeItem === "agreement"}
            onClick={() => toggleItem("agreement")}
          >
            <div className="text-sm text-gray-600 mb-4 mr-16">
              <p>Здесь будет текст пользовательского соглашения...</p>
              <p className="">Полный текст доступен по ссылке на наш сайт.</p>
            </div>
          </AccordionItem>

          <AccordionItem
            title="О проекте"
            isActive={activeItem === "about"}
            onClick={() => toggleItem("about")}
          >
            <div className="text-sm text-gray-600 mb-4 mr-16">
              <p>
                Проект PAGD CITY 2025 - это инновационная платформа для
                улучшения городского благоустройства
              </p>
              <p className="">Версия приложения: 1.0.0</p>
            </div>
          </AccordionItem>

          <AccordionItem
            title="Контакты"
            isActive={activeItem === "contacts"}
            onClick={() => toggleItem("contacts")}
          >
            <div className="text-sm text-gray-600  mb-4 mr-16">
              <p>Email: pagdcity@mail.ru</p>
              <p className="">Телефон: +7 (914) 235-66-90</p>
              <p className="">Адрес: г. Якутск, ул. Кулаковского, 48</p>
            </div>
          </AccordionItem>

          <button
            className="w-full py-4 text-left text-red-500 border-b border-gray-100 cursor-pointer"
            onClick={() => {
              logout();
              router.push("/");
            }}
          >
            Выйти из аккаунта
          </button>
        </div>
      </div>
    </div>
  );
}

function AccordionItem({
  title,
  isActive,
  onClick,
  children,
}: {
  title: string;
  isActive: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="border-b border-gray-100">
      <button
        onClick={onClick}
        className="w-full py-4 text-left flex justify-between items-center"
      >
        <span>{title}</span>
        <Image
          src="/vector.svg"
          alt="стрелка"
          width={16}
          height={16}
          className={`transition-transform ${isActive ? "rotate-90" : ""}`}
        />
      </button>

      <div
        className={`overflow-hidden transition-all duration-300 ${
          isActive ? "max-h-96" : "max-h-0"
        }`}
      >
        {children}
      </div>
    </div>
  );
}
