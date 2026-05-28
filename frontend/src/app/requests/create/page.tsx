"use client";

import { Suspense, useEffect, useLayoutEffect, useState } from "react";
import { ChevronLeft, UploadCloud } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "../../../components/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../../../components/ui/popover";
import { Button } from "../../../components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "../../../components/ui/command";
import { TicketCategory } from "../../../lib/types/tickets/ticket-category";
import { TicketType } from "../../../lib/types/tickets/ticket-type";
import ticketsService from "../../../services/tickets-service";
import { Textarea } from "../../../components/ui/textarea";
import { CreateTicketInput } from "../../../lib/types/tickets/create-ticket-input";
import { Label } from "../../../components/ui/label";
import { AspectRatio } from "../../../components/ui/aspect-ratio";
import { useAuth } from "../../../context/auth-context";

const CreateTicketContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isLoading: isAuthLoading, user } = useAuth();

  const initLongitude = searchParams.get("longitude") ?? "";
  const initLatitude = searchParams.get("latitude") ?? "";
  const address = searchParams.get("address") ?? "";

  const [categories, setCategories] = useState<TicketCategory[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [baseFormData, setBaseFormData] = useState({
    title: "",
    address,
    description: "",
  });
  const [currentCategory, setCurrentCategory] = useState("");
  const [currentType, setCurrentType] = useState("");
  const [types, setTypes] = useState<TicketType[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [loadingError, setLoadingError] = useState<string | null>(null);

  const fetchCategories = async () => {
    try {
      setLoadingError(null);
      const response = await ticketsService.getCategories();
      setCategories(response.results);

      if (!response.results.length) {
        setLoadingError("Категории пока не добавлены");
      }
    } catch {
      setLoadingError(
        "Не удалось загрузить категории. Попробуйте обновить страницу.",
      );
      setCategories([]);
    }
  };

  const fetchTypes = async (categoryId: number) => {
    try {
      setLoadingError(null);
      const response = await ticketsService.getCategory(categoryId);
      setTypes(response.types);
    } catch {
      setLoadingError("Не удалось загрузить типы для выбранной категории.");
      setTypes([]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (file) {
      setSelectedFile(file);

      if (file.type.startsWith("image/")) {
        const reader = new FileReader();

        reader.onload = (event) => {
          setFilePreview(event.target?.result as string);
        };

        reader.readAsDataURL(file);
      } else {
        setFilePreview(null);
      }
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    setFilePreview(null);
  };

  useLayoutEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    setBaseFormData((currentData) => ({
      ...currentData,
      address,
    }));
  }, [address]);

  useEffect(() => {
    if (currentCategory !== "") {
      const selectedCategory = categories.find(
        (category) => category.title === currentCategory,
      );

      if (selectedCategory) {
        fetchTypes(selectedCategory.id);
      }
    }
  }, [currentCategory, categories]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (isAuthLoading) {
      setSubmitError(
        "Проверяем авторизацию. Попробуйте ещё раз через несколько секунд.",
      );
      return;
    }

    if (!user) {
      setSubmitError("Необходимо войти в аккаунт");
      return;
    }

    const latitude = Number(initLatitude);
    const longitude = Number(initLongitude);

    if (
      !initLatitude ||
      !initLongitude ||
      !Number.isFinite(latitude) ||
      !Number.isFinite(longitude)
    ) {
      setSubmitError(
        "Координаты не определены. Вернитесь на карту и выберите точку.",
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const selectedType = types.find((type) => type.title === currentType);

      if (!selectedType) {
        setSubmitError("Выберите тип заявки");
        return;
      }

      const data: CreateTicketInput = {
        ...baseFormData,
        latitude,
        longitude,
        typeId: selectedType.id,
        image: selectedFile || undefined,
      };

      const newTicket = await ticketsService.createTicket(data);
      router.replace(`/requests/${newTicket.id}`);
    } catch {
      setSubmitError(
        "Не удалось создать заявку. Проверьте введённые данные и попробуйте ещё раз.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

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

      <form onSubmit={handleSubmit} className="px-4 space-y-3">
        {!isAuthLoading && !user && (
          <div className="rounded-md bg-red-50 p-3 text-sm text-destructive">
            Необходимо войти в аккаунт
          </div>
        )}

        <div>
          <Label className="text-sm">Заголовок</Label>
          <Input
            required
            placeholder="Яма на улице Кулаковского"
            value={baseFormData.title}
            onChange={(e) =>
              setBaseFormData({ ...baseFormData, title: e.target.value })
            }
          />
        </div>

        <div>
          <Label className="text-sm">Улица</Label>
          <Input
            required
            placeholder="улице Кулаковского"
            value={baseFormData.address}
            onChange={(e) =>
              setBaseFormData({ ...baseFormData, address: e.target.value })
            }
          />
        </div>

        <div>
          <Label className="text-sm">Подробности</Label>
          <Textarea
            required
            value={baseFormData.description}
            onChange={(e) =>
              setBaseFormData({ ...baseFormData, description: e.target.value })
            }
          />
        </div>

        <div>
          <Label className="text-sm">Фотография</Label>
          <div className="flex items-center justify-center w-full">
            <label
              htmlFor="dropzone-file"
              className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-gray-50"
            >
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <UploadCloud className="w-8 h-8 mb-3 text-gray-400" />
                <p className="mb-2 text-sm text-gray-500">
                  <span className="font-semibold">Нажмите для загрузки</span>{" "}
                  или перетащите файл
                </p>
                <p className="text-xs text-gray-500">
                  {selectedFile ? selectedFile.name : "PNG, JPG (макс. 5MB)"}
                </p>
              </div>

              <input
                id="dropzone-file"
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleFileChange}
              />
            </label>
          </div>

          {filePreview && (
            <div className="mt-2 relative">
              <AspectRatio ratio={16 / 9}>
                <img
                  src={filePreview}
                  alt="Preview"
                  className="w-full h-full object-cover rounded-lg"
                />
              </AspectRatio>

              <button
                type="button"
                onClick={removeFile}
                className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
              >
                ×
              </button>
            </div>
          )}
        </div>

        <Label className="text-sm">Категория</Label>

        {loadingError && (
          <p className="text-sm text-destructive mb-2" role="alert">
            {loadingError}
          </p>
        )}

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-full justify-start">
              {currentCategory !== "" ? currentCategory : "Выберите категорию"}
            </Button>
          </PopoverTrigger>

          <PopoverContent>
            <Command>
              <CommandInput placeholder="Найдите категорию" />
              <CommandList>
                <CommandEmpty>Не найдено</CommandEmpty>
                <CommandGroup>
                  {categories.map((category) => (
                    <CommandItem
                      key={category.id}
                      value={category.title}
                      onSelect={(currentValue) => {
                        setCurrentCategory(
                          currentValue === currentCategory ? "" : currentValue,
                        );
                      }}
                    >
                      {category.title}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>

        <Label className="text-sm">Тип</Label>

        <Popover>
          <PopoverTrigger asChild>
            <Button
              disabled={currentCategory === ""}
              variant="outline"
              className="w-full justify-start"
            >
              {currentType !== "" ? currentType : "Выберите тип"}
            </Button>
          </PopoverTrigger>

          <PopoverContent>
            <Command>
              <CommandInput placeholder="Найдите тип" />
              <CommandList>
                <CommandEmpty>Не найдено</CommandEmpty>
                <CommandGroup>
                  {types.map((type) => (
                    <CommandItem
                      key={type.id}
                      value={type.title}
                      onSelect={(currentValue) => {
                        setCurrentType(
                          currentValue === currentType ? "" : currentValue,
                        );
                      }}
                    >
                      {type.title}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>

        {submitError && (
          <p className="text-sm text-destructive" role="alert">
            {submitError}
          </p>
        )}

        <Button
          className="w-full mt-5"
          disabled={
            isSubmitting || currentCategory === "" || currentType === ""
          }
        >
          {isSubmitting ? "Создание..." : "Создать"}
        </Button>
      </form>
    </>
  );
};

export default function CreateTicketPage() {
  return (
    <Suspense fallback={<div>Загрузка...</div>}>
      <CreateTicketContent />
    </Suspense>
  );
}
