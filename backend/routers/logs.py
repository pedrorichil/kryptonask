from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from database import get_db
import models

router = APIRouter(
    prefix="/api/v1/logs",
    tags=["Logs"]
)

@router.get("/", response_model=List[models.LogResponse])
def get_logs(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """Retorna os logs mais recentes."""
    logs = db.query(models.Log).order_by(models.Log.created_at.desc()).offset(skip).limit(limit).all()
    return logs

# Rota POST ajustada para receber o payload completo do frontend
@router.post("/", response_model=models.LogResponse, status_code=201)
def create_log_entry(log_data: models.LogCreate, db: Session = Depends(get_db)):
    """
    Cria um novo registro de log. 
    Espera que o frontend envie um objeto completo, incluindo o campo 'ip' (que usaremos para o e-mail).
    """
    log_entry = models.Log(
        ip=log_data.ip, # O frontend enviará o e-mail neste campo
        action=log_data.action, 
        app_id=log_data.app_id
    )
    db.add(log_entry)
    db.commit()
    db.refresh(log_entry)
    return log_entry