from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.models import User
from app.schemas import UserCreate, UserResponse
from app.core.security import get_password_hash

# إنشاء كائن الـ Router الخاص بالمستخدمين
router = APIRouter(
    prefix="/users",
    tags=["(Users)"]
)

# مسار إنشاء مستخدم جديد (Sign Up)
@router.post("/", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def create_user(user: UserCreate, db: Session = Depends(get_db)):
    
    # 1. التحقق من أن البريد الإلكتروني غير مسجل مسبقاً
    db_user = db.query(User).filter(User.email == user.email).first()
    if db_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="البريد الإلكتروني مسجل بالفعل في المنصة"
        )
    
    # 2. تشفير كلمة المرور قبل الحفظ
    hashed_password = get_password_hash(user.password)
    
    # 3. تجهيز بيانات المستخدم بناءً على الـ Model
    new_user = User(
        full_name=user.full_name,
        email=user.email,
        password_hash=hashed_password,
        role_id=user.role_id
    )
    
    # 4. الحفظ في قاعدة البيانات
    db.add(new_user)
    db.commit()
    db.refresh(new_user) # لتحديث الكائن والحصول على الـ ID التلقائي من قاعدة البيانات
    
    return new_user