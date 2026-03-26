import { Navbar } from "@/components/navbar";
import { ChevronLeft } from "lucide-react";
import newsService from "../../../services/news-service";
import Link from "next/link";

export default async function NewsDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const article = await newsService.getArticle(Number(id));

  return (
    <div
      className="w-full max-w-md mx-auto bg-white"
      style={{ minHeight: "917px" }}
    >
      <div className="border-b mb-4">
        <Link href={"/news"}>
          <div className="flex text-xl font-bold items-center m-4 cursor-pointer">
            <ChevronLeft />
            Новость
          </div>
        </Link>
      </div>

      <div className="w-full">
        <img src={article.image} className="w-full" alt="" />

        <div className="p-4">
          <h1 className="text-2xl font-bold mb-2">{article.title}</h1>
          <p className="text-gray-500 text-sm mb-4">
            {new Date(article.publishedAt).toLocaleDateString()}
          </p>
          <p className="text-base mb-4">{article.content}</p>
        </div>
      </div>
      <Navbar />
    </div>
  );
}
