from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.models import User
from app.schemas import UserCreate, UserResponse
from app.core.security import get_password_hash
from app.core.oauth2 import get_current_user

router = APIRouter(
    prefix="/users",
    tags=["(Users)"]
)

@router.post("/", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def create_user(user: UserCreate, db: Session = Depends(get_db)):
    
    db_user = db.query(User).filter(User.email == user.email).first()
    if db_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="البريد الإلكتروني مسجل بالفعل في المنصة"
        )
    
    hashed_password = get_password_hash(user.password)
    
    new_user = User(
        full_name=user.full_name,
        email=user.email,
        password_hash=hashed_password,
        role_id=user.role_id
    )
    
    db.add(new_user)
    db.commit()
    db.refresh(new_user) 
    
    return new_user

@router.get("/me", response_model=UserResponse)
def get_user_profile(current_user: User = Depends(get_current_user)):
    return current_user