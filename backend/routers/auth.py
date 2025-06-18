import os
import requests
from fastapi import APIRouter, HTTPException, Depends, status
from pydantic import BaseModel, constr
from dotenv import load_dotenv
from sqlalchemy.orm import Session
from database import get_db
import models # Importa os modelos para acessar a tabela Admin

load_dotenv()

class TokenRequest(BaseModel):
    hash: constr(min_length=1)

router = APIRouter(
    prefix="/api/v1",
    tags=["Authentication"]
)

TOKEN_VERIFICATION_URL_TEMPLATE = "https://apiintranet.kryptonbpo.com.br/rag-ia-kryptonbpo?{}"
BEARER_KEY = "Tgfhrb%$39gk@1856"

@router.post("/validate-token")
# Adicionamos a dependência do banco de dados (db: Session)
def validate_token_endpoint(token_request: TokenRequest, db: Session = Depends(get_db)):
    """
    Recebe um hash do frontend, valida-o contra a API da Intranet,
    verifica se o usuário é admin e retorna os dados completos.
    """
    if not BEARER_KEY:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, 
            detail="BEARER_KEY não configurado no servidor."
        )

    verification_url = TOKEN_VERIFICATION_URL_TEMPLATE.format(token_request.hash)
    headers = {"Authorization": f"Bearer {BEARER_KEY}"}

    try:
        response = requests.get(url=verification_url, headers=headers, timeout=10)
        response.raise_for_status()
        
        user_data = response.json()
        
        # --- LÓGICA DE VERIFICAÇÃO DE ADMIN ---
        is_admin = False
        user_email = user_data.get("email")
        if user_email:
            # Consulta a tabela 'admin' para ver se o email existe
            admin_record = db.query(models.Admin).filter(models.Admin.email == user_email).first()
            
            if admin_record:
                is_admin = True
        
        # Adiciona a flag 'is_admin' aos dados do usuário
        user_data['is_admin'] = is_admin
        
        return user_data

    except requests.exceptions.HTTPError as http_err:
        raise HTTPException(
            status_code=http_err.response.status_code,
            detail=f"Erro na validação do token com o serviço externo: {http_err.response.text}"
        )
    except requests.exceptions.RequestException as req_err:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE, 
            detail=f"Erro ao contatar o serviço de autenticação: {req_err}"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, 
            detail=f"Erro interno inesperado: {e}"
        )