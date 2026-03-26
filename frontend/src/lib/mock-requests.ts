import { Request } from '@/lib/types';

export const mockRequests: Request[] = [
  {
    id: '1',
    status: 'На рассмотрении',
    title: 'Яма на улице Кулаковского',
    problemType: 'Дорожные работы',
    problemDescription: 'Яма',
    address: 'ул. Кулаковского',
    comment: 'На улице Кулаковского находится она прямо перед поворотом.',
    photos: ['/pit.jpg', '/karta.jpg'],
    date: '28.04.2025',
    category: 'Дорожные проблемы'
  },
  {
    id: '2',
    status: 'Работы завершены',
    title: 'Яма на улице Кулаковского',
    problemType: 'Дорожные работы',
    problemDescription: 'Яма',
    address: 'ул. Кулаковского',
    comment: 'На улице Кулаковского находится она прямо перед поворотом.',
    photos: ['/pit.jpg', '/karta.jpg'],
    date: '28.04.2025',
    category: 'Дорожные проблемы'
  },
  {
    id: '3',
    status: 'Отказано',
    title: 'Яма на улице Кулаковского',
    problemType: 'Дорожные работы',
    problemDescription: 'Светофор',
    address: 'ул. Кулаковского',
    comment: 'На улице Кулаковского находится она прямо перед поворотом.',
    photos: ['/pit.jpg', '/karta.jpg'],
    date: '28.04.2025',
    category: 'Дорожные проблемы'
  },
];