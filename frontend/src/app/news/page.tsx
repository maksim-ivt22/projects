import { ArticleCard } from "@/components/news-card";
import { Navbar } from "@/components/navbar";
import newsService from "../../services/news-service";

export default async function NewsPage() {
  const articles = (await newsService.getArticles()).results;

  return (
    <div
      className="w-full max-w-md mx-auto bg-white relative"
      style={{ minHeight: "917px" }}
    >
      <div className="w-full absolute top-0">
        <h1 className="text-2xl font-bold p-4">Новости</h1>
        <div className="w-full">
          {articles.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
      </div>
      <Navbar className="bottom-0" />
    </div>
  );
}
