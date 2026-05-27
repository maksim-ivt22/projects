# Sirius Leto 2025 — деплой на Timeweb Cloud (Production)

Ниже — подробная, практическая инструкция: от создания сервера в панели Timeweb Cloud до запуска проекта с HTTPS.

## Короткий план
1. Создать облачный сервер в Timeweb Cloud.
2. Подключить домен к IP сервера.
3. Установить Docker/Compose.
4. Подготовить `.env.prod`.
5. Запустить `docker-compose.prod.yml`.
6. Выполнить миграции и `collectstatic`.
7. Выпустить SSL сертификат Let's Encrypt.
8. Проверить сайт, API и админку.

---

## Production-файлы в репозитории
- `docker-compose.prod.yml`
- `deploy/nginx/default.conf`
- `.env.prod.example`
- `frontend/Dockerfile`
- `backend/Dockerfile`

---

## 1) Что сделать в панели Timeweb Cloud

### 1.1 Создать сервер
В панели Timeweb Cloud:
1. Откройте раздел **Cloud Servers / Облачные серверы**.
2. Нажмите **Создать сервер**.
3. Выберите:
   - ОС: **Ubuntu 22.04** или **Ubuntu 24.04**.
   - Конфигурацию (минимум на старт): 2 vCPU, 2-4 GB RAM.
   - Диск: от 20 GB.
4. Добавьте SSH-ключ (рекомендуется) или задайте пароль.
5. Дождитесь статуса **Running**.

### 1.2 Проверить сеть/фаервол
Убедитесь, что входящие порты открыты:
- `22/tcp` (SSH)
- `80/tcp` (HTTP)
- `443/tcp` (HTTPS)

Если в Timeweb включены правила безопасности (Security Group/Firewall), добавьте эти правила вручную.

### 1.3 Подключиться к серверу
```bash
ssh root@<SERVER_IP>
```
или под вашим пользователем, если он создан.

---

## 2) Установка Docker и Docker Compose на сервере
```bash
sudo apt update
sudo apt install -y ca-certificates curl gnupg git
curl -fsSL https://get.docker.com | sudo sh
sudo usermod -aG docker $USER
newgrp docker

docker --version
docker compose version
```

---

## 3) Загрузка проекта
```bash
git clone <repository_url>
cd <project_folder>
```

---

## 4) Подробно: как создать `.env.prod`

### 4.1 Создайте файл из шаблона
```bash
cp .env.prod.example .env.prod
```

### 4.2 Сгенерируйте сильные секреты
```bash
python3 - <<'PY'
import secrets
print('DJANGO_SECRET_KEY=' + secrets.token_urlsafe(64))
print('POSTGRES_PASSWORD=' + secrets.token_urlsafe(32))
print('DJANGO_SUPERUSER_PASSWORD=' + secrets.token_urlsafe(24))
PY
```
Скопируйте значения в `.env.prod`.

### 4.3 Отредактируйте `.env.prod`
```bash
nano .env.prod
```

Рекомендуемый пример (замените `example.ru` на ваш домен):
```env
DJANGO_SECRET_KEY=<strong_secret>
DJANGO_DEBUG=False
DJANGO_ALLOWED_HOSTS=example.ru,www.example.ru,localhost,127.0.0.1
CSRF_TRUSTED_ORIGINS=https://example.ru,https://www.example.ru
CORS_ALLOWED_ORIGINS=https://example.ru,https://www.example.ru

POSTGRES_DB=app_db
POSTGRES_USER=app_user
POSTGRES_PASSWORD=<strong_db_password>
POSTGRES_HOST=db
POSTGRES_PORT=5432

NEXT_PUBLIC_API_URL=https://example.ru/api

DJANGO_SUPERUSER_EMAIL=admin@example.com
DJANGO_SUPERUSER_USERNAME=admin
DJANGO_SUPERUSER_PASSWORD=<strong_admin_password>
```

### 4.4 Проверка `.env.prod`
Проверьте, что:
- `DJANGO_DEBUG=False`
- `NEXT_PUBLIC_API_URL` = `https://<домен>/api`
- Нет `localhost` в production URL frontend API.
- Хост базы: `POSTGRES_HOST=db`.

> Важно: `.env.prod` не коммитится в Git, храните его только на сервере.

---

## 5) Подключение домена

У регистратора домена создайте DNS A-записи:
- `example.ru` -> `<SERVER_IP>`
- `www.example.ru` -> `<SERVER_IP>`

Проверка:
```bash
dig +short example.ru
dig +short www.example.ru
```
Обе записи должны вернуть IP вашего сервера.

---

## 6) Подготовка nginx-конфига под ваш домен
В файле `deploy/nginx/default.conf` замените:
- `example.ru`
- `www.example.ru`
на ваш реальный домен.

И в SSL путях тоже:
- `/etc/letsencrypt/live/<your-domain>/fullchain.pem`
- `/etc/letsencrypt/live/<your-domain>/privkey.pem`

---

## 7) Первый запуск проекта
```bash
docker compose -f docker-compose.prod.yml up -d --build
```

Проверка статуса:
```bash
docker compose -f docker-compose.prod.yml ps
```

---

## 8) Миграции, статика, начальные данные
```bash
docker compose -f docker-compose.prod.yml exec backend python manage.py migrate
docker compose -f docker-compose.prod.yml exec backend python manage.py collectstatic --noinput
```

Если есть команда seed:
```bash
docker compose -f docker-compose.prod.yml exec backend python manage.py seed_data
```

Создание суперпользователя (если нужно):
```bash
docker compose -f docker-compose.prod.yml exec backend python manage.py createsuperuser
```

---

## 9) HTTPS / SSL (Let's Encrypt через certbot контейнер)

### 9.1 Убедитесь, что домен уже смотрит на сервер
```bash
dig +short example.ru
```

### 9.2 Выпустите сертификат
```bash
docker compose -f docker-compose.prod.yml run --rm certbot certonly \
  --webroot -w /var/www/certbot \
  -d example.ru -d www.example.ru \
  --email admin@example.com --agree-tos --no-eff-email
```

### 9.3 Перезапустите nginx
```bash
docker compose -f docker-compose.prod.yml restart nginx
```

### 9.4 Проверьте HTTPS
```bash
curl -I https://example.ru
curl -I https://example.ru/api/
curl -I https://example.ru/admin/
```

### 9.5 Обновление сертификата
Рекомендуется добавить cron (например, раз в день):
```bash
docker compose -f docker-compose.prod.yml run --rm certbot renew
docker compose -f docker-compose.prod.yml restart nginx
```

---

## 10) Команды обслуживания

Просмотр логов:
```bash
docker compose -f docker-compose.prod.yml logs -f
```

Логи backend:
```bash
docker compose -f docker-compose.prod.yml logs -f backend
```

Логи frontend:
```bash
docker compose -f docker-compose.prod.yml logs -f frontend
```

Логи nginx:
```bash
docker compose -f docker-compose.prod.yml logs -f nginx
```

Перезапуск:
```bash
docker compose -f docker-compose.prod.yml restart
```

Остановка:
```bash
docker compose -f docker-compose.prod.yml down
```

Обновление проекта:
```bash
git pull
docker compose -f docker-compose.prod.yml up -d --build
docker compose -f docker-compose.prod.yml exec backend python manage.py migrate
docker compose -f docker-compose.prod.yml exec backend python manage.py collectstatic --noinput
```

---

## 11) Pre-deploy checklist
- `DJANGO_DEBUG=False`
- `NEXT_PUBLIC_API_URL=https://<domain>/api`
- `DJANGO_ALLOWED_HOSTS` содержит домен
- `CORS_ALLOWED_ORIGINS` и `CSRF_TRUSTED_ORIGINS` содержат `https://<domain>`
- `db` и `backend` не имеют `ports` наружу
- наружу опубликованы только `80/443` через nginx
- миграции/collectstatic проходят
- `https://<domain>/api/` отвечает
- `https://<domain>/admin/` открывается

---

## 12) Частые проблемы и решения
- **Nginx не стартует после включения SSL**  
  Проверьте, что сертификаты выпущены и домен в `default.conf` совпадает с `certbot -d`.

- **DisallowedHost в Django**  
  Добавьте домен в `DJANGO_ALLOWED_HOSTS`.

- **CSRF Failed**  
  Проверьте `CSRF_TRUSTED_ORIGINS` (обязательно с `https://`).

- **502 Bad Gateway**  
  Проверьте логи `nginx`, `backend`, `frontend`.

- **Статика не отдается**  
  Запустите `collectstatic --noinput` и проверьте volume `static_data`.

- **Frontend ходит не туда**  
  Проверьте `NEXT_PUBLIC_API_URL`, он должен быть `https://<domain>/api`.
