from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from app.db.database import engine, Base, get_db
import app.models

# 1. استيراد جميع ملفات المسارات (الروترز)
from app.routers import users, auth, scenarios, ai_models, evaluations, test_runs

Base.metadata.create_all(bind=engine)

# 2. إنشاء نسخة التطبيق (هنا يولد المتغير app الحقيقي)
app = FastAPI(
    title="RedShield API",
    description="الواجهة الخلفية لمنصة RedShield لتقييم أمان نماذج الذكاء الاصطناعي",
    version="1.0.0"
)

# 3. إعدادات CORS للسماح باتصال الواجهة الأمامية
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"], 
    allow_credentials=True,
    allow_methods=["*"], 
    allow_headers=["*"], 
)

# 4. ربط المسارات بالتطبيق (يجب أن تكون دائماً هنا في الأسفل)
app.include_router(auth.router)
app.include_router(users.router)
app.include_router(scenarios.router)
app.include_router(ai_models.router) # تم وضعه في مكانه الصحيح
app.include_router(evaluations.router)
app.include_router(test_runs.router)

# 5. المسارات الأساسية
@app.get("/")
def root():
    return {"message": "Welcome to RedShield API", "status": "Backend is running successfully!"}

@app.get("/health")
def health_check(db: Session = Depends(get_db)):
    return {"status": "healthy", "database_connected": True}