"use client";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Link from "next/link";
import { regions, getCitiesByRegion } from "@/lib/regions-data";
import { Input } from "../../../components/input";
import { Button } from "../../../components/ui/button";
import { useRegisterFormStore } from "../../../providers/register-form-store-provider";

export default function Register() {
  const router = useRouter();
  const { setFormData } = useRegisterFormStore((state) => state);
  const [localFormData, setLocalFormData] = useState({
    name: "",
    birthDate: "",
    email: "",
    phone: "",
    region: "",
    city: "",
    password: "",
    confirmPassword: "",
  });
  const [availableCities, setAvailableCities] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (localFormData.region) {
      setAvailableCities(getCitiesByRegion(localFormData.region));
      setLocalFormData((prev) => ({ ...prev, city: "" }));
    }
  }, [localFormData.region]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      if (localFormData.password !== localFormData.confirmPassword) {
        throw new Error("Пароли не совпадают");
      }
      if (!localFormData.region || !localFormData.city) {
        throw new Error("Выберите регион и город");
      }

      const { confirmPassword, ...formData } = localFormData;
      setFormData({
        formData: formData,
      });
      router.push(
        `/verify-email?email=${encodeURIComponent(localFormData.email)}`
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Неизвестная ошибка");
    } finally {
      setIsLoading(false);
    }
  };

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
        <h1 className="text-2xl font-bold text-gray-800">Регистрация</h1>
      </div>

      {error && (
        <div className="mb-4 p-2 bg-red-100 text-destructive text-sm rounded">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm text-gray-600 mb-1">ФИО</label>
          <Input
            type="text"
            required
            className="max-h-[36px]"
            value={localFormData.name}
            onChange={(e) =>
              setLocalFormData({ ...localFormData, name: e.target.value })
            }
          />
        </div>

        <div>
          <label className="block text-sm text-gray-600 mb-1">
            Дата рождения
          </label>
          <input
            type="date"
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            value={localFormData.birthDate}
            onChange={(e) =>
              setLocalFormData({ ...localFormData, birthDate: e.target.value })
            }
          />
        </div>

        <div>
          <label className="block text-sm text-gray-600 mb-1">
            Электронная почта
          </label>
          <Input
            type="email"
            required
            value={localFormData.email}
            onChange={(e) =>
              setLocalFormData({ ...localFormData, email: e.target.value })
            }
          />
        </div>

        <div>
          <label className="block text-sm text-gray-600 mb-1">
            Номер телефона
          </label>
          <Input
            type="tel"
            required
            value={localFormData.phone}
            onChange={(e) =>
              setLocalFormData({ ...localFormData, phone: e.target.value })
            }
          />
        </div>

        <div>
          <label className="block text-sm text-gray-600 mb-1">Регион</label>
          <select
            required
            className="w-full px-3 py-2 border rounded-lg"
            value={localFormData.region}
            onChange={(e) =>
              setLocalFormData({ ...localFormData, region: e.target.value })
            }
          >
            <option value="">Выбрать</option>
            {regions.map((region) => (
              <option key={region} value={region}>
                {region}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm text-gray-600 mb-1">Город</label>
          <select
            required
            disabled={!localFormData.region}
            className="w-full px-3 py-2 border rounded-lg"
            value={localFormData.city}
            onChange={(e) =>
              setLocalFormData({ ...localFormData, city: e.target.value })
            }
          >
            <option value="">
              {localFormData.region ? "Выбрать" : "Сначала выберите регион"}
            </option>
            {availableCities.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm text-gray-600 mb-1">Пароль</label>
          <Input
            type="password"
            required
            minLength={6}
            value={localFormData.password}
            onChange={(e) =>
              setLocalFormData({ ...localFormData, password: e.target.value })
            }
          />
        </div>

        <div>
          <label className="block text-sm text-gray-600 mb-1">
            Подтверждение пароля
          </label>
          <Input
            type="password"
            required
            value={localFormData.confirmPassword}
            onChange={(e) =>
              setLocalFormData({
                ...localFormData,
                confirmPassword: e.target.value,
              })
            }
          />
        </div>

        <div className="text-xs text-gray-500 mt-4">
          Регистрируясь, вы даёте согласие на обработку персональных данных
        </div>

        <Button
          type="submit"
          disabled={isLoading}
          className={`w-full py-3 px-4 rounded-lg font-medium ${
            isLoading ? "bg-gray-400" : "bg-primary"
          }`}
        >
          {isLoading ? "Регистрация..." : "Зарегистрироваться"}
        </Button>
      </form>

      <div className="text-center text-sm text-gray-500 mt-6">
        Уже есть аккаунт?{" "}
        <Link href="/login" className="text-primary hover:underline">
          Войти
        </Link>
      </div>
    </div>
  );
}
