from fastapi import APIRouter, Depends, Query
from typing import List
from sqlalchemy.orm import Session
from models import ChatHistory
from database import get_db

router = APIRouter(prefix="/api/v1/historico", tags=["Historico"])

@router.get("/", response_model=List[dict])
def get_historico(
    email: str = Query(..., description="Email do usuário"),
    app_id: str = Query(..., description="ID do aplicativo"),
    limit: int = Query(9, description="Quantidade de sessões"),
    db: Session = Depends(get_db)
):
    # Subquery para obter as sessões mais recentes
    subquery = (
        db.query(ChatHistory.session)
        .filter(ChatHistory.user_email == email, ChatHistory.app_id == app_id)
        .distinct()
        .order_by(ChatHistory.timestamp.desc())  # usar timestamp aqui, não session
        .limit(limit)
        .subquery()
    )

    # Consulta principal: mensagens dentro dessas sessões
    resultados = db.query(ChatHistory.sender, ChatHistory.message, ChatHistory.session) \
        .filter(ChatHistory.session.in_(subquery)) \
        .filter(ChatHistory.user_email == email, ChatHistory.app_id == app_id) \
        .order_by(ChatHistory.timestamp.asc()) \
        .all()

    return [{"sender": r.sender, "message": r.message, "session": r.session} for r in resultados]
