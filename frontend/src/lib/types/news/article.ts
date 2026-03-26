import { User } from "../auth/user";

export type Article = {
  id: number;
  title: string;
  content: string;
  excerpt: string;
  author: User;
  ticket: string;
  image: string;
  publishedAt: string;
  createdAt: string;
  updatedAt: string;
  viewsCount: number;
};
