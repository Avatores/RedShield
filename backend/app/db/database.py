from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from app.core.config import settings

# 1. إنشاء محرك الاتصال بـ SQLite
# ملاحظة: check_same_thread ضرورية فقط مع SQLite في FastAPI لتجنب أخطاء الاتصال المتعدد
engine = create_engine(
    settings.DATABASE_URL, connect_args={"check_same_thread": False}
)

# 2. مصنع الجلسات للتعامل مع العمليات (إدخال، تعديل، قراءة)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# 3. الكلاس الأساسي الذي سترث منه كل الجداول (Models) لاحقاً
Base = declarative_base()

# 4. دالة مساعدة لفتح وإغلاق الجلسة مع كل طلب API تلقائياً
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()