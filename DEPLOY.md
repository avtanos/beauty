# Инструкция по деплою на GitHub Pages

## Подготовка

1. Создайте репозиторий на GitHub (например, `tunuk`)

2. Обновите `base` в `frontend/vite.config.js`:
   ```js
   base: process.env.NODE_ENV === 'production' ? '/tunuk/' : '/',
   ```
   Замените `/tunuk/` на имя вашего репозитория.

## Деплой

### Автоматический деплой (рекомендуется)

1. Запушьте код в GitHub:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/yourusername/tunuk.git
   git push -u origin main
   ```

2. В настройках репозитория:
   - Settings → Pages
   - Source: GitHub Actions

3. GitHub Actions автоматически задеплоит проект при каждом push в main

### Ручной деплой

1. Соберите проект:
   ```bash
   cd frontend
   npm run build
   ```

2. Задеплойте папку `dist` на GitHub Pages

## Мок-данные

Проект настроен для работы с мок-данными на GitHub Pages. Все API запросы автоматически перехватываются и возвращают мок-данные.

### Включение/отключение мок-данных

В production мок-данные включены автоматически.

В development:
```javascript
localStorage.setItem("useMockData", "true")  // Включить
localStorage.setItem("useMockData", "false") // Отключить
```

## Проверка деплоя

После деплоя проект будет доступен по адресу:
- `https://yourusername.github.io/tunuk/`

## Troubleshooting

### Проблема с роутингом

Если страницы не открываются при прямом переходе, убедитесь что:
1. `base` в `vite.config.js` правильный
2. Используется `HashRouter` или настроен 404 redirect на GitHub Pages

### Проблема с мок-данными

Убедитесь что:
1. `USE_MOCK_DATA` правильно настроен в `frontend/src/mocks/api.js`
2. Все необходимые методы добавлены в `mockApi`

