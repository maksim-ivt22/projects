FROM python:3.13.3-alpine3.21

WORKDIR /app

# System dependencies for GeoDjango/PostGIS and building Python packages
RUN apk add --no-cache \
    binutils \
    proj-dev \
    gdal \
    gdal-dev \
    geos-dev \
    build-base \
    postgresql-dev \
    python3-dev

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

COPY requirements.txt /app/
RUN pip install --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt && \
    pip install --no-cache-dir gunicorn

COPY . /app/

EXPOSE 8000

CMD ["gunicorn", "backend.wsgi:application", "--bind", "0.0.0.0:8000", "--workers", "3", "--timeout", "120"]
