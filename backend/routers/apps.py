from fastapi import APIRouter, Depends, Request, HTTPException
from typing import List
from sqlalchemy.orm import Session
from models import App, AppCreate, AppResponse
from database import get_db, log_action

router = APIRouter(prefix="/api/v1/apps", tags=["Apps"])

@router.get("/", response_model=List[AppResponse])
def get_apps(skip: int = 0, limit: int = 9999, db: Session = Depends(get_db)):
    return db.query(App).offset(skip).limit(limit).all()

@router.post("/", response_model=AppResponse)
def create_app(app_create: AppCreate, request: Request, db: Session = Depends(get_db)):
    ip = request.client.host
    db_app = App(**app_create.dict())
    db.add(db_app)
    db.commit()
    db.refresh(db_app)
    log_action(db, ip, "CREATE", db_app.id)
    return db_app

@router.put("/{app_id}", response_model=AppResponse)
def update_app(app_id: int, app_create: AppCreate, request: Request, db: Session = Depends(get_db)):
    ip = request.client.host
    db_app = db.query(App).filter(App.id == app_id).first()
    if not db_app:
        raise HTTPException(status_code=404, detail="App não encontrado")
    for key, value in app_create.dict().items():
        setattr(db_app, key, value)
    db.commit()
    db.refresh(db_app)
    log_action(db, ip, "UPDATE", app_id)
    return db_app

@router.delete("/{app_id}")
def delete_app(app_id: int, request: Request, db: Session = Depends(get_db)):
    ip = request.client.host
    db_app = db.query(App).filter(App.id == app_id).first()
    if not db_app:
        raise HTTPException(status_code=404, detail="App não encontrado")
    db.delete(db_app)
    db.commit()
    log_action(db, ip, "DELETE", app_id)
    return {"message": "App deletado com sucesso"}
 