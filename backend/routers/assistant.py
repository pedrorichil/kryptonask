import os
import openai
import time
from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional
from dotenv import load_dotenv

load_dotenv()

router = APIRouter(prefix="/api/v1/assistant", tags=["Assistente GPT"])

# --- Modelos de Dados ---
class ChatRequest(BaseModel):
    message: str
    assistant_id: str
    thread_id: Optional[str] = None

# --- Funções de Lógica da OpenAI ---
# (Estas funções agora são usadas diretamente pelo endpoint)

def is_valid_thread(thread_id: str) -> bool:
    try:
        openai.api_key = os.getenv("OPENAI_API_KEY")
        openai.beta.threads.retrieve(thread_id)
        return True
    except openai.NotFoundError:
        return False

def create_new_thread() -> str:
    openai.api_key = os.getenv("OPENAI_API_KEY")
    thread = openai.beta.threads.create()
    return thread.id

# --- Endpoint de Chat Síncrono ---

@router.post("/chat")
def chat(req: ChatRequest):
    """
    Processa a mensagem de chat de forma síncrona.
    Recebe a mensagem e aguarda a resposta da OpenAI antes de responder.
    """
    openai.api_key = os.getenv("OPENAI_API_KEY")

    thread_id = req.thread_id
    if thread_id is None or not is_valid_thread(thread_id):
        thread_id = create_new_thread()

    openai.beta.threads.messages.create(
        thread_id=thread_id, role="user", content=req.message
    )

    run = openai.beta.threads.runs.create(
        thread_id=thread_id, assistant_id=req.assistant_id
    )

    # Aguarda a conclusão
    while run.status not in ["completed", "failed"]:
        time.sleep(1)
        run = openai.beta.threads.runs.retrieve(thread_id=thread_id, run_id=run.id)

    if run.status == "failed":
        return {"error": "A execução do assistente falhou.", "thread_id": thread_id}
    
    messages = openai.beta.threads.messages.list(thread_id=thread_id)
    response_text = messages.data[0].content[0].text.value

    # Retorna a resposta completa diretamente
    return {"response": response_text, "thread_id": thread_id}