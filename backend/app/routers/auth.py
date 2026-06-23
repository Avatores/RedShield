from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security.oauth2 import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.models import User
from app.core.security import verify_password, create_access_token

router = APIRouter(tags=["(Authentication)"])

@router.post("/login")
def login(user_credentials: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    
    user = db.query(User).filter(User.email == user_credentials.username).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="بيانات الدخول غير صحيحة" 
        )
    
    if not verify_password(user_credentials.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="بيانات الدخول غير صحيحة"
        )

    access_token = create_access_token(data={"user_id": user.id})
    
    return {
        "access_token": access_token, 
        "token_type": "bearer",
        "role_id": user.role_id 
    }