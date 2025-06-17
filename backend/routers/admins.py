
from fastapi import APIRouter, Depends, Request, HTTPException
from typing import List
from sqlalchemy.orm import Session
from models import *
from database import get_db

router = APIRouter(prefix="/api/v1/admins", tags=["Adminstrador"])

## ROTAS ADMIN ########################################################################
@router.post("/", response_model=AdminRead)
def create_admin(admin: AdminCreate, db: Session = Depends(get_db)):
    db_admin = Admin(email=admin.email)
    db.add(db_admin)
    db.commit()
    db.refresh(db_admin)
    return db_admin

@router.get("/", response_model=List[AdminRead])
def get_admins(db: Session = Depends(get_db)):
    admins = db.query(Admin).all()
    return admins