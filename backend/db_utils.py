from sqlalchemy import create_engine, Table, Column, Integer, String, Text, DateTime, MetaData
from datetime import datetime
from database import *

metadata = MetaData()

chat_history = Table(
    "chat_history",
    metadata,
    Column("id", Integer, primary_key=True),
    Column("user_email", String(255), nullable=False),
    Column("app_id", String(255), nullable=False),
    Column("sender", String(10), nullable=False),  # 'user' ou 'ai'
    Column("message", Text, nullable=False),
    Column("timestamp", DateTime, default=datetime.now),
    Column("session", String(100), nullable=False),
)

def salvar_mensagem_bd(user_email, app_id, sender, message, sessionchat):
    try:
        with SessionLocal() as session:
            insert_stmt = chat_history.insert().values(
                user_email=user_email,
                app_id=app_id,
                sender=sender,
                message=message,
                timestamp=datetime.now(),
                session=sessionchat
            )
            session.execute(insert_stmt)
            session.commit()
    except Exception as e:
        print(f"Erro ao salvar no banco: {e}")

def buscar_historico(email: str, app_id: str, session: str):
    try:
        with SessionLocal() as db_session:
            query = (
                chat_history.select()
                .where(
                    chat_history.c.user_email == email,
                    chat_history.c.app_id == app_id,
                    chat_history.c.session == session 
                )
                .order_by(chat_history.c.id.desc())
                .limit(2)
            )
            result = db_session.execute(query).fetchall()

            return [(row.sender, row.message, row.session) for row in reversed(result)]
    except Exception as e:
        print(f"Erro ao buscar histórico: {e}")
        return []
