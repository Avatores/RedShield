from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.db.database import get_db
import app.models as models
import app.schemas as schemas
from app.core.oauth2 import get_current_user

router = APIRouter(
    prefix="/scenarios",
    tags=["(Scenarios)"]
)


@router.post("/", response_model=schemas.AttackScenarioResponse, status_code=status.HTTP_201_CREATED)
def create_scenario(
    scenario: schemas.AttackScenarioCreate, 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):

    new_scenario = models.AttackScenario(
        **scenario.model_dump(),
        created_by=current_user.id 
    )
    
    db.add(new_scenario)
    db.commit()
    db.refresh(new_scenario)
    
    return new_scenario


@router.get("/", response_model=List[schemas.AttackScenarioResponse])
def get_all_scenarios(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user) 
):
    scenarios = db.query(models.AttackScenario).all()
    return scenarios