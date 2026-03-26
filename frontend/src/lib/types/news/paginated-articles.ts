import { PaginationBase } from "../pagination-base";
import { Article } from "./article";

export type PaginatedArticles = PaginationBase & {
  results: Article[];
};
