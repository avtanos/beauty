# Настройка GitHub Pages - Пошаговая инструкция

## Проблема: "Get Pages site failed"

Эта ошибка возникает, когда GitHub Pages еще не включен в настройках репозитория.

## Решение:

### Шаг 1: Включите GitHub Pages

1. Перейдите в ваш репозиторий: https://github.com/avtanos/beauty
2. Нажмите на вкладку **Settings** (вверху репозитория)
3. В левом меню найдите раздел **Pages**
4. В разделе **Source** выберите **GitHub Actions**
5. Нажмите **Save**

### Шаг 2: Проверьте workflow

Убедитесь, что файл `.github/workflows/deploy.yml` существует и содержит правильную конфигурацию.

### Шаг 3: Запустите workflow вручную (опционально)

1. Перейдите во вкладку **Actions**
2. Выберите workflow "Deploy to GitHub Pages"
3. Нажмите **Run workflow** → **Run workflow**

### Шаг 4: Дождитесь завершения

После включения Pages, workflow должен автоматически запуститься при следующем push или вы можете запустить его вручную.

## Альтернативное решение (если проблема сохраняется)

Если ошибка все еще возникает, попробуйте:

1. Удалите и заново создайте workflow:
   - Удалите файл `.github/workflows/deploy.yml`
   - Создайте новый commit
   - Push в репозиторий
   - Создайте workflow заново

2. Или используйте упрощенную версию workflow (см. ниже)

## Упрощенный workflow (если нужно)

Если стандартный workflow не работает, используйте этот:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]

permissions:
  contents: read
  pages: write
  id-token: write

jobs:
  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
          cache-dependency-path: frontend/package-lock.json
      
      - name: Install dependencies
        working-directory: ./frontend
        run: npm ci
      
      - name: Build
        working-directory: ./frontend
        run: npm run build
        env:
          NODE_ENV: production
          GITHUB_REPOSITORY: ${{ github.repository }}
      
      - name: Setup Pages
        uses: actions/configure-pages@v4
      
      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: './frontend/dist'
      
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

## Проверка

После настройки:

1. Проверьте вкладку **Actions** - должен быть запущен workflow
2. После успешного завершения, сайт будет доступен по адресу:
   **https://avtanos.github.io/beauty/**

## Важно

- GitHub Pages должен быть включен **ДО** первого запуска workflow
- Убедитесь, что выбрано "GitHub Actions" в качестве источника
- Первый деплой может занять несколько минут

