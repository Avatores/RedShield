from passlib.context import CryptContext

# إعداد مكتبة passlib لاستخدام خوارزمية bcrypt القوية للتشفير
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# دالة لتشفيير كلمة المرور (تحويلها إلى Hash)
def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

# دالة للتحقق هل كلمة المرور المدخلة تطابق المشفرة (سنستخدمها لاحقاً في تسجيل الدخول)
def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)