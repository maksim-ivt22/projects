import api from "../lib/api-client";
import { Article } from "../lib/types/news/article";
import { PaginatedArticles } from "../lib/types/news/paginated-articles";

class NewsService {
  async getArticles(): Promise<PaginatedArticles> {
    const data: PaginatedArticles = (await api.get(`articles/`)).data;
    return data;
  }

  async getArticle(id: number): Promise<Article> {
    const article: Article = (await api.get(`articles/${id}`)).data;
    return article;
  }
}

export default new NewsService();
