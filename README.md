# Sirius Leto 2025 — Документация проекта

Этот репозиторий содержит fullstack-систему для приема и обработки заявок жителей с геопривязкой, фотофиксацией, статусами обработки и новостным модулем.

## 1. Архитектура

Система состоит из двух основных частей:

- `frontend/` — клиентское приложение на Next.js (TypeScript).
- `backend/` — REST API на Django + DRF + PostGIS.

Поток данных:
1. Пользователь авторизуется через JWT (`/auth/token/`).
2. Frontend отправляет запросы к backend (axios клиент).
3. Backend сохраняет данные в PostgreSQL/PostGIS.
4. Для заявок поддерживается workflow статусов и история изменений.

## 2. Технологический стек

### Frontend
- Next.js 15 (App Router)
- React + TypeScript
- Tailwind CSS
- Leaflet / React-Leaflet
- Axios

### Backend
- Django 5
- Django REST Framework
- SimpleJWT
- drf-spectacular (OpenAPI/Swagger)
- GeoDjango + PostGIS

### Инфраструктура
- Docker / Docker Compose
- PostgreSQL + PostGIS

## 3. Доменные модули

### 3.1 Users
- Кастомная модель пользователя (`email` как login).
- JWT-аутентификация.
- Автоназначение роли `citizen` при регистрации.
- Ролевой подход: `citizen`, `operator`, `admin`.

### 3.2 Tickets
- Создание заявок с координатами, типом, категорией, изображением.
- Геогруппировка близких заявок.
- Статусы: `PENDING_REVIEW`, `IN_PROGRESS`, `COMPLETED`, `REJECTED`.
- История переходов статусов (`TicketStatusHistory`) с операторским комментарием.
- Фильтры списка заявок: статус, тип, категория, даты, радиус, сортировка.

### 3.3 News
- Теги новостей.
- Статьи с поиском и сортировкой.
- Учет просмотров.

## 4. Роли и права доступа (RBAC)

- `citizen`:
  - регистрация/логин;
  - создание своих заявок;
  - просмотр своих заявок.
- `operator`:
  - обработка заявок;
  - смена статусов заявок;
  - управление справочниками категорий/типов.
- `admin`:
  - все права operator;
  - системное администрирование.

Мутации в новостях и справочниках ограничены staff-ролями.

## 5. API (кратко)

### Auth
- `POST /auth/register/`
- `POST /auth/token/`
- `POST /auth/token/refresh/`
- `GET /auth/me/`

### Tickets
- `GET /tickets/`
- `POST /tickets/`
- `GET /tickets/{id}/`
- `PATCH /tickets/{id}/`
- `DELETE /tickets/{id}/`
- `POST /tickets/{id}/status/` — смена статуса по workflow

Фильтры `GET /tickets/`:
- `status`
- `type_id`
- `category_id`
- `date_from`, `date_to`
- `latitude`, `longitude`, `radius_m`
- `ordering` (`created_at`, `-created_at`, `status`, `-status`)

### News
- `GET /articles/`, `GET /news-tags/`
- CRUD для staff-ролей

Swagger:
- `GET /schema/swagger-ui/`

## 6. Локальный запуск

### Backend (рекомендуется полностью в Docker)
```bash
cd backend
cp .env.example .env
docker compose -f docker-compose-dev-full.yaml up --build -d
docker compose -f docker-compose-dev-full.yaml exec backend python manage.py migrate
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

### Frontend env
```bash
cd frontend
cp .env.example .env.local
```

Значение должно указывать на backend, доступный из браузера (обычно `http://localhost:8000/`).


## 7. Структура репозитория

```text
backend/
  users/          # пользователи, роли, auth
  tickets/        # заявки, workflow, фильтры, permissions
  news/           # новости и теги
  backend/        # settings, urls, wsgi/asgi
frontend/
  src/app/        # страницы приложения (auth, requests, news, dashboard)
  src/services/   # клиент API
  src/lib/        # утилиты, типы, API-клиент
```

## 8. Что описывать в ВКР

Рекомендуемые разделы:
- постановка задачи и актуальность цифровизации обращений;
- анализ предметной области и аналогов;
- архитектура системы (контекстная и компонентная диаграммы);
- модель данных (ER-диаграмма, геоданные PostGIS);
- проектирование API и RBAC;
- описание workflow обработки заявок;
- тестирование (unit, интеграционное, сценарное);
- безопасность (JWT, разграничение прав, валидация).


## 9. Проверка auth вручную (curl)

Регистрация использует endpoint `POST /auth/register/`.

```bash
curl -X POST http://localhost:8000/auth/register/ \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"test@example.com\",\"password\":\"StrongPass123\",\"full_name\":\"Test User\"}"
```

Проверка логина:

```bash
curl -X POST http://localhost:8000/auth/token/ \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"test@example.com\",\"password\":\"StrongPass123\"}"
```


## 10. Начальные данные (seed)

После миграций загрузите начальные данные backend:

```bash
cd backend
python manage.py seed_data
```

В Docker:

```bash
docker compose -f docker-compose-dev-full.yaml exec backend python manage.py seed_data
```

Команда создаёт:
- категории обращений;
- типы обращений по категориям;
- администратора: `admin@example.com` / `admin12345`.

Эндпоинты для категорий и типов:
- `GET /ticket-categories/`
- `GET /ticket-categories/{id}/` (с вложенными типами)
- `GET /ticket-types/`
