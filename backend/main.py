from fastapi import FastAPI, Depends
from sqlalchemy.orm import Session
from app.db.database import engine, Base, get_db
import app.models  # استيراد النماذج ليتعرف عليها المحرك ويقوم بإنشائها
from app.routers import users, auth, scenarios # استيراد ملف مسارات المستخدمين


# أمر سحري: يقوم بإنشاء جداول قاعدة البيانات تلقائياً في ملف SQLite إذا لم تكن موجودة
Base.metadata.create_all(bind=engine)

# إنشاء كائن التطبيق مع إضافة تفاصيل المشروع
app = FastAPI(
    title="RedShield API",
    description="الواجهة الخلفية لمنصة RedShield لتقييم أمان نماذج الذكاء الاصطناعي",
    version="1.0.0"
)

app.include_router(users.router)
app.include_router(auth.router)
app.include_router(scenarios.router)

# المسار الرئيسي (Root Endpoint)
@app.get("/")
def root():
    return {
        "message": "Welcome to RedShield API",
        "status": "Backend is running successfully!"
    }

# مسار لفحص حالة السيرفر والاتصال بقاعدة البيانات (Health Check)
@app.get("/health")
def health_check(db: Session = Depends(get_db)):
    return {
        "status": "healthy",
        "database_connected": True
    }