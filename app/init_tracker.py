"""
Скрипт для инициализации данных Beauty Tracker
Создает базовые привычки и 30-дневный шаблон программы
"""
from app.database import SessionLocal
from app.models import (
    TrackerHabit, TrackerProgramTemplate, TrackerProgramDay, 
    TrackerProgramDayHabit, HabitCategory
)

def init_tracker_data():
    db = SessionLocal()
    
    try:
        # Проверяем, есть ли уже данные
        existing_template = db.query(TrackerProgramTemplate).first()
        if existing_template:
            print("Данные трекера уже существуют. Пропускаем инициализацию.")
            return
        
        # Создаем шаблон программы
        template = TrackerProgramTemplate(
            name="30 Days Beauty",
            version=1,
            is_active=True
        )
        db.add(template)
        db.commit()
        db.refresh(template)
        
        print(f"Создан шаблон программы: {template.name}")
        
        # Создаем базовые привычки
        habits_data = [
            # Face habits
            {"category": HabitCategory.FACE, "title": "Cleanse face", "title_ru": "Очистить лицо", "title_ky": "Бетти тазалоо"},
            {"category": HabitCategory.FACE, "title": "Apply moisturizer", "title_ru": "Нанести увлажняющий крем", "title_ky": "Нымдатуучу крем сүртүү"},
            {"category": HabitCategory.FACE, "title": "Apply sunscreen", "title_ru": "Нанести солнцезащитный крем", "title_ky": "Күн коргоочу крем сүртүү"},
            {"category": HabitCategory.FACE, "title": "Face mask", "title_ru": "Маска для лица", "title_ky": "Бет маскасы"},
            {"category": HabitCategory.FACE, "title": "Eye cream", "title_ru": "Крем для глаз", "title_ky": "Көз крем"},
            
            # Body habits
            {"category": HabitCategory.BODY, "title": "Body moisturizer", "title_ru": "Увлажняющий крем для тела", "title_ky": "Денеге нымдатуучу крем"},
            {"category": HabitCategory.BODY, "title": "Exfoliate", "title_ru": "Скрабирование", "title_ky": "Скраб кылуу"},
            {"category": HabitCategory.BODY, "title": "Body oil", "title_ru": "Масло для тела", "title_ky": "Дене майы"},
            {"category": HabitCategory.BODY, "title": "Dry brushing", "title_ru": "Сухая чистка", "title_ky": "Кургак тазалоо"},
            
            # Lifestyle habits
            {"category": HabitCategory.LIFESTYLE, "title": "Drink 8 glasses of water", "title_ru": "Выпить 8 стаканов воды", "title_ky": "8 стакан суу ичүү"},
            {"category": HabitCategory.LIFESTYLE, "title": "30 min walk", "title_ru": "30 минут прогулки", "title_ky": "30 мүнөт сейилдөө"},
            {"category": HabitCategory.LIFESTYLE, "title": "Healthy meal", "title_ru": "Здоровый прием пищи", "title_ky": "Ден соолуктуу тамак"},
            {"category": HabitCategory.LIFESTYLE, "title": "8 hours sleep", "title_ru": "8 часов сна", "title_ky": "8 саат уйку"},
            {"category": HabitCategory.LIFESTYLE, "title": "Meditation", "title_ru": "Медитация", "title_ky": "Медитация"},
        ]
        
        habits = []
        for habit_data in habits_data:
            habit = TrackerHabit(**habit_data, is_active=True)
            db.add(habit)
            habits.append(habit)
        
        db.commit()
        print(f"Создано {len(habits)} привычек")
        
        # Создаем 30 дней программы
        # Для упрощения, каждый день будет содержать базовый набор привычек
        # В реальном приложении это можно сделать более гибко
        
        days_config = [
            {"day": 1, "focus": "Start your journey", "focus_ru": "Начните свой путь", "focus_ky": "Жолуңузду баштаңыз"},
            {"day": 2, "focus": "Consistency is key", "focus_ru": "Регулярность - ключ", "focus_ky": "Туруктуулук - ачкыч"},
            {"day": 3, "focus": "Small steps matter", "focus_ru": "Маленькие шаги важны", "focus_ky": "Кичине кадамдар маанилүү"},
            # ... можно добавить все 30 дней, но для примера создам базовую структуру
        ]
        
        # Создаем дни 1-30 с базовым набором привычек
        for day_num in range(1, 31):
            # Базовый набор привычек для каждого дня
            day_habits = [
                habits[0],  # Cleanse face
                habits[1],  # Moisturizer
                habits[9],  # Water
            ]
            
            # Добавляем дополнительные привычки в зависимости от дня
            if day_num % 3 == 0:
                day_habits.append(habits[3])  # Face mask
            if day_num % 5 == 0:
                day_habits.append(habits[6])  # Exfoliate
            if day_num % 7 == 0:
                day_habits.append(habits[11])  # Walk
            
            # Создаем день
            program_day = TrackerProgramDay(
                program_template_id=template.id,
                day_number=day_num,
                focus_text=f"Day {day_num} focus",
                focus_text_ru=f"Фокус дня {day_num}",
                focus_text_ky=f"{day_num} күн фокусу"
            )
            db.add(program_day)
            db.commit()
            db.refresh(program_day)
            
            # Добавляем привычки к дню
            for idx, habit in enumerate(day_habits):
                day_habit = TrackerProgramDayHabit(
                    program_day_id=program_day.id,
                    habit_id=habit.id,
                    sort_order=idx
                )
                db.add(day_habit)
            
            db.commit()
        
        print(f"Создано 30 дней программы")
        print("Инициализация данных трекера завершена успешно!")
        
    except Exception as e:
        db.rollback()
        print(f"Ошибка при инициализации: {e}")
        raise
    finally:
        db.close()

if __name__ == "__main__":
    init_tracker_data()
