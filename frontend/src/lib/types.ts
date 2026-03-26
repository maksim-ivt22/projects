export type RequestStatus = 'На рассмотрении' | 'Отказано' | 'Работы завершены';

export interface Request {
  id: string;
  status: RequestStatus;
  title: string;
  problemType: string;
  problemDescription: string;
  address: string;
  comment?: string;
  photos: string[];
  date: string;
  category?: string;
}

export interface RequestCardProps {
  id: string;
  title: string;
  location: string;
  details: string[];
  status: RequestStatus;
  date: string;
  photos: string[];
  type?: string;
}