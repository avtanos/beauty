"""
Скрипт для инициализации базы данных с тестовыми данными
"""
from app.database import SessionLocal, engine, Base
from app.models import User, Service, Booking, Review, UserRole, ServiceCategory, BookingStatus
from app.auth import get_password_hash
from datetime import datetime, timedelta, timezone

# Создаем таблицы
Base.metadata.create_all(bind=engine)

db = SessionLocal()

def init_data():
    # Очистка существующих данных
    db.query(Review).delete()
    db.query(Booking).delete()
    db.query(Service).delete()
    db.query(User).delete()
    db.commit()

    # Создание тестовых пользователей
    # Клиенты
    client1 = User(
        email="client1@example.com",
        phone="+996555111111",
        full_name="Айгуль Абдыкадырова",
        hashed_password=get_password_hash("password123"),
        role=UserRole.CLIENT,
        is_active=True
    )
    
    client2 = User(
        email="client2@example.com",
        phone="+996555222222",
        full_name="Нурбек Токтошев",
        hashed_password=get_password_hash("password123"),
        role=UserRole.CLIENT,
        is_active=True
    )
    
    # Администратор
    admin = User(
        email="admin@example.com",
        phone="+996555000000",
        full_name="Администратор Системы",
        hashed_password=get_password_hash("admin123"),
        role=UserRole.ADMIN,
        is_active=True
    )

    # Мастера
    professional1 = User(
        email="master1@example.com",
        phone="+996555333333",
        full_name="Айнура Кыдырбекова",
        hashed_password=get_password_hash("password123"),
        role=UserRole.PROFESSIONAL,
        rating=4.9,
        total_reviews=25,
        bio="Опытный мастер по маникюру и педикюру с 5-летним стажем. Специализируюсь на классическом и дизайнерском маникюре.",
        experience_years=5,
        is_active=True
    )

    professional2 = User(
        email="master2@example.com",
        phone="+996555444444",
        full_name="Эрлан Мамытов",
        hashed_password=get_password_hash("password123"),
        role=UserRole.PROFESSIONAL,
        rating=4.8,
        total_reviews=18,
        bio="Профессиональный массажист. Предлагаю различные виды массажа: классический, расслабляющий, лечебный.",
        experience_years=7,
        is_active=True
    )

    professional3 = User(
        email="master3@example.com",
        phone="+996555555555",
        full_name="Жылдыз Бекова",
        hashed_password=get_password_hash("password123"),
        role=UserRole.PROFESSIONAL,
        rating=5.0,
        total_reviews=32,
        bio="Визажист и стилист. Создаю образы для особых случаев: свадьбы, фотосессии, вечеринки.",
        experience_years=6,
        is_active=True
    )

    professional4 = User(
        email="master4@example.com",
        phone="+996555666666",
        full_name="Азамат Садыков",
        hashed_password=get_password_hash("password123"),
        role=UserRole.PROFESSIONAL,
        rating=4.9,
        total_reviews=20,
        bio="Парикмахер-стилист. Мужские и женские стрижки, укладки, окрашивание.",
        experience_years=4,
        is_active=True
    )

    db.add_all([client1, client2, admin, professional1, professional2, professional3, professional4])
    db.commit()

    # Создание услуг
    services = [
        Service(
            name="Manicure",
            name_ru="Маникюр",
            name_ky="Маникюр",
            description="Classic manicure with nail shaping and polish",
            description_ru="Классический маникюр с приданием формы ногтям и покрытием лаком",
            description_ky="Классикалык маникюр",
            category=ServiceCategory.NAIL_CARE,
            price=800,
            duration_minutes=60,
            professional_id=professional1.id
        ),
        Service(
            name="Pedicure",
            name_ru="Педикюр",
            name_ky="Педикюр",
            description="Classic pedicure with foot care",
            description_ru="Классический педикюр с уходом за стопами",
            description_ky="Классикалык педикюр",
            category=ServiceCategory.NAIL_CARE,
            price=1000,
            duration_minutes=90,
            professional_id=professional1.id
        ),
        Service(
            name="Relaxing Massage",
            name_ru="Расслабляющий массаж",
            name_ky="Эс алуу массажы",
            description="Full body relaxing massage",
            description_ru="Расслабляющий массаж всего тела",
            description_ky="Бүт денеге эс алуу массажы",
            category=ServiceCategory.MASSAGE,
            price=2000,
            duration_minutes=60,
            professional_id=professional2.id
        ),
        Service(
            name="Therapeutic Massage",
            name_ru="Лечебный массаж",
            name_ky="Дарылоо массажы",
            description="Therapeutic massage for back and neck",
            description_ru="Лечебный массаж спины и шеи",
            description_ky="Арка жана моюнга дарылоо массажы",
            category=ServiceCategory.MASSAGE,
            price=2500,
            duration_minutes=90,
            professional_id=professional2.id
        ),
        Service(
            name="Evening Makeup",
            name_ru="Вечерний макияж",
            name_ky="Кечки макияж",
            description="Professional evening makeup for special occasions",
            description_ru="Профессиональный вечерний макияж для особых случаев",
            description_ky="Атайын окуялар үчүн кечки макияж",
            category=ServiceCategory.BEAUTY,
            price=3000,
            duration_minutes=90,
            professional_id=professional3.id
        ),
        Service(
            name="Wedding Makeup",
            name_ru="Свадебный макияж",
            name_ky="Үйлөнүү макияжы",
            description="Bridal makeup with trial session",
            description_ru="Свадебный макияж с пробной сессией",
            description_ky="Үйлөнүү макияжы сыналуу сессия менен",
            category=ServiceCategory.BEAUTY,
            price=5000,
            duration_minutes=120,
            professional_id=professional3.id
        ),
        Service(
            name="Men's Haircut",
            name_ru="Мужская стрижка",
            name_ky="Эркек чач кесуу",
            description="Professional men's haircut and styling",
            description_ru="Профессиональная мужская стрижка и укладка",
            description_ky="Эркек чач кесуу жана стиль",
            category=ServiceCategory.HAIRCUT,
            price=600,
            duration_minutes=30,
            professional_id=professional4.id
        ),
        Service(
            name="Women's Haircut",
            name_ru="Женская стрижка",
            name_ky="Аял чач кесуу",
            description="Women's haircut with styling",
            description_ru="Женская стрижка с укладкой",
            description_ky="Аял чач кесуу жана стиль",
            category=ServiceCategory.HAIRCUT,
            price=1200,
            duration_minutes=60,
            professional_id=professional4.id
        ),
        Service(
            name="Facial Treatment",
            name_ru="Чистка лица",
            name_ky="Бет тазалоо",
            description="Deep facial cleansing and care",
            description_ru="Глубокая чистка лица и уход",
            description_ky="Терең бет тазалоо жана багуу",
            category=ServiceCategory.BEAUTY,
            price=1500,
            duration_minutes=60,
            professional_id=professional3.id
        ),
        Service(
            name="Spa Treatment",
            name_ru="Спа-процедура",
            name_ky="Спа процедурасы",
            description="Full body spa treatment",
            description_ru="Полная спа-процедура для тела",
            description_ky="Бүт денеге спа процедурасы",
            category=ServiceCategory.SPA,
            price=3500,
            duration_minutes=120,
            professional_id=professional2.id
        ),
    ]

    db.add_all(services)
    db.commit()
    
    # Получаем услуги после коммита для создания бронирований
    service1 = db.query(Service).filter(Service.name == "Manicure").first()
    service2 = db.query(Service).filter(Service.name == "Pedicure").first()
    service3 = db.query(Service).filter(Service.name == "Relaxing Massage").first()
    service4 = db.query(Service).filter(Service.name == "Evening Makeup").first()
    service5 = db.query(Service).filter(Service.name == "Men's Haircut").first()
    service6 = db.query(Service).filter(Service.name == "Facial Treatment").first()

    # Создание бронирований
    
    booking1 = Booking(
        client_id=client1.id,
        professional_id=professional1.id,
        service_id=service1.id,
        booking_date=datetime.now(timezone.utc) + timedelta(days=2),
        address="Бишкек, ул. Чуй, д. 123",
        address_details="Квартира 45, 3 этаж",
        phone="+996555111111",
        status=BookingStatus.CONFIRMED,
        total_price=800,
        notes="Пожалуйста, принесите свой лак",
        created_at=datetime.now(timezone.utc),
        updated_at=datetime.now(timezone.utc)
    )
    
    booking2 = Booking(
        client_id=client1.id,
        professional_id=professional2.id,
        service_id=service3.id,
        booking_date=datetime.now(timezone.utc) + timedelta(days=5),
        address="Бишкек, ул. Ленина, д. 45",
        address_details="Дом, вход со двора",
        phone="+996555111111",
        status=BookingStatus.PENDING,
        total_price=2000,
        notes=None,
        created_at=datetime.now(timezone.utc),
        updated_at=datetime.now(timezone.utc)
    )
    
    booking3 = Booking(
        client_id=client1.id,
        professional_id=professional3.id,
        service_id=service4.id,
        booking_date=datetime.now(timezone.utc) - timedelta(days=2),
        address="Бишкек, ул. Советская, д. 78",
        address_details="Квартира 12",
        phone="+996555111111",
        status=BookingStatus.COMPLETED,
        total_price=3000,
        notes="Для свадьбы",
        created_at=datetime.now(timezone.utc) - timedelta(days=10),
        updated_at=datetime.now(timezone.utc) - timedelta(days=2)
    )
    
    db.add_all([booking1, booking2, booking3])
    db.commit()
    
    # Создание отзывов
    review1 = Review(
        booking_id=booking3.id,
        client_id=client1.id,
        professional_id=professional3.id,
        rating=5,
        comment="Отличный мастер! Макияж получился просто потрясающим. Очень рекомендую!",
        created_at=datetime.now(timezone.utc) - timedelta(days=1)
    )
    
    review2 = Review(
        booking_id=booking1.id,
        client_id=client2.id,
        professional_id=professional1.id,
        rating=5,
        comment="Очень довольна результатом! Маникюр выполнен аккуратно и качественно.",
        created_at=datetime.now(timezone.utc) - timedelta(days=3)
    )
    
    review3 = Review(
        booking_id=booking2.id,
        client_id=client2.id,
        professional_id=professional2.id,
        rating=4,
        comment="Хороший массаж, но можно было бы сильнее.",
        created_at=datetime.now(timezone.utc) - timedelta(days=5)
    )
    
    db.add_all([review1, review2, review3])
    db.commit()

    print("Тестовые данные успешно созданы!")
    print("\nТестовые аккаунты:")
    print("Клиенты:")
    print("  - client1@example.com / password123")
    print("  - client2@example.com / password123")
    print("\nМастера:")
    print("  - master1@example.com / password123")
    print("  - master2@example.com / password123")
    print("  - master3@example.com / password123")
    print("  - master4@example.com / password123")
    print("\nАдминистратор:")
    print("  - admin@example.com / admin123")
    print("\nСоздано:")
    print(f"  - {len(services)} услуг")
    print("  - 3 бронирования")
    print("  - 3 отзыва")

if __name__ == "__main__":
    init_data()
    db.close()

