from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security.oauth2 import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.models import User
from app.core.security import verify_password, create_access_token
from app.schemas import Token

router = APIRouter(tags=["المصادقة (Authentication)"])

@router.post("/login", response_model=Token)
def login(user_credentials: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    
    # 1. البحث عن المستخدم في قاعدة البيانات عبر الإيميل
    # ملاحظة: OAuth2PasswordRequestForm يستخدم دائماً كلمة 'username' حتى لو كنا نقصد الإيميل
    user = db.query(User).filter(User.email == user_credentials.username).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="بيانات الدخول غير صحيحة" # لا نخبره أبداً أن الإيميل هو الخطأ لأسباب أمنية
        )
    
    # 2. التحقق من صحة كلمة المرور (نطابق المكتوبة مع المشفرة في قاعدة البيانات)
    if not verify_password(user_credentials.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="بيانات الدخول غير صحيحة"
        )
    
    # 3. إذا كان الإيميل وكلمة المرور صحيحة، نقوم بإنشاء تذكرة المرور (Token)
    # سنضع داخل التذكرة الـ id الخاص بالمستخدم كمعلومة مخفية
    access_token = create_access_token(data={"user_id": user.id})
    
    # 4. إرسال التذكرة للمستخدم
    return {"access_token": access_token, "token_type": "bearer"}