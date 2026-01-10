from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
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
    template_update: schemas.TrackerProgramTemplateUpdate,
    current_user: models.User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Обновить шаблон программы"""
    db_template = db.query(models.TrackerProgramTemplate).filter(
        models.TrackerProgramTemplate.id == template_id
    ).first()
    
    if not db_template:
        raise HTTPException(status_code=404, detail="Template not found")
    
    update_data = template_update.dict(exclude_unset=True)
    for field, value in update_data.items():
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
    """Активировать шаблон"""
    template = db.query(models.TrackerProgramTemplate).filter(
        models.TrackerProgramTemplate.id == template_id
    ).first()
    
    if not template:
        raise HTTPException(status_code=404, detail="Template not found")
    
    template.is_active = True
    db.commit()
    return {"message": "Template activated"}

@router.post("/templates/{template_id}/deactivate")
def deactivate_template(
    template_id: int,
    current_user: models.User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Деактивировать шаблон"""
    template = db.query(models.TrackerProgramTemplate).filter(
        models.TrackerProgramTemplate.id == template_id
    ).first()
    
    if not template:
        raise HTTPException(status_code=404, detail="Template not found")
    
    template.is_active = False
    db.commit()
    return {"message": "Template deactivated"}

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
    """Получить все привычки с привязанными днями"""
    query = db.query(models.TrackerHabit)
    
    if category:
        query = query.filter(models.TrackerHabit.category == category)
    
    habits = query.all()
    
    # Добавляем информацию о привязанных днях для каждой привычки
    result = []
    for habit in habits:
        habit_dict = schemas.TrackerHabitResponse.model_validate(habit).model_dump()
        
        # Получаем дни, к которым привязана привычка, и определяем программы
        day_habits = db.query(models.TrackerProgramDayHabit).filter(
            models.TrackerProgramDayHabit.habit_id == habit.id
        ).all()
        
        day_ids = [dh.program_day_id for dh in day_habits]
        habit_dict["day_ids"] = day_ids
        
        # Определяем программы, к которым относится привычка (через дни)
        program_ids = set()
        for day_id in day_ids:
            program_day = db.query(models.TrackerProgramDay).filter(
                models.TrackerProgramDay.id == day_id
            ).first()
            if program_day:
                program_ids.add(program_day.program_template_id)
        
        # Получаем информацию о программах
        programs_info = []
        for program_id in program_ids:
            program = db.query(models.TrackerProgramTemplate).filter(
                models.TrackerProgramTemplate.id == program_id
            ).first()
            if program:
                programs_info.append({"id": program.id, "name": program.name})
        
        habit_dict["programs"] = programs_info
        
        result.append(habit_dict)
    
    return result

@router.post("/habits", response_model=schemas.TrackerHabitResponse)
def create_habit(
    habit: schemas.TrackerHabitCreate,
    day_ids: Optional[List[int]] = Query(None),
    current_user: models.User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Создать новую привычку"""
    from sqlalchemy.orm import joinedload
    
    # Создаем привычку без day_ids (они передаются отдельно)
    habit_data = habit.dict()
    # Убираем program_template_id из данных, так как привычка может быть в нескольких программах
    habit_data.pop('program_template_id', None)
    db_habit = models.TrackerHabit(**habit_data)
    db.add(db_habit)
    db.commit()
    db.refresh(db_habit)
    
    # Привязываем привычку к дням программ, если указаны (дни могут быть из разных программ)
    if day_ids:
        for day_id in day_ids:
            # Проверяем, что день существует
            program_day = db.query(models.TrackerProgramDay).filter(
                models.TrackerProgramDay.id == day_id
            ).first()
            
            if program_day:
                # Проверяем, нет ли уже такой связи
                existing = db.query(models.TrackerProgramDayHabit).filter(
                    models.TrackerProgramDayHabit.program_day_id == day_id,
                    models.TrackerProgramDayHabit.habit_id == db_habit.id
                ).first()
                
                if not existing:
                    # Получаем максимальный sort_order для этого дня
                    max_sort_result = db.query(func.max(models.TrackerProgramDayHabit.sort_order)).filter(
                        models.TrackerProgramDayHabit.program_day_id == day_id
                    ).scalar()
                    max_sort = max_sort_result if max_sort_result is not None else 0
                    
                    day_habit = models.TrackerProgramDayHabit(
                        program_day_id=day_id,
                        habit_id=db_habit.id,
                        sort_order=max_sort + 1
                    )
                    db.add(day_habit)
        
        db.commit()
    
    return db_habit

@router.put("/habits/{habit_id}", response_model=schemas.TrackerHabitResponse)
def update_habit(
    habit_id: int,
    habit_update: schemas.TrackerHabitUpdate,
    day_ids: Optional[List[int]] = Query(None),
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
    
    # Убираем program_template_id из обновления, так как привычка может быть в нескольких программах
    update_data.pop('program_template_id', None)
    
    # Обновляем поля привычки
    for field, value in update_data.items():
        setattr(db_habit, field, value)
    
    db.commit()
    
    # Обновляем привязку к дням, если переданы day_ids (даже если это пустой список)
    if day_ids is not None:
        # Удаляем все существующие связи привычки с днями
        db.query(models.TrackerProgramDayHabit).filter(
            models.TrackerProgramDayHabit.habit_id == habit_id
        ).delete()
        
        # Создаем новые связи с указанными днями (дни могут быть из разных программ)
        if day_ids and len(day_ids) > 0:
            for day_id in day_ids:
                # Проверяем, что день существует (может быть из любой программы)
                program_day = db.query(models.TrackerProgramDay).filter(
                    models.TrackerProgramDay.id == day_id
                ).first()
                
                if program_day:
                    # Получаем максимальный sort_order для этого дня
                    max_sort_result = db.query(func.max(models.TrackerProgramDayHabit.sort_order)).filter(
                        models.TrackerProgramDayHabit.program_day_id == day_id
                    ).scalar()
                    max_sort = max_sort_result if max_sort_result is not None else 0
                    
                    day_habit = models.TrackerProgramDayHabit(
                        program_day_id=day_id,
                        habit_id=habit_id,
                        sort_order=max_sort + 1
                    )
                    db.add(day_habit)
        
        db.commit()
    
    db.refresh(db_habit)
    return db_habit

# Управление активностью привычек - более специфичные маршруты должны быть ПЕРЕД общим маршрутом /habits/{habit_id}
@router.post("/habits/{habit_id}/activate")
def activate_habit(
    habit_id: int,
    current_user: models.User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Активировать привычку"""
    habit = db.query(models.TrackerHabit).filter(
        models.TrackerHabit.id == habit_id
    ).first()
    
    if not habit:
        raise HTTPException(status_code=404, detail="Habit not found")
    
    habit.is_active = True
    db.commit()
    db.refresh(habit)
    return {"message": "Habit activated"}

@router.post("/habits/{habit_id}/deactivate")
def deactivate_habit(
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
    db.refresh(habit)
    return {"message": "Habit deactivated"}

@router.delete("/habits/{habit_id}")
def delete_habit(
    habit_id: int,
    current_user: models.User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Деактивировать привычку (для обратной совместимости)"""
    return deactivate_habit(habit_id, current_user, db)

# Управление днями программы
@router.get("/templates/{template_id}/days/simple")
def get_template_days_simple(
    template_id: int,
    current_user: models.User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Получить простой список дней шаблона (только id и номер дня)"""
    days = db.query(models.TrackerProgramDay).filter(
        models.TrackerProgramDay.program_template_id == template_id
    ).order_by(models.TrackerProgramDay.day_number).all()
    
    return [{"id": day.id, "day_number": day.day_number} for day in days]

@router.get("/templates/{template_id}/days", response_model=List[schemas.TrackerProgramDayResponse])
def get_template_days(
    template_id: int,
    current_user: models.User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Получить все дни шаблона с привычками"""
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
    day_update: schemas.TrackerProgramDayCreate,
    habit_ids: Optional[List[int]] = Query(None),
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
    update_data = day_update.dict(exclude_unset=True)
    for field, value in update_data.items():
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
