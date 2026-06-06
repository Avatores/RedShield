from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime

# ==========================================
# 1. مخططات الأدوار (Role Schemas)
# ==========================================
class RoleBase(BaseModel):
    name: str

class RoleCreate(RoleBase):
    pass

class RoleResponse(RoleBase):
    id: int

    class Config:
        from_attributes = True


# ==========================================
# 2. مخططات المستخدمين (User Schemas)
# ==========================================
class UserBase(BaseModel):
    full_name: str
    email: EmailStr

# يستخدم عند تسجيل مستخدم جديد (نطلب كلمة المرور)
class UserCreate(UserBase):
    password: str = Field(..., min_length=6, description="كلمة المرور يجب ألا تقل عن 6 خانات")
    role_id: Optional[int] = None

# يستخدم لإرسال بيانات المستخدم للـ Frontend (بدون الـ Password لأمان البيانات)
class UserResponse(UserBase):
    id: int
    role_id: Optional[int]
    created_at: datetime

    class Config:
        from_attributes = True


# ==========================================
# 3. مخططات سيناريوهات الهجوم (Attack Scenario Schemas)
# ==========================================
class AttackScenarioBase(BaseModel):
    title: str
    category: str
    description: Optional[str] = None
    severity: str
    prompt_text: str

class AttackScenarioCreate(AttackScenarioBase):
    pass

class AttackScenarioResponse(AttackScenarioBase):
    id: int
    created_by: Optional[int]
    created_at: datetime

    class Config:
        from_attributes = True


# ==========================================
# 4. مخططات عمليات الفحص (Test Run Schemas)
# ==========================================
class TestRunBase(BaseModel):
    scenario_id: int
    model_id: int
    run_mode: str  # مثل: automated أو manual

class TestRunCreate(TestRunBase):
    pass

class TestRunResponse(TestRunBase):
    id: int
    status: str  # pending, running, completed, failed
    executed_by: Optional[int]
    created_at: datetime

    class Config:
        from_attributes = True

# ==========================================
# 5. مخططات تسجيل الدخول (Token Schemas)
# ==========================================
class Token(BaseModel):
    access_token: str
    token_type: str