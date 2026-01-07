# Решение проблем с пустым интерфейсом

## Быстрая проверка

1. **Откройте консоль браузера** (F12 → Console)
   - Проверьте наличие ошибок (красные сообщения)
   - Скопируйте ошибки, если они есть

2. **Проверьте Network вкладку** (F12 → Network)
   - Убедитесь, что запросы к `/api/*` идут на `http://localhost:8080`
   - Проверьте статус ответов (должны быть 200)

3. **Проверьте, что серверы запущены:**
   ```powershell
   # Backend должен быть на порту 8080
   Invoke-WebRequest http://localhost:8080/api/health
   
   # Frontend должен быть на порту 5173
   Invoke-WebRequest http://localhost:5173/
   ```

## Частые проблемы

### 1. Backend не запущен
**Решение:** Запустите backend:
```bash
cd backend
uvicorn app.main:app --reload --port 8080
```

### 2. CORS ошибки
**Решение:** Убедитесь, что в `backend/app/main.py` указан правильный порт frontend (5173)

### 3. Пустая страница без ошибок
**Решение:** 
- Очистите кеш браузера (Ctrl+Shift+Delete)
- Перезагрузите страницу (Ctrl+F5)
- Проверьте консоль на наличие ошибок

### 4. API запросы не проходят
**Решение:** Проверьте `frontend/vite.config.js` - proxy должен указывать на `http://localhost:8080`

## Проверка работы

1. Откройте http://localhost:5173
2. Должна отобразиться главная страница с:
   - Навигационным меню
   - Hero секцией
   - Категориями услуг
   - Списком услуг и мастеров

## Если ничего не помогает

1. Остановите все процессы:
   ```powershell
   Get-Process | Where-Object {$_.ProcessName -like "*node*" -or $_.ProcessName -like "*python*"} | Stop-Process -Force
   ```

2. Перезапустите серверы:
   ```powershell
   # Backend
   cd backend
   uvicorn app.main:app --reload --port 8080
   
   # Frontend (в другом терминале)
   cd frontend
   npm run dev
   ```

3. Откройте http://localhost:5173 в режиме инкогнито

