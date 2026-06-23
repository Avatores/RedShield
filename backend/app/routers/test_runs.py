from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.db.database import get_db
import app.models as db_models
import app.schemas as schemas
from app.core.oauth2 import get_current_user

router = APIRouter(
    prefix="/test-runs",
    tags=["Test Runs"]
)

@router.post("/", response_model=schemas.TestRunResponse, status_code=status.HTTP_201_CREATED)
def create_test_run(
    test_run: schemas.TestRunCreate, 
    db: Session = Depends(get_db),
    current_user: db_models.User = Depends(get_current_user)
):
    if test_run.scenario_id is not None:
        scenario = db.query(db_models.AttackScenario).filter(db_models.AttackScenario.id == test_run.scenario_id).first()
        if not scenario:
            raise HTTPException(status_code=404, detail="Attack Scenario not found")

    model = db.query(db_models.AIModel).filter(db_models.AIModel.id == test_run.model_id).first()
    if not model:
        raise HTTPException(status_code=404, detail="AI Model not found")

    new_run = db_models.TestRun(
        **test_run.model_dump(),
        status="pending",  
        executed_by=current_user.id
    )
    
    db.add(new_run)
    db.commit()
    db.refresh(new_run)
    return new_run

@router.get("/", response_model=List[schemas.TestRunResponse])
def get_all_test_runs(
    db: Session = Depends(get_db),
    current_user: db_models.User = Depends(get_current_user)
):
    runs = db.query(db_models.TestRun).all()
    return runs

@router.delete("/all")
def delete_all_test_runs(db: Session = Depends(get_db)):
    db.query(db_models.Evaluation).delete(synchronize_session=False)
    
    db.query(db_models.TestRun).delete(synchronize_session=False)
    db.commit()
    return {"message": "All test runs deleted successfully"}

@router.delete("/{id}")
def delete_single_test_run(id: int, db: Session = Depends(get_db)):
    test_run_query = db.query(db_models.TestRun).filter(db_models.TestRun.id == id)
    if not test_run_query.first():
        raise HTTPException(status_code=404, detail="Test Run not found")
        
    db.query(db_models.Evaluation).filter(db_models.Evaluation.test_run_id == id).delete(synchronize_session=False)
    
    # 2. حذف السجل بأمان
    test_run_query.delete(synchronize_session=False)
    db.commit()
    return {"message": "Test run deleted successfully"}