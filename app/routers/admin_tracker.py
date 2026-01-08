from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app import models, schemas
from app.auth import get_current_active_user
from app.models import UserRole, HabitCategory

router = APIRouter()

def require_admin(current_user: models.User = Depends(get_current_active_user)):
    """Проверка прав администратора"""
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Требуются права администратора")
    return current_user

# Управление шаблонами программ
@router.get("/templates", response_model=List[schemas.TrackerProgramTemplateResponse])
def get_templates(
    current_user: models.User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Получить все шаблоны программ"""
    templates = db.query(models.TrackerProgramTemplate).all()
    return templates

@router.post("/templates", response_model=schemas.TrackerProgramTemplateResponse)
def create_template(
    template: schemas.TrackerProgramTemplateCreate,
    current_user: models.User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Создать новый шаблон программы"""
    db_template = models.TrackerProgramTemplate(**template.dict())
    db.add(db_template)
    db.commit()
    db.refresh(db_template)
    return db_template

@router.put("/templates/{template_id}", response_model=schemas.TrackerProgramTemplateResponse)
def update_template(
    template_id: int,
    template_update: dict,
    current_user: models.User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Обновить шаблон программы"""
    db_template = db.query(models.TrackerProgramTemplate).filter(
        models.TrackerProgramTemplate.id == template_id
    ).first()
    
    if not db_template:
        raise HTTPException(status_code=404, detail="Template not found")
    
    for field, value in template_update.items():
        if hasattr(db_template, field):
            setattr(db_template, field, value)
    
    db.commit()
    db.refresh(db_template)
    return db_template

@router.post("/templates/{template_id}/activate")
def activate_template(
    template_id: int,
    current_user: models.User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Активировать шаблон (деактивирует остальные)"""
    template = db.query(models.TrackerProgramTemplate).filter(
        models.TrackerProgramTemplate.id == template_id
    ).first()
    
    if not template:
        raise HTTPException(status_code=404, detail="Template not found")
    
    # Деактивируем все шаблоны
    db.query(models.TrackerProgramTemplate).update({"is_active": False})
    
    # Активируем выбранный
    template.is_active = True
    db.commit()
    return {"message": "Template activated"}

@router.delete("/templates/{template_id}")
def delete_template(
    template_id: int,
    current_user: models.User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Удалить шаблон программы"""
    template = db.query(models.TrackerProgramTemplate).filter(
        models.TrackerProgramTemplate.id == template_id
    ).first()
    
    if not template:
        raise HTTPException(status_code=404, detail="Template not found")
    
    # Удаляем все дни шаблона (каскадное удаление связей)
    days = db.query(models.TrackerProgramDay).filter(
        models.TrackerProgramDay.program_template_id == template_id
    ).all()
    
    for day in days:
        # Удаляем связи с привычками
        db.query(models.TrackerProgramDayHabit).filter(
            models.TrackerProgramDayHabit.program_day_id == day.id
        ).delete()
        # Удаляем день
        db.delete(day)
    
    # Удаляем шаблон
    db.delete(template)
    db.commit()
    return {"message": "Template deleted"}

# Управление привычками
@router.get("/habits", response_model=List[schemas.TrackerHabitResponse])
def get_habits(
    category: Optional[HabitCategory] = None,
    current_user: models.User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Получить все привычки"""
    query = db.query(models.TrackerHabit)
    
    if category:
        query = query.filter(models.TrackerHabit.category == category)
    
    habits = query.all()
    return habits

@router.post("/habits", response_model=schemas.TrackerHabitResponse)
def create_habit(
    habit: schemas.TrackerHabitCreate,
    current_user: models.User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Создать новую привычку"""
    db_habit = models.TrackerHabit(**habit.dict())
    db.add(db_habit)
    db.commit()
    db.refresh(db_habit)
    return db_habit

@router.put("/habits/{habit_id}", response_model=schemas.TrackerHabitResponse)
def update_habit(
    habit_id: int,
    habit_update: schemas.TrackerHabitUpdate,
    current_user: models.User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Обновить привычку"""
    db_habit = db.query(models.TrackerHabit).filter(
        models.TrackerHabit.id == habit_id
    ).first()
    
    if not db_habit:
        raise HTTPException(status_code=404, detail="Habit not found")
    
    update_data = habit_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_habit, field, value)
    
    db.commit()
    db.refresh(db_habit)
    return db_habit

@router.delete("/habits/{habit_id}")
def delete_habit(
    habit_id: int,
    current_user: models.User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Деактивировать привычку"""
    habit = db.query(models.TrackerHabit).filter(
        models.TrackerHabit.id == habit_id
    ).first()
    
    if not habit:
        raise HTTPException(status_code=404, detail="Habit not found")
    
    habit.is_active = False
    db.commit()
    return {"message": "Habit deactivated"}

# Управление днями программы
@router.get("/templates/{template_id}/days", response_model=List[schemas.TrackerProgramDayResponse])
def get_template_days(
    template_id: int,
    current_user: models.User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Получить все дни шаблона"""
    days = db.query(models.TrackerProgramDay).filter(
        models.TrackerProgramDay.program_template_id == template_id
    ).order_by(models.TrackerProgramDay.day_number).all()
    
    # Загружаем привычки для каждого дня
    result = []
    for day in days:
        day_habits = db.query(models.TrackerProgramDayHabit).filter(
            models.TrackerProgramDayHabit.program_day_id == day.id
        ).order_by(models.TrackerProgramDayHabit.sort_order).all()
        
        habits = []
        for dh in day_habits:
            habit = db.query(models.TrackerHabit).filter(models.TrackerHabit.id == dh.habit_id).first()
            if habit:
                habits.append(schemas.TrackerHabitResponse.model_validate(habit))
        
        day_dict = schemas.TrackerProgramDayResponse.model_validate(day).model_dump()
        day_dict["habits"] = habits
        result.append(day_dict)
    
    return result

@router.post("/templates/{template_id}/days", response_model=schemas.TrackerProgramDayResponse)
def create_template_day(
    template_id: int,
    day: schemas.TrackerProgramDayCreate,
    habit_ids: List[int] = Query(...),
    current_user: models.User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Создать день в шаблоне"""
    template = db.query(models.TrackerProgramTemplate).filter(
        models.TrackerProgramTemplate.id == template_id
    ).first()
    
    if not template:
        raise HTTPException(status_code=404, detail="Template not found")
    
    # Проверяем, не существует ли уже день с таким номером
    existing = db.query(models.TrackerProgramDay).filter(
        models.TrackerProgramDay.program_template_id == template_id,
        models.TrackerProgramDay.day_number == day.day_number
    ).first()
    
    if existing:
        raise HTTPException(status_code=400, detail="Day with this number already exists")
    
    db_day = models.TrackerProgramDay(
        program_template_id=template_id,
        day_number=day.day_number,
        focus_text=day.focus_text,
        focus_text_ru=day.focus_text_ru,
        focus_text_ky=day.focus_text_ky
    )
    db.add(db_day)
    db.commit()
    db.refresh(db_day)
    
    # Добавляем привычки к дню
    for idx, habit_id in enumerate(habit_ids):
        habit = db.query(models.TrackerHabit).filter(models.TrackerHabit.id == habit_id).first()
        if habit:
            day_habit = models.TrackerProgramDayHabit(
                program_day_id=db_day.id,
                habit_id=habit_id,
                sort_order=idx
            )
            db.add(day_habit)
    
    db.commit()
    db.refresh(db_day)
    return db_day

@router.put("/days/{day_id}", response_model=schemas.TrackerProgramDayResponse)
def update_template_day(
    day_id: int,
    day_update: dict,
    habit_ids: Optional[List[int]] = None,
    current_user: models.User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Обновить день шаблона"""
    db_day = db.query(models.TrackerProgramDay).filter(
        models.TrackerProgramDay.id == day_id
    ).first()
    
    if not db_day:
        raise HTTPException(status_code=404, detail="Day not found")
    
    # Обновляем поля дня
    for field, value in day_update.items():
        if hasattr(db_day, field) and field != "habit_ids":
            setattr(db_day, field, value)
    
    # Обновляем привычки, если переданы
    if habit_ids is not None:
        # Удаляем старые связи
        db.query(models.TrackerProgramDayHabit).filter(
            models.TrackerProgramDayHabit.program_day_id == day_id
        ).delete()
        
        # Добавляем новые
        for idx, habit_id in enumerate(habit_ids):
            day_habit = models.TrackerProgramDayHabit(
                program_day_id=day_id,
                habit_id=habit_id,
                sort_order=idx
            )
            db.add(day_habit)
    
    db.commit()
    db.refresh(db_day)
    return db_day

@router.delete("/days/{day_id}")
def delete_template_day(
    day_id: int,
    current_user: models.User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Удалить день из шаблона"""
    day = db.query(models.TrackerProgramDay).filter(
        models.TrackerProgramDay.id == day_id
    ).first()
    
    if not day:
        raise HTTPException(status_code=404, detail="Day not found")
    
    # Удаляем связи с привычками
    db.query(models.TrackerProgramDayHabit).filter(
        models.TrackerProgramDayHabit.program_day_id == day_id
    ).delete()
    
    db.delete(day)
    db.commit()
    return {"message": "Day deleted"}
