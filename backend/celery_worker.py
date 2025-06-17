import os
import openai
from celery import Celery
from dotenv import load_dotenv
from urllib.parse import quote_plus
import time

load_dotenv()

# --- Configuração do Redis (sem autenticação) ---
REDIS_HOST = os.getenv("REDIS_HOST", "192.168.22.29")
REDIS_PORT = os.getenv("REDIS_PORT", "6379")

REDIS_URL = f"redis://{REDIS_HOST}:{REDIS_PORT}/0"

# --- Configuração do Celery ---
celery_app = Celery(
    'tasks',
    broker=os.getenv("CELERY_BROKER_URL", REDIS_URL),
    backend=os.getenv("CELERY_RESULT_BACKEND", REDIS_URL)
)
# --- Funções auxiliares ---

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

# --- Tarefa assíncrona Celery ---

@celery_app.task
def process_chat_message(message_text: str, assistant_id: str, thread_id: str = None):
    """
    Processa uma mensagem de chat de forma assíncrona via Celery e OpenAI Assistants API.
    """
    openai.api_key = os.getenv("OPENAI_API_KEY")

    # Garante que a thread é válida
    if thread_id is None or not is_valid_thread(thread_id):
        thread_id = create_new_thread()

    # Envia a mensagem do usuário
    openai.beta.threads.messages.create(
        thread_id=thread_id,
        role="user",
        content=message_text
    )

    # Executa o assistente
    run = openai.beta.threads.runs.create(
        thread_id=thread_id,
        assistant_id=assistant_id
    )

    # Espera a execução terminar (com pequeno delay para evitar loop muito rápido)
    while run.status != "completed":
        time.sleep(1)  # Adiciona um pequeno sleep para evitar sobrecarga
        run = openai.beta.threads.runs.retrieve(
            thread_id=thread_id,
            run_id=run.id
        )

    # Recupera a última resposta da thread
    messages = openai.beta.threads.messages.list(thread_id=thread_id)
    response_text = messages.data[0].content[0].text.value

    return {"response": response_text, "thread_id": thread_id}
