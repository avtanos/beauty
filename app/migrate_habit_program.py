"""
Скрипт для миграции: добавление поля program_template_id в таблицу tracker_habits
"""
import sqlite3
from pathlib import Path

# Определяем путь к базе данных
db_path = Path(__file__).parent.parent / "beauty_services.db"
if not db_path.exists():
    db_path = Path(__file__).parent.parent / "backend" / "beauty_services.db"

if not db_path.exists():
    print(f"База данных не найдена: {db_path}")
    exit(1)

print(f"Добавление поля program_template_id в таблицу tracker_habits в базе данных: {db_path}")

try:
    conn = sqlite3.connect(str(db_path))
    cursor = conn.cursor()
    
    # Проверяем, существует ли уже поле program_template_id
    cursor.execute("PRAGMA table_info(tracker_habits)")
    columns = [col[1] for col in cursor.fetchall()]
    
    if 'program_template_id' not in columns:
        # Добавляем поле program_template_id
        print("Добавление поля program_template_id...")
        cursor.execute("""
            ALTER TABLE tracker_habits 
            ADD COLUMN program_template_id INTEGER 
            REFERENCES tracker_program_templates(id)
        """)
        conn.commit()
        print("[OK] Поле program_template_id успешно добавлено")
    else:
        print("[INFO] Поле program_template_id уже существует")
    
    # Проверяем структуру таблицы
    cursor.execute("PRAGMA table_info(tracker_habits)")
    columns = cursor.fetchall()
    print("\nТекущая структура таблицы tracker_habits:")
    for col in columns:
        print(f"  {col[1]} ({col[2]})")
    
    conn.close()
    print("\n[OK] Миграция завершена успешно")
    
except Exception as e:
    print(f"[ERROR] Ошибка при миграции: {e}")
    if 'conn' in locals():
        conn.rollback()
        conn.close()
    exit(1)
