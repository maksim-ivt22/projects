"use client";

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
import { useEffect, useLayoutEffect, useState } from "react";
import { TicketCategory } from "../../../lib/types/tickets/ticket-category";
import { TicketType } from "../../../lib/types/tickets/ticket-type";
import ticketsService from "../../../services/tickets-service";
import { Textarea } from "../../../components/ui/textarea";
import { CreateTicketInput } from "../../../lib/types/tickets/create-ticket-input";
import { Label } from "../../../components/ui/label";
import { AspectRatio } from "../../../components/ui/aspect-ratio";

const CreateTicketPage = () => {
  const router = useRouter();
  const initLongitude = useSearchParams().get("longitude");
  const initLatitude = useSearchParams().get("latitude");
  const address = useSearchParams().get("address");
  const [categories, setCategories] = useState<TicketCategory[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [baseFormData, setBaseFormData] = useState({
    title: "",
    address: address ?? "",
    description: "",
    latitude: initLatitude ?? "",
    longitude: initLongitude ?? "",
  });
  const [currentCategory, setCurrentCategory] = useState("");
  const [currentType, setCurrentType] = useState("");
  const [types, setTypes] = useState<TicketType[]>([]);

  const fetchCategories = async () => {
    setCategories((await ticketsService.getCategories()).results);
  };

  const fetchTypes = async (categoryId: number) => {
    setTypes((await ticketsService.getCategory(categoryId)).types);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);

      // Create preview for images
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
    if (currentCategory !== "") {
      fetchTypes(
        categories.find((category) => category.title === currentCategory)!.id
      );
    }
  }, [currentCategory]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const data: CreateTicketInput = {
      ...baseFormData,
      latitude: Number(baseFormData.latitude),
      longitude: Number(baseFormData.longitude),
      typeId: types.find((type) => type.title === currentType)!.id,
      image: selectedFile || undefined,
    };
    const newTicket = await ticketsService.createTicket(data);
    router.replace(`/requests/${newTicket.id}`);
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
          <Label className="text-sm">Широта</Label>
          <Input
            required
            type="number"
            step="0.0000000000001"
            min={-180}
            max={180}
            placeholder="129.705278"
            value={baseFormData.longitude}
            onChange={(e) =>
              setBaseFormData({ ...baseFormData, longitude: e.target.value })
            }
          />
        </div>
        <div>
          <Label className="text-sm">Высота</Label>
          <Input
            required
            type="number"
            step="0.0000000000001"
            min={-90}
            max={90}
            placeholder="62.016720"
            value={baseFormData.latitude}
            onChange={(e) =>
              setBaseFormData({ ...baseFormData, latitude: e.target.value })
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
        <Popover>
          <PopoverTrigger asChild>
            <Button variant={"outline"} className="w-full justify-start">
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
                          currentValue === currentCategory ? "" : currentValue
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
              variant={"outline"}
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
                          currentValue === currentType ? "" : currentValue
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

        <Button className="w-full mt-5">Создать</Button>
      </form>
    </>
  );
};

export default CreateTicketPage;
