# Сириус Лето 2025

## Разработка

### Рекомендуемый запуск: полностью в Docker (backend + PostGIS)

Это самый стабильный способ, особенно на Windows (без ручной установки GDAL/PROJ и без проблем с локальными бинарными пакетами).

1. Скопируйте пример переменных окружения

   ```sh
   cp .env.example .env
   ```

2. Поднимите backend и базу данных

   ```sh
   docker compose -f docker-compose-dev-full.yaml up --build -d
   ```

3. Примените миграции внутри контейнера backend

   ```sh
   docker compose -f docker-compose-dev-full.yaml exec backend python manage.py migrate
   ```

4. Откройте API

   - backend: `http://127.0.0.1:8000`
   - swagger: `http://127.0.0.1:8000/schema/swagger-ui/`

5. Остановка

   ```sh
   docker compose -f docker-compose-dev-full.yaml down
   ```

---

### Зачем в логах появляется NumPy и нужно ли это проекту?

- Проект **не использует NumPy напрямую** в прикладном коде.
- Предупреждения NumPy при локальном запуске на Windows/Python 3.13 обычно приходят как побочный эффект окружения (бинарная сборка пакета в вашей системе), а не как требование бизнес-логики проекта.
- Для этого проекта критичны Django/GeoDjango/PostGIS/GDAL, а не NumPy.
- Чтобы избежать таких предупреждений и нестабильных локальных зависимостей, используйте запуск через Docker (секция выше): там фиксированное Linux-окружение и предсказуемые версии.

---

### Локальная разработка (без Docker для backend)

1. Создайте и войдите в виртуальное окружение

   - windows

     ```
     python -m venv venv
     venv/Scripts/activate
     ```

   - linux

     ```
     python3 -m venv venv
     source venv/bin/activate
     ```

2. Установите зависимости для GeoDjango

   - windows

     Сначала загрузите [установщик OSGeo4W](https://trac.osgeo.org/osgeo4w/) и запустите его. Выберите Express Web-GIS Install и нажмите далее. В списке ‘Выбрать пакеты’ убедитесь, что выбран параметр GDAL. Если какие-либо другие пакеты включены по умолчанию, они не требуются GeoDjango и могут быть безопасно сняты. После нажатия кнопки "Далее" и принятия лицензионных соглашений пакеты будут автоматически загружены и установлены, после чего вы сможете выйти из программы установки.

     Чтобы использовать GeoDjango, вам нужно будет добавить каталоги OSGeo4W в системный путь Windows, а также создать переменные окружения `GDAL_DATA` и `PROJ_LIB`. Следующий набор команд, исполняемый с помощью cmd.exe, настроит это. Перезагрузите устройство после завершения процесса, чтобы были распознаны новые переменные среды.:

     ```sh
     set OSGEO4W_ROOT=C:\OSGeo4W
     set GDAL_DATA=%OSGEO4W_ROOT%\apps\gdal\share\gdal
     set PROJ_LIB=%OSGEO4W_ROOT%\share\proj
     set PATH=%PATH%;%OSGEO4W_ROOT%\bin
     reg ADD "HKLM\SYSTEM\CurrentControlSet\Control\Session Manager\Environment" /v Path /t REG_EXPAND_SZ /f /d "%PATH%"
     reg ADD "HKLM\SYSTEM\CurrentControlSet\Control\Session Manager\Environment" /v GDAL_DATA /t REG_EXPAND_SZ /f /d "%GDAL_DATA%"
     reg ADD "HKLM\SYSTEM\CurrentControlSet\Control\Session Manager\Environment" /v PROJ_LIB /t REG_EXPAND_SZ /f /d "%PROJ_LIB%"
     ```

     Для выполнения этих команд требуются права администратора. Для этого запустите командную строку от имени администратора и введите приведенные выше команды. Вам необходимо выйти из системы и снова войти в систему, чтобы настройки вступили в силу.

     Если вы изменили установочные каталоги OSGeo4W, то вам нужно будет соответствующим образом изменить переменные OSGEO4W_ROOT.

   - linux | ubuntu-based

   ```sh
   sudo apt-get install binutils libproj-dev gdal-bin
   ```

3. Установите зависимости пакетного менеджера

   ```sh
   pip install -r requirements.txt
   ```

4. Скопируйте `.env.example` в `.env`

   ```sh
   cp .env.example .env
   ```

5. Запустите сторонние зависимости

   ```sh
   docker compose -f docker-compose-dev.yaml up -d
   ```

6. Примените миграции

   ```sh
   python manage.py migrate
   ```

7. Запустите сервер

   ```sh
   python manage.py runserver
   ```


8. Загрузите начальные данные (категории, типы, администратор)

```sh
python manage.py seed_data
```

Для Docker-режима:

```sh
docker compose -f docker-compose-dev-full.yaml exec backend python manage.py seed_data
```

Будут созданы:
- категории и типы заявок для формы создания обращения;
- администратор локальной разработки:
  - email: `admin@example.com`
  - пароль: `admin12345`

Команда идемпотентна: повторный запуск не создаёт дубликаты.
