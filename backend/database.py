from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from typing import Optional
from sqlalchemy.orm import Session
from models import *

DATABASE_URL = "mysql+pymysql://root:Krypton#2025@192.168.22.29:3306/app_power_bi"

engine = create_engine(DATABASE_URL, pool_recycle=28000, pool_pre_ping=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db() -> Session:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def log_action(db: Session, email: str, action: str, app_id: int = None):
    """
    Cria e salva um registro de log no banco de dados.
    """
    # Salva o email no campo 'ip' da tabela
    log_entry = db_models.Log(ip=email, action=action, app_id=app_id)
    db.add(log_entry)
    db.commit()
    db.refresh(log_entry)