import openai
import os
import json
from dotenv import load_dotenv
from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional
from celery_worker import process_chat_message
from celery.result import AsyncResult


load_dotenv()
openai.api_key = os.getenv("OPENAI_API_KEY")

THREAD_FILE = "logs/thread_id.json"
ALL_THREADS_FILE = "logs/all_threads.json"

def create_new_thread():
    thread = openai.beta.threads.create()
    thread_id = thread.id

    # Atualiza o thread atual
    with open(THREAD_FILE, "w") as f:
        json.dump({"thread_id": thread_id}, f)

    # Salva em lista cumulativa com proteção contra arquivos vazios/corrompidos
    if os.path.exists(ALL_THREADS_FILE):
        try:
            with open(ALL_THREADS_FILE, "r") as f:
                all_threads = json.load(f)
                if not isinstance(all_threads, list):
                    all_threads = []
        except (json.JSONDecodeError, ValueError):
            all_threads = []
    else:
        all_threads = []

    if thread_id not in all_threads:
        all_threads.append(thread_id)
        with open(ALL_THREADS_FILE, "w") as f:
            json.dump(all_threads, f, indent=2)

    return thread_id


def delete_thread(thread_id: str):
    try:
        openai.beta.threads.delete(thread_id)
        return True
    except Exception:
        return False

def get_or_create_thread():
    if os.path.exists(THREAD_FILE):
        with open(THREAD_FILE, "r") as f:
            return json.load(f).get("thread_id")
    else:
        return create_new_thread()

def is_valid_thread(thread_id: str) -> bool:
    try:
        openai.beta.threads.retrieve(thread_id)
        return True
    except openai.NotFoundError:
        return False

def send_message_to_assistant(message_text, assistant_id, thread_id=None):
    if thread_id is None or not is_valid_thread(thread_id):
        thread_id = create_new_thread()

    try:
        openai.beta.threads.messages.create(
            thread_id=thread_id,
            role="user",
            content=message_text
        )
    except openai.NotFoundError:
        # Thread desapareceu entre o check e o uso — cria nova
        thread_id = create_new_thread()
        openai.beta.threads.messages.create(
            thread_id=thread_id,
            role="user",
            content=message_text
        )

    run = openai.beta.threads.runs.create(
        thread_id=thread_id,
        assistant_id=assistant_id,
    )

    while True:
        status = openai.beta.threads.runs.retrieve(
            thread_id=thread_id,
            run_id=run.id
        )
        if status.status == "completed":
            break

    messages = openai.beta.threads.messages.list(thread_id=thread_id)
    last_msg = messages.data[0].content[0].text.value
    return last_msg, thread_id

router = APIRouter(prefix="/api/v1/assistant", tags=["Assistente GPT"])

class ChatRequest(BaseModel):
    message: str
    assistant_id: str
    thread_id: Optional[str] = None

class ThreadDeleteRequest(BaseModel):
    thread_id: str

@router.post("/chat")
def chat(req: ChatRequest):
    task = process_chat_message.delay(
        req.message,
        assistant_id=req.assistant_id,
        thread_id=req.thread_id
    )
    return {"task_id": task.id}

@router.get("/chat/result/{task_id}")
def get_chat_result(task_id: str):
    task_result = AsyncResult(task_id, app=process_chat_message.app)
    if task_result.ready():
        if task_result.successful():
            return {"status": "SUCCESS", "data": task_result.get()}
        else:
            # Importante: Logar o erro no servidor para facilitar a depuração
            print(f"Task {task_id} failed: {task_result.info}")
            return {"status": "FAILURE", "error": str(task_result.info)}
    else:
        return {"status": "PENDING"}

@router.get("/thread/new")
def nova_thread():
    thread_id = create_new_thread()
    return {"message": "Nova thread criada", "thread_id": thread_id}

@router.delete("/thread/delete")
def deletar_thread(req: ThreadDeleteRequest):
    ok = delete_thread(req.thread_id)
    return {
        "message": "Thread deletada" if ok else "Falha ao deletar thread",
        "thread_id": req.thread_id
    }

@router.get("/thread")
def obter_thread():
    thread_id = get_or_create_thread()
    return {"thread_id": thread_id}

@router.get("/threads/all")
def listar_threads_criadas():
    if os.path.exists(ALL_THREADS_FILE):
        with open(ALL_THREADS_FILE, "r") as f:
            all_threads = json.load(f)
    else:
        all_threads = []
    return {"threads": all_threads}