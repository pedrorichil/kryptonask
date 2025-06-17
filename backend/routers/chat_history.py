from fastapi import APIRouter, Depends, Request, HTTPException, Query
from typing import List
from sqlalchemy.orm import Session
from sqlalchemy import select
from datetime import datetime
from models import ChatMessageCreate, ChatMessageResponse
from database import get_db, log_action
from database_models import chat_history  

router = APIRouter(prefix="/api/v1/chat", tags=["Chat History"])

@router.post("/", response_model=dict)
def salvar_mensagem(
    chat_message: ChatMessageCreate,
    request: Request,
    db: Session = Depends(get_db)
):
    ip = request.client.host
    try:
        insert_stmt = chat_history.insert().values(
            user_email=chat_message.user_email,
            app_id=chat_message.app_id,
            sender=chat_message.sender,
            message=chat_message.message,
            timestamp=datetime.now(),
            session=chat_message.session
        )
        result = db.execute(insert_stmt)
        db.commit()

        log_action(db, ip, "INSERT", chat_message.app_id)
        return {"message": "Mensagem salva com sucesso"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Erro ao salvar mensagem: {e}")

@router.get("/history", response_model=List[ChatMessageResponse])
def buscar_historico(
    email: str = Query(...),
    app_id: str = Query(...),
    session_id: str = Query(...),
    db: Session = Depends(get_db)
):
    try:
        query = (
            select(chat_history)
            .where(
                chat_history.c.user_email == email,
                chat_history.c.app_id == app_id,
                chat_history.c.session == session_id
            )
            .order_by(chat_history.c.id.desc())
            .limit(2)
        )
        result = db.execute(query).fetchall()

        return [
            ChatMessageResponse(
                id=row.id,
                user_email=row.user_email,
                app_id=row.app_id,
                sender=row.sender,
                message=row.message,
                timestamp=row.timestamp,
                session=row.session
            ) for row in reversed(result)
        ]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao buscar histórico: {e}")
