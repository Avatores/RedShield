from passlib.context import CryptContext
from datetime import datetime, timedelta
import jwt  # المكتبة الجديدة التي ثبتناها

# إعداد مكتبة passlib لاستخدام خوارزمية bcrypt
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# ==========================================
# إعدادات الـ JWT Token
# ==========================================
# هذا هو المفتاح السري الذي يوقع به السيرفر التذاكر (لا تشاركه مع أحد!)
SECRET_KEY = "RedShield_Super_Secret_Key_For_Tokens" 
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24  # التذكرة صالحة لمدة يوم كامل (24 ساعة)

# دالة لتشفير كلمة المرور
def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

# دالة للتحقق من صحة كلمة المرور
def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

# دالة إنشاء تذكرة المرور (JWT Token)
def create_access_token(data: dict):
    to_encode = data.copy()
    
    # تحديد وقت انتهاء صلاحية التذكرة
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    
    # إنشاء التذكرة وتشفيرها بالمفتاح السري
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt