from sqlalchemy import Table, Column, Integer, String, Text, DateTime, MetaData
from datetime import datetime
from database import engine

metadata = MetaData()

chat_history = Table(
    "chat_history",
    metadata,
    Column("id", Integer, primary_key=True),
    Column("user_email", String(255), nullable=False),
    Column("app_id", Integer, nullable=False),
    Column("sender", String(10), nullable=False),
    Column("message", Text, nullable=False),
    Column("timestamp", DateTime, default=datetime.now),
    Column("session", String(100), nullable=False),
)

metadata.create_all(bind=engine)
