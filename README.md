# Sirius Leto 2025 — деплой на Timeweb Cloud (Production)

## Короткий план деплоя
1. Поднять VPS (Ubuntu 22.04/24.04), открыть 22/80/443.
2. Подготовить `.env.prod` и DNS A-записи домена.
3. Запустить `docker-compose.prod.yml` (nginx + frontend + backend + postgres).
4. Выполнить миграции и collectstatic.
5. Выпустить SSL-сертификат Let's Encrypt через certbot-контейнер.
6. Проверить `https://example.ru`, `/admin/`, `/api/`.

## Production-файлы
- `docker-compose.prod.yml`
- `deploy/nginx/default.conf`
- `.env.prod.example`
- `frontend/Dockerfile`
- `backend/Dockerfile`

## 1) Создать сервер Timeweb Cloud
- ОС: Ubuntu 22.04 или 24.04
- Открыть порты: `22`, `80`, `443`
- Подключиться по SSH

## 2) Установить Docker и Docker Compose
```bash
sudo apt update
sudo apt install -y ca-certificates curl gnupg git
curl -fsSL https://get.docker.com | sudo sh
sudo usermod -aG docker $USER
docker --version
docker compose version
```

## 3) Загрузить проект
```bash
git clone <repository_url>
cd <project_folder>
```

## 4) Создать production env
```bash
cp .env.prod.example .env.prod
nano .env.prod
```

Заполнить минимум:
- `DJANGO_SECRET_KEY`
- `DJANGO_ALLOWED_HOSTS`
- `CSRF_TRUSTED_ORIGINS`
- `CORS_ALLOWED_ORIGINS`
- `POSTGRES_DB/USER/PASSWORD`
- `NEXT_PUBLIC_API_URL=https://example.ru/api`

## 5) Подключить домен
Создать DNS A-записи:
- `example.ru -> <SERVER_IP>`
- `www.example.ru -> <SERVER_IP>`

## 6) Запустить проект
```bash
docker compose -f docker-compose.prod.yml up -d --build
```

## 7) Миграции
```bash
docker compose -f docker-compose.prod.yml exec backend python manage.py migrate
```

## 8) Static
```bash
docker compose -f docker-compose.prod.yml exec backend python manage.py collectstatic --noinput
```

## 9) Seed (если есть)
```bash
docker compose -f docker-compose.prod.yml exec backend python manage.py seed_data
```

## 10) Создать администратора
```bash
docker compose -f docker-compose.prod.yml exec backend python manage.py createsuperuser
```

## 11) SSL (выбран вариант: certbot-контейнер)
1. В `deploy/nginx/default.conf` замените `example.ru`/`www.example.ru` на ваш домен.
2. Первый запуск nginx уже должен быть активен на 80 порту.
3. Выпустить сертификат:
```bash
docker compose -f docker-compose.prod.yml run --rm certbot certonly \
  --webroot -w /var/www/certbot \
  -d example.ru -d www.example.ru \
  --email admin@example.com --agree-tos --no-eff-email
```
4. Перезапустить nginx:
```bash
docker compose -f docker-compose.prod.yml restart nginx
```
5. Проверка HTTPS:
```bash
curl -I https://example.ru
```

Обновление сертификата:
```bash
docker compose -f docker-compose.prod.yml run --rm certbot renew
docker compose -f docker-compose.prod.yml restart nginx
```

## 12) Команды обслуживания
```bash
docker compose -f docker-compose.prod.yml logs -f
docker compose -f docker-compose.prod.yml logs -f backend
docker compose -f docker-compose.prod.yml logs -f frontend
docker compose -f docker-compose.prod.yml logs -f nginx
docker compose -f docker-compose.prod.yml restart
docker compose -f docker-compose.prod.yml down
```

Обновление проекта:
```bash
git pull
docker compose -f docker-compose.prod.yml up -d --build
docker compose -f docker-compose.prod.yml exec backend python manage.py migrate
docker compose -f docker-compose.prod.yml exec backend python manage.py collectstatic --noinput
```

## 13) Pre-deploy checklist
- `DJANGO_DEBUG=False`
- `NEXT_PUBLIC_API_URL` не содержит `localhost` и указывает на `https://<domain>/api`
- `DJANGO_ALLOWED_HOSTS` содержит домен
- `CORS_ALLOWED_ORIGINS` и `CSRF_TRUSTED_ORIGINS` содержат HTTPS-домен
- наружу открыты только `80/443` (backend/db без `ports`)
- миграции выполняются успешно
- `/api/` и `/admin/` открываются через nginx

## Troubleshooting
- **502 Bad Gateway**: проверить `docker compose ... logs -f nginx backend frontend`.
- **DisallowedHost**: добавить домен в `DJANGO_ALLOWED_HOSTS`.
- **CSRF failed**: проверить `CSRF_TRUSTED_ORIGINS` (с `https://`).
- **Статика не отдается**: выполнить `collectstatic` и проверить volume `static_data`.
- **SSL не выпускается**: проверить DNS A-записи и доступность `http://example.ru/.well-known/acme-challenge/`.
