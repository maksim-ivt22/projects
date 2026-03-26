FROM python:3.13.3-alpine3.21

RUN mkdir /app

WORKDIR /app

# GeoDjango dependencies
RUN apk add --no-cache binutils proj-dev gdal gdal-dev geos-dev

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1 
ENV DEBUG=False

# Build dependencies
RUN apk add --no-cache \
    build-base \
    postgresql-dev \
    python3-dev

RUN pip install --upgrade pip 
COPY requirements.txt  /app/
RUN pip install --no-cache-dir -r requirements.txt

COPY . /app/

RUN python manage.py collectstatic --noinput

EXPOSE 8000

CMD ["uvicorn", "backend.asgi:application", "--host", "0.0.0.0", "--port", "8000"]