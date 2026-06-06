from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.db.database import get_db
import app.models as models
import app.schemas as schemas
from app.core.oauth2 import get_current_user

# إنشاء الموجه الخاص بالسيناريوهات
router = APIRouter(
    prefix="/scenarios",
    tags=["سيناريوهات الهجوم (Scenarios)"]
)

# ==========================================
# 1. مسار إضافة سيناريو جديد (مسار محمي)
# ==========================================
@router.post("/", response_model=schemas.AttackScenarioResponse, status_code=status.HTTP_201_CREATED)
def create_scenario(
    scenario: schemas.AttackScenarioCreate, 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user) # هنا يقف المفتش الأمني
):
    # تجهيز السيناريو للرفع لقاعدة البيانات
    # استخدمنا **scenario.model_dump() لفك ضغط البيانات القادمة من المستخدم تلقائياً
    new_scenario = models.AttackScenario(
        **scenario.model_dump(),
        created_by=current_user.id # الربط السحري: نأخذ رقم المستخدم من التذكرة مباشرة!
    )
    
    db.add(new_scenario)
    db.commit()
    db.refresh(new_scenario)
    
    return new_scenario

# ==========================================
# 2. مسار عرض جميع السيناريوهات (مسار محمي)
# ==========================================
@router.get("/", response_model=List[schemas.AttackScenarioResponse])
def get_all_scenarios(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user) # المفتش الأمني أيضاً
):
    # جلب جميع السيناريوهات من قاعدة البيانات
    scenarios = db.query(models.AttackScenario).all()
    return scenarios