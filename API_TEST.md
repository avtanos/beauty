# Тестирование API

## Вход в систему

### Через curl (Windows PowerShell)

```powershell
# Формируем данные для входа
$body = @{
    username = "admin@example.com"
    password = "admin123"
}

# Отправляем запрос
Invoke-WebRequest -Uri "http://localhost:5174/api/auth/login" `
    -Method POST `
    -Body $body `
    -ContentType "application/x-www-form-urlencoded" `
    -UseBasicParsing
```

### Через curl.exe

```cmd
curl.exe "http://localhost:5174/api/auth/login" ^
  -X POST ^
  -H "Content-Type: application/x-www-form-urlencoded" ^
  -d "username=admin@example.com&password=admin123"
```

## Тестовые учетные данные

### Администратор
- Email: `admin@example.com`
- Пароль: `admin123`

### Клиенты
- Email: `client1@example.com`
- Пароль: `password123`

- Email: `client2@example.com`
- Пароль: `password123`

### Мастера
- Email: `master1@example.com`
- Пароль: `password123`

## Использование токена

После успешного входа вы получите `access_token`. Используйте его для авторизованных запросов:

```powershell
$token = "ваш_токен_здесь"
$headers = @{
    "Authorization" = "Bearer $token"
}

Invoke-WebRequest -Uri "http://localhost:5174/api/auth/me" `
    -Headers $headers `
    -UseBasicParsing
```

## Прямой доступ к Backend (без прокси)

Если нужно обратиться напрямую к backend:

```powershell
Invoke-WebRequest -Uri "http://localhost:8080/api/auth/login" `
    -Method POST `
    -Body $body `
    -ContentType "application/x-www-form-urlencoded" `
    -UseBasicParsing
```

