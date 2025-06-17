import os
import openai
from celery import Celery
from dotenv import load_dotenv
import time

load_dotenv()

# --- Configuração do Redis (sem autenticação) ---
# Usa as variáveis de ambiente se existirem, senão usa os valores padrão para o ambiente local.
REDIS_HOST = os.getenv("REDIS_HOST", "192.168.22.29")
REDIS_PORT = os.getenv("REDIS_PORT", "6379")

# Monta a URL de conexão simples, sem usuário e senha.
REDIS_URL = f"redis://{REDIS_HOST}:{REDIS_PORT}/0"

# --- Configuração do Celery ---
# O Celery usará a variável de ambiente CELERY_BROKER_URL (definida pelo Dokku) em produção,
# ou a REDIS_URL que montamos acima em ambiente local.
celery_app = Celery(
    'tasks',
    broker=os.getenv("CELERY_BROKER_URL", REDIS_URL),
    backend=os.getenv("CELERY_RESULT_BACKEND", REDIS_URL)
)

# --- Funções auxiliares da OpenAI ---

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

# --- Tarefa assíncrona do Celery ---

@celery_app.task
def process_chat_message(message_text: str, assistant_id: str, thread_id: str = None):
    """
    Processa uma mensagem de chat de forma assíncrona via Celery e OpenAI Assistants API.
    """
    openai.api_key = os.getenv("OPENAI_API_KEY")

    if thread_id is None or not is_valid_thread(thread_id):
        thread_id = create_new_thread()

    openai.beta.threads.messages.create(
        thread_id=thread_id,
        role="user",
        content=message_text
    )

    run = openai.beta.threads.runs.create(
        thread_id=thread_id,
        assistant_id=assistant_id
    )

    while run.status not in ["completed", "failed"]:
        time.sleep(1)
        run = openai.beta.threads.runs.retrieve(
            thread_id=thread_id,
            run_id=run.id
        )
    
    if run.status == "failed":
        # É uma boa prática tratar o caso de falha na execução da OpenAI
        return {"error": "A execução do assistente falhou.", "thread_id": thread_id}

    messages = openai.beta.threads.messages.list(thread_id=thread_id)
    response_text = messages.data[0].content[0].text.value

    return {"response": response_text, "thread_id": thread_id}