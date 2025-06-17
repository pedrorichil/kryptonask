from fastapi import APIRouter, Depends, Query, Depends, HTTPException
from typing import List
from sqlalchemy.orm import Session
from models import *
from database import get_db
from sqlalchemy.orm import Session
from models import *

router = APIRouter(prefix="/api/v1/logs", tags=["Logs"])


## AUXILIARES ##########################################################################
@router.get("/", response_model=List[LogResponse])
def get_logs(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    logs = db.query(Log).offset(skip).limit(limit).all()
    return logs

@router.post("/", response_model=LogResponse)
def create_log(log: LogCreate, db: Session = Depends(get_db)):
    try:
        db_log = Log(ip=log.ip, action=log.action, app_id=log.app_id)
        db.add(db_log)
        db.commit()
        db.refresh(db_log)
        return db_log
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail="Erro ao registrar o log.")
