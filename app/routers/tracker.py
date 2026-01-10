from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_
from datetime import datetime
from app.database import get_db
from app import models, schemas
from app.auth import get_current_active_user
from app.models import DayStatus, ProgramStatus, HabitCategory

router = APIRouter()

# Публичные endpoints
@router.get("/public/programs")
def get_public_programs(db: Session = Depends(get_db)):
    """Получить список ВСЕХ АКТИВНЫХ программ для гостей (только is_active == True)"""
    # Фильтруем только активные программы
    templates = db.query(models.TrackerProgramTemplate).filter(
        models.TrackerProgramTemplate.is_active == True
    ).order_by(models.TrackerProgramTemplate.id).all()
    
    result = []
    for template in templates:
        # Подсчитываем количество дней для каждой программы
        days_count = db.query(models.TrackerProgramDay).filter(
            models.TrackerProgramDay.program_template_id == template.id
        ).count()
        
        # Возвращаем только активные программы
        result.append({
            "id": template.id,
            "name": template.name,
            "description": template.description,
            "description_ru": template.description_ru,
            "description_ky": template.description_ky,
            "days_count": days_count,
            "version": template.version,
            "is_active": True  # Явно указываем, что все программы активны
        })
    
    return result

@router.get("/public", response_model=schemas.TrackerPublicInfo)
def get_public_info(db: Session = Depends(get_db)):
    """Получить публичную информацию о трекере для лендинга"""
    return {
        "title": "Beauty Tracker - 30 Days of Self-Care",
        "title_ru": "Beauty Tracker - 30 дней заботы о себе",
        "title_ky": "Beauty Tracker - Өзүңүзгө кам көрүүнүн 30 күнү",
        "description": "A gentle 30-day program of daily beauty and self-care habits. Each day brings a simple, manageable plan to help you build consistency without overwhelm.",
        "description_ru": "Мягкая 30-дневная программа ежедневных привычек красоты и заботы о себе. Каждый день приносит простой, выполнимый план, который поможет вам выработать регулярность без перегрузки.",
        "description_ky": "Күн сайын сулуулук жана өзүңүзгө кам көрүү кылык-жоруктарынын жумшак 30 күндүк программасы. Ар бир күн жөнөкөй, аткарууга мүмкүн болгон планды алып келет, ал сизге чыңалуусуз туруктуулукту түзүүгө жардам берет.",
        "benefits": [
            "Build consistent self-care habits",
            "Simple daily tasks that don't overwhelm",
            "Track your progress over 30 days",
            "Focus on face, body, and lifestyle"
        ],
        "benefits_ru": [
            "Выработайте регулярные привычки заботы о себе",
            "Простые ежедневные задачи, которые не перегружают",
            "Отслеживайте свой прогресс в течение 30 дней",
            "Фокус на лице, теле и образе жизни"
        ],
        "benefits_ky": [
            "Өзүңүзгө кам көрүүнүн туруктуу кылык-жоруктарын түзүү",
            "Чыңалуусуз күн сайын жөнөкөй милдеттер",
            "30 күн бою прогрессиңизди көзөмөлдөө",
            "Бет, дене жана жашоо образына багыттоо"
        ]
    }

@router.get("/public/programs/{program_id}/demo-day")
def get_demo_day(program_id: int, db: Session = Depends(get_db)):
    """Получить пример дня для демонстрации конкретной программы (без персональных данных)"""
    # Проверяем, что программа существует и активна
    template = db.query(models.TrackerProgramTemplate).filter(
        models.TrackerProgramTemplate.id == program_id,
        models.TrackerProgramTemplate.is_active == True
    ).first()
    
    if not template:
        raise HTTPException(status_code=404, detail="Program not found or not active")
    
    # Получаем первый день программы
    day = db.query(models.TrackerProgramDay).filter(
        models.TrackerProgramDay.program_template_id == template.id,
        models.TrackerProgramDay.day_number == 1
    ).first()
    
    if not day:
        raise HTTPException(status_code=404, detail="Demo day not found")
    
    # Получаем привычки для этого дня
    day_habits = db.query(models.TrackerProgramDayHabit).filter(
        models.TrackerProgramDayHabit.program_day_id == day.id
    ).order_by(models.TrackerProgramDayHabit.sort_order).all()
    
    habits = []
    for dh in day_habits:
        habit = db.query(models.TrackerHabit).filter(models.TrackerHabit.id == dh.habit_id).first()
        if habit and habit.is_active:
            habits.append({
                "id": habit.id,
                "category": habit.category.value,
                "title": habit.title,
                "title_ru": habit.title_ru,
                "title_ky": habit.title_ky,
                "description": habit.description
            })
    
    return {
        "program_id": template.id,
        "program_name": template.name,
        "day_number": day.day_number,
        "focus_text": day.focus_text,
        "focus_text_ru": day.focus_text_ru,
        "focus_text_ky": day.focus_text_ky,
        "habits": habits,
        "is_demo": True
    }

# Защищенные endpoints (для клиентов и мастеров)
@router.post("/programs/start", response_model=schemas.TrackerUserProgramResponse)
def start_program(
    current_user: models.User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Начать 30-дневную программу"""
    # Проверяем, есть ли уже активная программа
    existing = db.query(models.TrackerUserProgram).filter(
        models.TrackerUserProgram.user_id == current_user.id,
        models.TrackerUserProgram.status == ProgramStatus.ACTIVE
    ).first()
    
    if existing:
        raise HTTPException(status_code=400, detail="You already have an active program")
    
    # Получаем активный шаблон
    template = db.query(models.TrackerProgramTemplate).filter(
        models.TrackerProgramTemplate.is_active == True
    ).first()
    
    if not template:
        raise HTTPException(status_code=404, detail="No active program template found")
    
    # Создаем программу для пользователя
    user_program = models.TrackerUserProgram(
        user_id=current_user.id,
        program_template_id=template.id,
        status=ProgramStatus.ACTIVE,
        allowed_skips=3
    )
    db.add(user_program)
    db.commit()
    db.refresh(user_program)
    
    # Создаем дни для пользователя (все 30 дней, но первый открыт)
    for day_num in range(1, 31):
        status = DayStatus.OPEN if day_num == 1 else DayStatus.LOCKED
        opened_at = datetime.utcnow() if day_num == 1 else None
        
        user_day = models.TrackerUserDay(
            user_program_id=user_program.id,
            day_number=day_num,
            status=status,
            opened_at=opened_at
        )
        db.add(user_day)
    
    db.commit()
    
    return user_program

@router.get("/programs/current", response_model=schemas.TrackerUserProgramResponse)
def get_current_program(
    current_user: models.User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Получить текущую активную программу"""
    program = db.query(models.TrackerUserProgram).filter(
        models.TrackerUserProgram.user_id == current_user.id,
        models.TrackerUserProgram.status == ProgramStatus.ACTIVE
    ).first()
    
    if not program:
        return None
    
    return program

@router.get("/days/current", response_model=schemas.TrackerUserDayResponse)
def get_current_day(
    current_user: models.User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Получить текущий открытый день"""
    program = db.query(models.TrackerUserProgram).filter(
        models.TrackerUserProgram.user_id == current_user.id,
        models.TrackerUserProgram.status == ProgramStatus.ACTIVE
    ).first()
    
    if not program:
        raise HTTPException(status_code=404, detail="No active program found")
    
    # Находим текущий открытый день
    current_day = db.query(models.TrackerUserDay).filter(
        models.TrackerUserDay.user_program_id == program.id,
        models.TrackerUserDay.status == DayStatus.OPEN
    ).first()
    
    if not current_day:
        # Если нет открытого дня, ищем последний завершенный/пропущенный
        last_day = db.query(models.TrackerUserDay).filter(
            models.TrackerUserDay.user_program_id == program.id,
            models.TrackerUserDay.status.in_([DayStatus.COMPLETED, DayStatus.SKIPPED])
        ).order_by(models.TrackerUserDay.day_number.desc()).first()
        
        if last_day and last_day.day_number < 30:
            # Открываем следующий день
            next_day = db.query(models.TrackerUserDay).filter(
                models.TrackerUserDay.user_program_id == program.id,
                models.TrackerUserDay.day_number == last_day.day_number + 1
            ).first()
            
            if next_day:
                next_day.status = DayStatus.OPEN
                next_day.opened_at = datetime.utcnow()
                db.commit()
                current_day = next_day
        else:
            raise HTTPException(status_code=404, detail="No current day available")
    
    return _build_day_response(current_day, program, db)

@router.get("/days/{day_number}", response_model=schemas.TrackerUserDayResponse)
def get_day(
    day_number: int,
    current_user: models.User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Получить день по номеру (только если доступен)"""
    if day_number < 1 or day_number > 30:
        raise HTTPException(status_code=400, detail="Day number must be between 1 and 30")
    
    program = db.query(models.TrackerUserProgram).filter(
        models.TrackerUserProgram.user_id == current_user.id,
        models.TrackerUserProgram.status == ProgramStatus.ACTIVE
    ).first()
    
    if not program:
        raise HTTPException(status_code=404, detail="No active program found")
    
    user_day = db.query(models.TrackerUserDay).filter(
        models.TrackerUserDay.user_program_id == program.id,
        models.TrackerUserDay.day_number == day_number
    ).first()
    
    if not user_day:
        raise HTTPException(status_code=404, detail="Day not found")
    
    # Проверяем доступность дня
    if user_day.status == DayStatus.LOCKED:
        # Проверяем, можно ли открыть
        prev_day = db.query(models.TrackerUserDay).filter(
            models.TrackerUserDay.user_program_id == program.id,
            models.TrackerUserDay.day_number == day_number - 1
        ).first()
        
        if not prev_day or prev_day.status not in [DayStatus.COMPLETED, DayStatus.SKIPPED]:
            raise HTTPException(status_code=403, detail="Previous day must be completed or skipped first")
        
        # Открываем день
        user_day.status = DayStatus.OPEN
        user_day.opened_at = datetime.utcnow()
        db.commit()
        db.refresh(user_day)
    
    return _build_day_response(user_day, program, db)

@router.post("/days/{day_number}/complete")
def complete_day(
    day_number: int,
    current_user: models.User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Завершить день"""
    program = db.query(models.TrackerUserProgram).filter(
        models.TrackerUserProgram.user_id == current_user.id,
        models.TrackerUserProgram.status == ProgramStatus.ACTIVE
    ).first()
    
    if not program:
        raise HTTPException(status_code=404, detail="No active program found")
    
    user_day = db.query(models.TrackerUserDay).filter(
        models.TrackerUserDay.user_program_id == program.id,
        models.TrackerUserDay.day_number == day_number
    ).first()
    
    if not user_day:
        raise HTTPException(status_code=404, detail="Day not found")
    
    if user_day.status not in [DayStatus.OPEN, DayStatus.SKIPPED]:
        raise HTTPException(status_code=400, detail="Day is not open")
    
    user_day.status = DayStatus.COMPLETED
    user_day.closed_at = datetime.utcnow()
    
    # Если это последний день, завершаем программу
    if day_number == 30:
        program.status = ProgramStatus.FINISHED
        program.finished_at = datetime.utcnow()
    else:
        # Открываем следующий день
        next_day = db.query(models.TrackerUserDay).filter(
            models.TrackerUserDay.user_program_id == program.id,
            models.TrackerUserDay.day_number == day_number + 1
        ).first()
        
        if next_day:
            next_day.status = DayStatus.OPEN
            next_day.opened_at = datetime.utcnow()
    
    db.commit()
    return {"message": "Day completed", "day_number": day_number}

@router.post("/days/{day_number}/skip")
def skip_day(
    day_number: int,
    current_user: models.User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Пропустить день"""
    program = db.query(models.TrackerUserProgram).filter(
        models.TrackerUserProgram.user_id == current_user.id,
        models.TrackerUserProgram.status == ProgramStatus.ACTIVE
    ).first()
    
    if not program:
        raise HTTPException(status_code=404, detail="No active program found")
    
    if program.used_skips >= program.allowed_skips:
        raise HTTPException(status_code=400, detail="Maximum skips reached")
    
    user_day = db.query(models.TrackerUserDay).filter(
        models.TrackerUserDay.user_program_id == program.id,
        models.TrackerUserDay.day_number == day_number
    ).first()
    
    if not user_day:
        raise HTTPException(status_code=404, detail="Day not found")
    
    if user_day.status != DayStatus.OPEN:
        raise HTTPException(status_code=400, detail="Day is not open")
    
    user_day.status = DayStatus.SKIPPED
    user_day.closed_at = datetime.utcnow()
    program.used_skips += 1
    
    # Открываем следующий день
    if day_number < 30:
        next_day = db.query(models.TrackerUserDay).filter(
            models.TrackerUserDay.user_program_id == program.id,
            models.TrackerUserDay.day_number == day_number + 1
        ).first()
        
        if next_day:
            next_day.status = DayStatus.OPEN
            next_day.opened_at = datetime.utcnow()
    
    db.commit()
    return {"message": "Day skipped", "day_number": day_number, "used_skips": program.used_skips}

@router.post("/days/{day_number}/habits/{habit_id}/toggle")
def toggle_habit(
    day_number: int,
    habit_id: int,
    current_user: models.User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Отметить/снять отметку привычки"""
    program = db.query(models.TrackerUserProgram).filter(
        models.TrackerUserProgram.user_id == current_user.id,
        models.TrackerUserProgram.status == ProgramStatus.ACTIVE
    ).first()
    
    if not program:
        raise HTTPException(status_code=404, detail="No active program found")
    
    user_day = db.query(models.TrackerUserDay).filter(
        models.TrackerUserDay.user_program_id == program.id,
        models.TrackerUserDay.day_number == day_number
    ).first()
    
    if not user_day:
        raise HTTPException(status_code=404, detail="Day not found")
    
    if user_day.status not in [DayStatus.OPEN]:
        raise HTTPException(status_code=400, detail="Day is not open")
    
    # Проверяем, есть ли эта привычка в дне
    program_day = db.query(models.TrackerProgramDay).filter(
        models.TrackerProgramDay.program_template_id == program.program_template_id,
        models.TrackerProgramDay.day_number == day_number
    ).first()
    
    if not program_day:
        raise HTTPException(status_code=404, detail="Program day not found")
    
    day_habit = db.query(models.TrackerProgramDayHabit).filter(
        models.TrackerProgramDayHabit.program_day_id == program_day.id,
        models.TrackerProgramDayHabit.habit_id == habit_id
    ).first()
    
    if not day_habit:
        raise HTTPException(status_code=404, detail="Habit not found in this day")
    
    # Ищем или создаем лог
    log = db.query(models.TrackerUserDayLog).filter(
        models.TrackerUserDayLog.user_day_id == user_day.id,
        models.TrackerUserDayLog.habit_id == habit_id
    ).first()
    
    if log:
        log.completed = not log.completed
        log.completed_at = datetime.utcnow() if log.completed else None
    else:
        log = models.TrackerUserDayLog(
            user_day_id=user_day.id,
            habit_id=habit_id,
            completed=True,
            completed_at=datetime.utcnow()
        )
        db.add(log)
    
    db.commit()
    return {"message": "Habit toggled", "completed": log.completed}

@router.get("/progress", response_model=schemas.TrackerProgressResponse)
def get_progress(
    current_user: models.User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Получить статистику прогресса"""
    program = db.query(models.TrackerUserProgram).filter(
        models.TrackerUserProgram.user_id == current_user.id,
        models.TrackerUserProgram.status == ProgramStatus.ACTIVE
    ).first()
    
    if not program:
        raise HTTPException(status_code=404, detail="No active program found")
    
    days = db.query(models.TrackerUserDay).filter(
        models.TrackerUserDay.user_program_id == program.id
    ).all()
    
    completed = sum(1 for d in days if d.status == DayStatus.COMPLETED)
    skipped = sum(1 for d in days if d.status == DayStatus.SKIPPED)
    
    # Вычисляем streak (последние последовательно завершенные дни)
    current_streak = 0
    for day in sorted(days, key=lambda x: x.day_number, reverse=True):
        if day.status == DayStatus.COMPLETED:
            current_streak += 1
        elif day.status == DayStatus.SKIPPED:
            break
        else:
            break
    
    # Находим текущий день
    current_day = None
    for day in days:
        if day.status == DayStatus.OPEN:
            current_day = day.day_number
            break
    
    # Процент выполнения (завершенные дни / общее количество)
    completion_percentage = (completed / 30) * 100 if days else 0
    
    return {
        "total_days": 30,
        "completed_days": completed,
        "skipped_days": skipped,
        "current_streak": current_streak,
        "completion_percentage": round(completion_percentage, 2),
        "current_day": current_day,
        "used_skips": program.used_skips,
        "allowed_skips": program.allowed_skips
    }

def _build_day_response(user_day: models.TrackerUserDay, program: models.TrackerUserProgram, db: Session) -> dict:
    """Вспомогательная функция для построения ответа дня"""
    # Получаем данные дня из шаблона
    program_day = db.query(models.TrackerProgramDay).filter(
        models.TrackerProgramDay.program_template_id == program.program_template_id,
        models.TrackerProgramDay.day_number == user_day.day_number
    ).first()
    
    # Получаем привычки для этого дня
    habits_data = []
    if program_day:
        day_habits = db.query(models.TrackerProgramDayHabit).filter(
            models.TrackerProgramDayHabit.program_day_id == program_day.id
        ).order_by(models.TrackerProgramDayHabit.sort_order).all()
        
        for dh in day_habits:
            habit = db.query(models.TrackerHabit).filter(models.TrackerHabit.id == dh.habit_id).first()
            if habit:
                # Проверяем, есть ли лог для этой привычки
                log = db.query(models.TrackerUserDayLog).filter(
                    models.TrackerUserDayLog.user_day_id == user_day.id,
                    models.TrackerUserDayLog.habit_id == habit.id
                ).first()
                
                habits_data.append({
                    "id": habit.id,
                    "category": habit.category.value,
                    "title": habit.title,
                    "title_ru": habit.title_ru,
                    "title_ky": habit.title_ky,
                    "description": habit.description,
                    "description_ru": habit.description_ru,
                    "description_ky": habit.description_ky,
                    "completed": log.completed if log else False,
                    "log_id": log.id if log else None
                })
    
    return {
        "id": user_day.id,
        "day_number": user_day.day_number,
        "status": user_day.status.value,
        "opened_at": user_day.opened_at,
        "closed_at": user_day.closed_at,
        "focus_text": program_day.focus_text if program_day else None,
        "focus_text_ru": program_day.focus_text_ru if program_day else None,
        "focus_text_ky": program_day.focus_text_ky if program_day else None,
        "habits": habits_data
    }
