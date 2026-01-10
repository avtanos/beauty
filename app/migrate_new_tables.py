"""
Скрипт для миграции: создание таблиц для блога, новостей и товаров
"""
import sqlite3
from pathlib import Path
from app.database import engine, Base
from app import models

# Определяем путь к базе данных
db_path = Path(__file__).parent.parent / "beauty_services.db"
if not db_path.exists():
    db_path = Path(__file__).parent.parent / "backend" / "beauty_services.db"

print(f"Создание таблиц в базе данных: {db_path}")

# Создаем все таблицы через SQLAlchemy
try:
    # Создаем только новые таблицы
    Base.metadata.create_all(bind=engine, tables=[
        models.BlogCategory.__table__,
        models.BlogTag.__table__,
        models.BlogPost.__table__,
        models.BlogPostTag.__table__,
        models.NewsSource.__table__,
        models.NewsCategory.__table__,
        models.NewsItem.__table__,
        models.ProductCategory.__table__,
        models.Product.__table__,
        models.ProductImage.__table__,
        models.ProductOrder.__table__,
        models.ProductOrderItem.__table__,
    ])
    print("[OK] Все таблицы успешно созданы!")
    
    # Показываем созданные таблицы
    conn = sqlite3.connect(str(db_path))
    cursor = conn.cursor()
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name")
    tables = cursor.fetchall()
    print("\nТаблицы в базе данных:")
    for table in tables:
        print(f"  - {table[0]}")
    conn.close()
    
except Exception as e:
    print(f"\n[ERROR] Ошибка при создании таблиц: {e}")
    raise
