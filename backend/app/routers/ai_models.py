from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.db.database import get_db
import app.models as db_models
import app.schemas as schemas
from app.core.oauth2 import get_current_user

## Initialize the AI Models router
router = APIRouter(
    prefix="/ai-models",
    tags=["AI Models"]
)

# ==========================================
# 1. Create a new AI Model target (Protected Route)
# ==========================================
@router.post("/", response_model=schemas.AIModelResponse, status_code=status.HTTP_201_CREATED)
def create_ai_model(
    ai_model: schemas.AIModelCreate, 
    db: Session = Depends(get_db),
    current_user: db_models.User = Depends(get_current_user)  # Protected
):
    # Check if a model with the same name already exists
    # تم تغيير db_models.Model إلى db_models.AIModel
    existing_model = db.query(db_models.AIModel).filter(db_models.AIModel.name == ai_model.name).first()
    if existing_model:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Model with this name already exists"
        )

    # Create and save the new AI Model
    # تم تغيير db_models.Model إلى db_models.AIModel
    new_model = db_models.AIModel(**ai_model.model_dump())
    db.add(new_model)
    db.commit()
    db.refresh(new_model)
    
    return new_model

# ==========================================
# 2. Get all AI Models (Protected Route)
# ==========================================
@router.get("/", response_model=List[schemas.AIModelResponse])
def get_all_ai_models(
    db: Session = Depends(get_db),
    current_user: db_models.User = Depends(get_current_user)  # Protected
):
    # تم تغيير db_models.Model إلى db_models.AIModel
    models = db.query(db_models.AIModel).all()
    return models