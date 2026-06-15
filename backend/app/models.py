from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, Text, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from app.db.database import Base

# 1. Roles model
class Role(Base):
    __tablename__ = "roles"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(50), unique=True, nullable=False)

# 2. Users model
class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String(100), nullable=False)
    email = Column(String(150), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    role_id = Column(Integer, ForeignKey("roles.id", ondelete="SET NULL"))
    created_at = Column(DateTime, default=datetime.utcnow)

# 3. Ai Models model
class AIModel(Base):
    __tablename__ = "models"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    version = Column(String, index=True)
    provider = Column(String(100))
    type = Column(String(50))
    is_active = Column(Boolean, default=True)

    description = Column(String, nullable=True) 
    created_at = Column(DateTime, default=datetime.utcnow)

# 4. Attack Scenarios model
class AttackScenario(Base):
    __tablename__ = "attack_scenarios"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    category = Column(String(100), nullable=False)
    description = Column(Text)
    severity = Column(String(50), nullable=False)
    prompt_text = Column(Text, nullable=False)
    created_by = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"))
    created_at = Column(DateTime, default=datetime.utcnow)

# 5. Test run model
class TestRun(Base):
    __tablename__ = "test_runs"
    
    id = Column(Integer, primary_key=True, index=True)
    scenario_id = Column(Integer, ForeignKey("attack_scenarios.id", ondelete="CASCADE"))
    model_id = Column(Integer, ForeignKey("models.id", ondelete="CASCADE"))
    run_mode = Column(String(50))
    status = Column(String(50))
    executed_by = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"))
    created_at = Column(DateTime, default=datetime.utcnow)

# 6. Responses model
class Response(Base):
    __tablename__ = "responses"
    
    id = Column(Integer, primary_key=True, index=True)
    test_run_id = Column(Integer, ForeignKey("test_runs.id", ondelete="CASCADE"))
    model_output = Column(Text)
    raw_output = Column(Text)
    latency_ms = Column(Integer)

# 7. Evaluations model
class Evaluation(Base):
    __tablename__ = "evaluations"
    
    id = Column(Integer, primary_key=True, index=True)
    test_run_id = Column(Integer, ForeignKey("test_runs.id", ondelete="CASCADE"))
    label = Column(String(50))
    risk_score = Column(Integer)
    notes = Column(Text)
    evaluated_by = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"))
    created_at = Column(DateTime, default=datetime.utcnow)