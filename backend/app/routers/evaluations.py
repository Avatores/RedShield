from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.db.database import get_db
import app.models as db_models
import app.schemas as schemas
from app.core.oauth2 import get_current_user

router = APIRouter(
    prefix="/evaluations",
    tags=["Evaluations"]
)

# مسار لإضافة تقييم جديد
@router.post("/", response_model=schemas.EvaluationResponse, status_code=status.HTTP_201_CREATED)
def create_evaluation(
    evaluation: schemas.EvaluationCreate, 
    db: Session = Depends(get_db),
    current_user: db_models.User = Depends(get_current_user)
):
    # (ملاحظة: يمكنك لاحقاً إضافة كود للتحقق من وجود test_run_id في قاعدة البيانات)
    
    # إنشاء التقييم وربطه بالمستخدم الحالي
    new_eval = db_models.Evaluation(
        **evaluation.model_dump(),
        evaluated_by=current_user.id  # استخدام evaluated_by كما هو في جدولك
    )
    
    db.add(new_eval)
    db.commit()
    db.refresh(new_eval)
    return new_eval

# مسار لعرض التقييمات التي قام بها المستخدم الحالي
@router.get("/my-evaluations", response_model=List[schemas.EvaluationResponse])
def get_my_evaluations(
    db: Session = Depends(get_db),
    current_user: db_models.User = Depends(get_current_user)
):
    evaluations = db.query(db_models.Evaluation).filter(db_models.Evaluation.evaluated_by == current_user.id).all()
    return evaluations