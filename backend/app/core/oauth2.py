from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
import jwt
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.models import User
from app.core.security import SECRET_KEY, ALGORITHM

# هذا السطر يخبر المفتش الأمني: "إذا جاءك شخص بدون تذكرة، وجهه لمسار /login ليحصل على واحدة"
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/login")

# هذه هي دالة "المفتش الأمني" التي ستقف على أبواب المسارات المحمية
def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    
    # رسالة الخطأ الجاهزة في حال كانت التذكرة مزورة أو منتهية الصلاحية
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="تعذر التحقق من هويتك، يرجى تسجيل الدخول مجدداً",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        # 1. إدخال التذكرة في ماكينة فك التشفير باستخدام الختم السري
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        
        # 2. استخراج رقم المستخدم (user_id) من داخل التذكرة
        user_id: str = payload.get("user_id")
        if user_id is None:
            raise credentials_exception
            
    except jwt.PyJWTError: # إذا فشل فك التشفير (تذكرة مزورة)
        raise credentials_exception
    
    # 3. التأكد من أن هذا المستخدم لا يزال موجوداً في قاعدة البيانات (لم يتم حذفه مثلاً)
    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise credentials_exception
    
    # 4. التذكرة سليمة 100%! نسمح له بالمرور ونعطيه بياناته
    return user