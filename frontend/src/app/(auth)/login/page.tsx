"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/input";
import { useAuth } from "../../../context/auth-context";
import { useState } from "react";

export default function Login() {
  const router = useRouter();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  return (
    <div className="flex flex-col h-full max-w-[412px] mx-auto bg-white p-6">
      <div className="flex items-center mb-6">
        <button
          onClick={() => router.back()}
          className="text-gray-500 hover:text-gray-700 mr-4"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>
        <h1 className="text-2xl font-bold text-gray-800">Вход</h1>
      </div>

      <form className="space-y-4">
        <label className="block text-sm text-gray-600 mb-1">
          Электронная почта
        </label>
        <Input
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          placeholder="..."
        />
        <label className="block text-sm text-gray-600 mb-1">Пароль</label>
        <Input
          onChange={(e) =>
            setFormData({ ...formData, password: e.target.value })
          }
          type={"password"}
          placeholder="..."
        />
        <Button
          className="w-full"
          type="button"
          onClick={() => {
            login(formData);
            router.push("/dashboard");
          }}
        >
          Войти
        </Button>
      </form>

      <div className="text-center text-sm text-gray-500 mt-4">
        Нет аккаунта?{" "}
        <Link href="/register" className="text-primary hover:underline">
          Зарегистрироваться
        </Link>
      </div>
    </div>
  );
}
