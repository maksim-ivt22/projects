import Link from "next/link";
import { Article } from "../lib/types/news/article";

export const ArticleCard = ({ article }: { article: Article }) => {
  return (
    <Link
      href={`/news/${article.id}`}
      className="block w-full border-b border-gray-200 pb-4 mb-4 last:border-0"
    >
      <div className="w-full h-48 relative mb-3">
        <img
          src={article.image}
          alt={article.title}
          className="object-cover w-full h-full"
        />
      </div>

      <div className="w-full px-2">
        <h3 className="font-bold text-lg">{article.title}</h3>
        <p className="text-gray-700 mb-1">{article.excerpt}</p>
        <p className="text-gray-400 text-sm">
          {new Date(article.publishedAt).toLocaleDateString()}
        </p>
      </div>
    </Link>
  );
};
