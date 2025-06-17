from typing import List
from fastapi import Depends, HTTPException, Request, APIRouter
from sqlalchemy.orm import Session
from models import *
from fastapi import APIRouter, Depends, Request, HTTPException, status
from database import get_db, log_action

router = APIRouter(prefix="/api/v1/setores", tags=["Setores"])

## ROTAS SETORES #########################################################################
@router.get("/", response_model=List[SetorResponse])
def get_setores(skip: int = 0, limit: int = 1000, db: Session = Depends(get_db)):
    return db.query(Setor).offset(skip).limit(limit).all()

@router.post("/", response_model=SetorResponse)
def create_setor(setor_create: SetorCreate, request: Request, db: Session = Depends(get_db)):
    try:
        ip = request.client.host
        existing = db.query(Setor).filter(Setor.setor == setor_create.setor).first()
        if existing:
            raise HTTPException(status_code=400, detail="Setor já existe")

        db_setor = Setor(**setor_create.dict())
        db.add(db_setor)
        db.commit()
        db.refresh(db_setor)
        log_action(db, ip, "CREATE", app_id=db_setor.id)
        return db_setor
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Erro ao criar setor: {str(e)}")

@router.put("/{setor_id}", response_model=SetorResponse)
def update_setor(setor_id: int, setor_update: SetorCreate, request: Request, db: Session = Depends(get_db)):
    try:
        ip = request.client.host
        db_setor = db.query(Setor).filter(Setor.id == setor_id).first()
        if not db_setor:
            raise HTTPException(status_code=404, detail="Setor não encontrado")

        for key, value in setor_update.dict().items():
            setattr(db_setor, key, value)

        db.commit()
        db.refresh(db_setor)
        log_action(db, ip, "UPDATE", app_id=setor_id)
        return db_setor
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Erro ao atualizar setor: {str(e)}")

@router.delete("/{setor_id}", status_code=status.HTTP_200_OK)
def delete_setor(setor_id: int, request: Request, db: Session = Depends(get_db)):
    try:
        ip = request.client.host
        db_setor = db.query(Setor).filter(Setor.id == setor_id).first()
        if not db_setor:
            raise HTTPException(status_code=404, detail="Setor não encontrado")

        db.delete(db_setor)
        db.commit()
        log_action(db, ip, "DELETE", app_id=setor_id)
        return {"message": "Setor deletado com sucesso"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Erro ao deletar setor: {str(e)}")
    