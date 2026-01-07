# Tunuk - Backend

Backend API для платформы Beauty Services на FastAPI.

## Установка

```bash
cd backend
pip install -r requirements.txt
```

## Настройка

Создайте файл `.env` на основе `.env.example`:

```bash
cp .env.example .env
```

## Запуск

```bash
uvicorn app.main:app --reload
```

API будет доступен по адресу: http://localhost:8000

Документация API: http://localhost:8000/docs

