import os
import requests
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel

# Carrega as variáveis de ambiente (necessário se usar python-dotenv)
from dotenv import load_dotenv
load_dotenv()

# Define o modelo de dados para a requisição que virá do React
class TokenRequest(BaseModel):
    hash: str

router = APIRouter(
    prefix="/api/v1",
    tags=["Authentication"]
)

# Endpoint da Intranet para verificação
TOKEN_VERIFICATION_URL_TEMPLATE = "https://apiintranet.kryptonbpo.com.br/rag-ia-kryptonbpo?{}"
BEARER_KEY = "Tgfhrb%$39gk@1856"

@router.post("/validate-token")
def validate_token_endpoint(token_request: TokenRequest):
    """
    Recebe um hash do frontend, valida-o contra a API da Intranet e retorna os dados do usuário.
    """
    if not BEARER_KEY:
        raise HTTPException(
            status_code=500, 
            detail="BEARER_KEY não configurado no servidor."
        )

    # Prepara a chamada para a API da Intranet
    verification_url = TOKEN_VERIFICATION_URL_TEMPLATE.format(token_request.hash)
    headers = {
        "Authorization": f"Bearer {BEARER_KEY}"
    }

    try:
        # Faz a requisição GET para a API externa
        response = requests.get(url=verification_url, headers=headers)

        # Se a API externa retornar um erro (ex: 401, 403, 404), repassa o erro
        if response.status_code != 200:
            raise HTTPException(
                status_code=response.status_code, 
                detail=f"Erro na validação do token: {response.text}"
            )
        
        # Se a resposta for bem-sucedida, retorna o JSON com os dados do usuário
        return response.json()

    except requests.exceptions.RequestException as e:
        raise HTTPException(status_code=503, detail=f"Erro ao contatar o serviço de autenticação: {e}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro interno: {e}")