"""
Скрипт для миграции: добавление полей description и days_count в таблицу tracker_program_templates
"""
import sqlite3
import os
from pathlib import Path

# Определяем путь к базе данных
db_path = Path(__file__).parent.parent / "beauty_services.db"
if not db_path.exists():
    # Пробуем альтернативный путь
    db_path = Path(__file__).parent.parent / "backend" / "beauty_services.db"

if not db_path.exists():
    print(f"База данных не найдена по пути: {db_path}")
    exit(1)

print(f"Подключение к базе данных: {db_path}")

conn = sqlite3.connect(str(db_path))
cursor = conn.cursor()

try:
    # Проверяем, существуют ли уже эти поля
    cursor.execute("PRAGMA table_info(tracker_program_templates)")
    columns = [row[1] for row in cursor.fetchall()]
    
    print(f"Текущие колонки: {columns}")
    
    # Добавляем поле description, если его нет
    if 'description' not in columns:
        print("Добавление поля 'description'...")
        cursor.execute("ALTER TABLE tracker_program_templates ADD COLUMN description TEXT")
        print("[OK] Поле 'description' добавлено")
    else:
        print("[OK] Поле 'description' уже существует")
    
    # Добавляем поле description_ru, если его нет
    if 'description_ru' not in columns:
        print("Добавление поля 'description_ru'...")
        cursor.execute("ALTER TABLE tracker_program_templates ADD COLUMN description_ru TEXT")
        print("[OK] Поле 'description_ru' добавлено")
    else:
        print("[OK] Поле 'description_ru' уже существует")
    
    # Добавляем поле description_ky, если его нет
    if 'description_ky' not in columns:
        print("Добавление поля 'description_ky'...")
        cursor.execute("ALTER TABLE tracker_program_templates ADD COLUMN description_ky TEXT")
        print("[OK] Поле 'description_ky' добавлено")
    else:
        print("[OK] Поле 'description_ky' уже существует")
    
    # Добавляем поле days_count, если его нет
    if 'days_count' not in columns:
        print("Добавление поля 'days_count'...")
        cursor.execute("ALTER TABLE tracker_program_templates ADD COLUMN days_count INTEGER DEFAULT 30")
        print("[OK] Поле 'days_count' добавлено")
    else:
        print("[OK] Поле 'days_count' уже существует")
    
    # Обновляем существующие записи, устанавливая days_count = 30, если он NULL
    cursor.execute("UPDATE tracker_program_templates SET days_count = 30 WHERE days_count IS NULL")
    updated = cursor.rowcount
    if updated > 0:
        print(f"[OK] Обновлено {updated} записей: установлено days_count = 30")
    
    conn.commit()
    print("\n[OK] Миграция успешно завершена!")
    
    # Показываем результат
    cursor.execute("PRAGMA table_info(tracker_program_templates)")
    columns = cursor.fetchall()
    print("\nСтруктура таблицы tracker_program_templates:")
    for col in columns:
        print(f"  - {col[1]} ({col[2]})")

except Exception as e:
    conn.rollback()
    print(f"\n[ERROR] Ошибка при выполнении миграции: {e}")
    raise
finally:
    conn.close()
