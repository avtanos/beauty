# Быстрый старт

## Шаг 1: Установка зависимостей

### Backend
```bash
cd backend
pip install -r requirements.txt
```

### Frontend
```bash
cd frontend
npm install
```

## Шаг 2: Настройка Backend

```bash
cd backend
# Создайте .env файл
echo "DATABASE_URL=sqlite:///./beauty_services.db" > .env
echo "SECRET_KEY=your-secret-key-change-in-production" >> .env

# Инициализируйте базу данных с тестовыми данными
python app/init_db.py
```

## Шаг 3: Запуск приложения

### Терминал 1 - Backend
```bash
cd backend
uvicorn app.main:app --reload
```

### Терминал 2 - Frontend
```bash
cd frontend
npm run dev
```

## Шаг 4: Откройте браузер

- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Документация: http://localhost:8000/docs

## Тестовые аккаунты

После запуска `init_db.py` вы можете использовать:

**Клиенты:**
- Email: `client1@example.com`
- Пароль: `password123`

**Мастера:**
- Email: `master1@example.com`
- Пароль: `password123`

## Основные функции

1. **Регистрация и вход** - создайте аккаунт клиента или мастера
2. **Просмотр услуг** - просмотрите доступные услуги
3. **Бронирование** - забронируйте услугу на удобное время
4. **Управление заказами** - отслеживайте статус ваших заказов
5. **Отзывы** - оставляйте отзывы после завершения услуги

## Для мастеров

1. Зарегистрируйтесь как мастер
2. Создайте свои услуги через API или добавьте функционал в UI
3. Управляйте бронированиями
4. Получайте отзывы от клиентов

