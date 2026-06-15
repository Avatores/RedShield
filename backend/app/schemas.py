from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime

# ==========================================
# 1.(Role Schemas)
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
# 2. (User Schemas)
# ==========================================
class UserBase(BaseModel):
    full_name: str
    email: EmailStr

# يستخدم عند تسجيل مستخدم جديد (نطلب كلمة المرور)
class UserCreate(UserBase):
    password: str = Field(..., min_length=6, description="كلمة المرور يجب ألا تقل عن 6 خانات")
    role_id: Optional[int] = None


class UserResponse(UserBase):
    id: int
    role_id: Optional[int]
    created_at: datetime

    class Config:
        from_attributes = True


# ==========================================
# 3.(Attack Scenario Schemas)
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
# 4.(Test Run Schemas)
# ==========================================
class TestRunBase(BaseModel):
    scenario_id: int
    model_id: int
    run_mode: str  

class TestRunCreate(TestRunBase):
    pass

class TestRunResponse(TestRunBase):
    id: int
    status: str  
    executed_by: Optional[int]
    created_at: datetime

    class Config:
        from_attributes = True

# ==========================================
# 5.(Token Schemas)
# ==========================================
class Token(BaseModel):
    access_token: str
    token_type: str

# ==========================================
# 6.(AI Models Schemas)
# ==========================================
class AIModelBase(BaseModel):
    name: str
    version: str
    provider: str
    description: str | None = None

class AIModelCreate(AIModelBase):
    pass

class AIModelResponse(AIModelBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True


# ==========================================
# 7.(Evaluations Schemas)
# ==========================================
class EvaluationBase(BaseModel):
    test_run_id: int
    label: str
    risk_score: int
    notes: str | None = None

class EvaluationCreate(EvaluationBase):
    pass

class EvaluationResponse(EvaluationBase):
    id: int
    evaluated_by: int | None  
    created_at: datetime

    class Config:
        from_attributes = True