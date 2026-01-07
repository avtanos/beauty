# Архитектура проекта

## Обзор

Платформа состоит из двух основных частей:
- **Backend** - REST API на FastAPI
- **Frontend** - SPA на React

## Backend (FastAPI)

### Структура

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py              # Точка входа приложения
│   ├── database.py          # Настройка БД и сессий
│   ├── models.py            # SQLAlchemy модели
│   ├── schemas.py           # Pydantic схемы для валидации
│   ├── auth.py              # JWT аутентификация
│   ├── routers/             # API роутеры
│   │   ├── auth.py          # Регистрация, вход
│   │   ├── users.py         # Управление пользователями
│   │   ├── services.py      # Управление услугами
│   │   ├── bookings.py      # Бронирования
│   │   └── reviews.py       # Отзывы и рейтинги
│   └── init_db.py           # Инициализация тестовых данных
├── requirements.txt
└── README.md
```

### Модели данных

#### User
- Клиенты и мастера
- Роли: CLIENT, PROFESSIONAL, ADMIN
- Для мастеров: рейтинг, количество отзывов, опыт

#### Service
- Услуги, предлагаемые мастерами
- Категории: beauty, spa, massage, haircut, nail_care, cleaning, repair
- Многоязычность: name, name_ru, name_ky

#### Booking
- Бронирования услуг
- Статусы: pending, confirmed, in_progress, completed, cancelled

#### Review
- Отзывы клиентов о мастерах
- Рейтинг от 1 до 5
- Автоматический пересчет рейтинга мастера

### API Endpoints

Все endpoints имеют префикс `/api`

**Аутентификация:**
- `POST /auth/register` - Регистрация
- `POST /auth/login` - Вход (OAuth2)
- `GET /auth/me` - Текущий пользователь

**Услуги:**
- `GET /services` - Список (с фильтрацией по категории)
- `GET /services/{id}` - Детали
- `POST /services` - Создать (только мастера)
- `PUT /services/{id}` - Обновить
- `DELETE /services/{id}` - Деактивировать

**Бронирования:**
- `GET /bookings` - Список (для текущего пользователя)
- `GET /bookings/{id}` - Детали
- `POST /bookings` - Создать
- `PUT /bookings/{id}` - Обновить
- `POST /bookings/{id}/cancel` - Отменить

**Отзывы:**
- `GET /reviews` - Список (с фильтрацией по мастеру)
- `POST /reviews` - Создать (только для завершенных заказов)

**Пользователи:**
- `GET /users/professionals` - Список мастеров (мин. рейтинг 4.8)
- `GET /users/{id}` - Детали пользователя
- `PUT /users/me` - Обновить профиль

## Frontend (React)

### Структура

```
frontend/
├── src/
│   ├── components/          # Переиспользуемые компоненты
│   │   ├── Navbar.jsx       # Навигация
│   │   ├── Footer.jsx       # Футер
│   │   └── ProtectedRoute.jsx  # Защита маршрутов
│   ├── pages/               # Страницы приложения
│   │   ├── Home.jsx         # Главная
│   │   ├── Services.jsx     # Каталог услуг
│   │   ├── ServiceDetail.jsx # Детали услуги
│   │   ├── Professionals.jsx # Список мастеров
│   │   ├── ProfessionalDetail.jsx # Профиль мастера
│   │   ├── Login.jsx        # Вход
│   │   ├── Register.jsx    # Регистрация
│   │   ├── Profile.jsx      # Профиль пользователя
│   │   ├── Bookings.jsx     # Мои заказы
│   │   └── BookingForm.jsx  # Форма бронирования
│   ├── contexts/            # React Context
│   │   └── AuthContext.jsx  # Контекст аутентификации
│   ├── services/            # API клиенты
│   │   └── api.js           # Axios конфигурация
│   ├── App.jsx              # Главный компонент
│   ├── main.jsx             # Точка входа
│   └── index.css            # Глобальные стили
├── public/
├── package.json
└── vite.config.js
```

### Маршрутизация

- `/` - Главная страница
- `/services` - Каталог услуг
- `/services/:id` - Детали услуги
- `/professionals` - Список мастеров
- `/professionals/:id` - Профиль мастера
- `/login` - Вход
- `/register` - Регистрация
- `/profile` - Профиль (защищенный)
- `/bookings` - Мои заказы (защищенный)
- `/bookings/new/:serviceId` - Бронирование (защищенный)

### Аутентификация

Используется JWT токены, хранящиеся в localStorage.
Токен автоматически добавляется в заголовки всех запросов.

### Стилизация

- CSS модули для каждого компонента
- CSS переменные для цветов и размеров
- Адаптивный дизайн (mobile-first)
- Современный UI с градиентами и тенями

## База данных

По умолчанию используется SQLite для простоты разработки.
Для продакшена рекомендуется PostgreSQL.

### Миграции

Используется Alembic (в requirements.txt).
Для создания миграций:
```bash
alembic revision --autogenerate -m "Description"
alembic upgrade head
```

## Безопасность

- JWT токены для аутентификации
- Хеширование паролей (bcrypt)
- CORS настройки
- Валидация данных через Pydantic
- Защита маршрутов на frontend и backend

## Развертывание

### Backend

1. Установите зависимости
2. Настройте переменные окружения (.env)
3. Запустите миграции
4. Запустите через uvicorn или gunicorn

### Frontend

1. Установите зависимости (npm install)
2. Настройте API URL в vite.config.js
3. Соберите проект (npm run build)
4. Разместите dist/ на веб-сервере

## Расширение функционала

### Возможные улучшения:

1. **Платежи** - интеграция платежных систем
2. **Уведомления** - email/SMS уведомления
3. **Чат** - общение между клиентом и мастером
4. **Геолокация** - поиск мастеров поблизости
5. **Календарь** - визуализация доступного времени
6. **Фото галерея** - портфолио мастеров
7. **Промокоды** - система скидок
8. **Подписки** - абонементы на услуги

