# Инструкция по настройке GitHub репозитория

## 1. Создание репозитория

1. Создайте новый репозиторий на GitHub (например, `tunuk`)
2. **НЕ** добавляйте README, .gitignore или лицензию (они уже есть в проекте)

## 2. Настройка base path

Перед первым push обновите `frontend/vite.config.js`:

```js
base: process.env.NODE_ENV === 'production' ? '/ваш-репозиторий/' : '/',
```

Например, если репозиторий называется `tunuk`:
```js
base: process.env.NODE_ENV === 'production' ? '/tunuk/' : '/',
```

## 3. Первый push

```bash
git init
git add .
git commit -m "Initial commit: Tunuk Beauty Services Platform"
git branch -M main
git remote add origin https://github.com/ваш-username/ваш-репозиторий.git
git push -u origin main
```

## 4. Настройка GitHub Pages

1. Перейдите в Settings → Pages
2. В разделе "Source" выберите **GitHub Actions**
3. Сохраните изменения

## 5. Автоматический деплой

GitHub Actions автоматически:
- Соберет проект при каждом push в `main`
- Задеплоит на GitHub Pages
- Сайт будет доступен по адресу: `https://ваш-username.github.io/ваш-репозиторий/`

## 6. Проверка деплоя

После первого push:
1. Перейдите в Actions вкладку репозитория
2. Дождитесь завершения workflow "Deploy to GitHub Pages"
3. Проверьте сайт по адресу из Settings → Pages

## 7. Мок-данные

Проект автоматически использует мок-данные на GitHub Pages. Все API запросы перехватываются и возвращают тестовые данные.

### Тестовые учетные данные для демо:

**Клиент:**
- Email: `client1@example.com`
- Пароль: `password123`

**Мастер:**
- Email: `master1@example.com`
- Пароль: `password123`

**Администратор:**
- Email: `admin@example.com`
- Пароль: `admin123`

## Troubleshooting

### Проблема: Страницы не открываются при прямом переходе

Решение: Убедитесь что `base` в `vite.config.js` правильный и соответствует имени репозитория.

### Проблема: GitHub Actions не запускается

Решение:
1. Проверьте что файл `.github/workflows/deploy.yml` существует
2. Убедитесь что выбрано "GitHub Actions" в Settings → Pages
3. Проверьте вкладку Actions на наличие ошибок

### Проблема: Мок-данные не работают

Решение:
1. Убедитесь что `USE_MOCK_DATA` правильно настроен в `frontend/src/mocks/api.js`
2. Проверьте консоль браузера на наличие ошибок
3. Убедитесь что все методы добавлены в `mockApi`

## Обновление проекта

После изменений просто делайте:

```bash
git add .
git commit -m "Описание изменений"
git push
```

GitHub Actions автоматически задеплоит обновления.

