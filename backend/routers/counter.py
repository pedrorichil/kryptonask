from typing import List, Optional
from fastapi import FastAPI, Depends, HTTPException, Request, status, Query, APIRouter
from sqlalchemy.orm import Session
from models import *
from database import get_db, log_action

router = APIRouter(prefix="/api/v1/counter", tags=["Contador"])

# ROTAS CONTADOR ########################################################################
@router.post("/", response_model=CounterResponse)
def create_counter(counter_create: CounterCreate, db: Session = Depends(get_db)):
    counter = db.query(Counter).filter(Counter.app_id == counter_create.app_id).first()
    if counter:
        counter.count += 1
    else:
        counter = Counter(app_id=counter_create.app_id, count=1)
        db.add(counter)
    db.commit()
    db.refresh(counter)
    return counter

@router.get("/", response_model=List[CounterResponse])
def get_counter(app_id: Optional[int] = None, skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    if app_id:
        counter = db.query(Counter).filter(Counter.app_id == app_id).first()
        if not counter:
            raise HTTPException(status_code=404, detail="Counter não encontrado")
        return [counter]  
    else:
        counters = db.query(Counter).offset(skip).limit(limit).all()
        return counters
    