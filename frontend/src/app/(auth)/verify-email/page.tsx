"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useRegisterFormStore } from "../../../providers/register-form-store-provider";
import { useAuth } from "../../../context/auth-context";

export default function VerifyEmail() {
  const router = useRouter();
  const { formData } = useRegisterFormStore((state) => state);
  const { register, login } = useAuth();
  const email = useSearchParams().get("email");
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (index: number, value: string) => {
    if (/^\d*$/.test(value) && value.length <= 1) {
      const newCode = [...code];
      newCode[index] = value;
      setCode(newCode);

      // Автопереход между полями
      if (value && index < 5) {
        const nextInput = document.getElementById(
          `code-${index + 1}`
        ) as HTMLInputElement;
        nextInput?.focus();
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      if (!email) throw new Error("Email не найден");

      const fullCode = code.join("");
      if (fullCode.length !== 6) throw new Error("Введите полный код");

      await register({
        fullName: formData.name,
        email: formData.email,
        password: formData.password,
      });
      await login({
        email: formData.email,
        password: formData.password,
      });

      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Неизвестная ошибка");
      setCode(["", "", "", "", "", ""]);
      const firstInput = document.getElementById("code-0") as HTMLInputElement;
      firstInput?.focus();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-[917px] w-[412px] mx-auto bg-white p-6">
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
        <h1 className="text-2xl font-bold text-gray-800">
          Подтверждение email
        </h1>
      </div>

      <p className="text-center text-gray-600 mb-8">
        Введите 6-значный код, отправленный на {email}
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col items-center">
        <div className="flex justify-center space-x-3 mb-8">
          {code.map((digit, index) => (
            <input
              key={index}
              id={`code-${index}`}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              className="w-12 h-12 text-2xl text-center border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              autoFocus={index === 0}
            />
          ))}
        </div>

        {error && <div className="mb-4 text-red-500 text-center">{error}</div>}

        <button
          type="submit"
          disabled={isLoading}
          className={`w-full py-3 px-4 rounded-lg font-medium text-white ${
            isLoading ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {isLoading ? "Проверка..." : "Подтвердить"}
        </button>
      </form>
    </div>
  );
}
