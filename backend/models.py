
from sqlalchemy import Column, Integer, String
from datetime import datetime
from typing import Optional, Literal
from pydantic import BaseModel, HttpUrl, constr, EmailStr
from sqlalchemy import Column, Integer, String, DateTime, func, Boolean
from database import *
from datetime import datetime
from database import Base  

class ChatHistory(Base):
    __tablename__ = "chat_history"

    id = Column(Integer, primary_key=True, index=True)
    user_email = Column(String)
    app_id = Column(Integer) 
    sender = Column(String)
    message = Column(String)
    timestamp = Column(DateTime, default=datetime.utcnow)
    session = Column(String)


#############################################################################################
# MODELO SQLALCHEMY
#############################################################################################

from sqlalchemy import Column, Integer, String, DateTime, func

class Log(Base):
    __tablename__ = "logs"

    id = Column(Integer, primary_key=True, index=True)
    ip = Column(String, nullable=False)
    action = Column(String, nullable=False)
    app_id = Column(Integer, nullable=True)
    created_at = Column(DateTime, server_default=func.now())  # <-- ESSA LINHA É ESSENCIAL



class App(Base):
    __tablename__ = 'apps'

    id = Column(Integer, primary_key=True)
    grupo = Column(String)
    titulo = Column(String)
    descricao = Column(String)
    url = Column(String)
    imagem = Column(String)
    permite_arquivos = Column(String) 

class Setor(Base):
    __tablename__ = "setores"
    
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    nome = Column(String(255), nullable=True)  
    setor = Column(String(100), nullable=True)


class Counter(Base):
    __tablename__ = "contador"

    id = Column(Integer, primary_key=True, index=True)
    app_id = Column(Integer, unique=True, nullable=False)
    count = Column(Integer, default=0)

class Admin(Base):
    __tablename__ = 'admin'
    id = Column(Integer, primary_key=True, autoincrement=True)
    email = Column(String(255), unique=True, nullable=False)

#############################################################################################
# MODELOS PYDANTIC
#############################################################################################
class CounterCreate(BaseModel):
    app_id: int

class CounterResponse(BaseModel):
    id: int
    app_id: int
    count: int
    class Config:
        from_attributes = True

class LogResponse(BaseModel):
    id: int
    ip: str
    action: str
    app_id: Optional[int]
    created_at: datetime
    class Config:
        from_attributes = True

class LogCreate(BaseModel):
    ip: str
    action: str
    app_id: Optional[int] = None

class AppCreate(BaseModel):
    grupo: constr(min_length=1, max_length=255)
    titulo: constr(min_length=1, max_length=255)
    descricao: constr(min_length=1)
    permite_arquivos: str 
    url: str
    imagem: Optional[str] = None

class AppResponse(AppCreate):
    id: int
    class Config:
        from_attributes = True

class SetorCreate(BaseModel):
    nome: constr(min_length=1, max_length=255)
    setor: constr(min_length=1, max_length=100)

class SetorResponse(SetorCreate):
    id: int

    class Config:
        from_attributes = True

class AdminBase(BaseModel):
    email: EmailStr

class AdminCreate(AdminBase):
    pass

class AdminRead(AdminBase):
    id: int

    class Config:
        from_attributes = True

class ChatMessageBase(BaseModel):
    user_email: str
    app_id: int
    sender: Literal["user", "ai"]
    message: str
    session: str


class ChatMessageCreate(ChatMessageBase):
    pass

class ChatMessageResponse(ChatMessageBase):
    id: int
    timestamp: datetime

    class Config:
        from_attributes = True

class FrontendLogCreate(BaseModel):
    action: str
    email: str 
    app_id: Optional[int] = None