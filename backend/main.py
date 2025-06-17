from fastapi import FastAPI
from routers import apps, setores, admins, counter, logs, historico, chat_history, assistant, auth #, title, process_pdf
from fastapi.middleware.cors import CORSMiddleware  # Importe o CORSMiddleware

app = FastAPI()


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True, 
    allow_methods=["*"],  
    allow_headers=["*"],  
)

# Registro das rotas versionadas
app.include_router(apps.router)
app.include_router(setores.router)
app.include_router(admins.router)
app.include_router(counter.router)
app.include_router(logs.router)
app.include_router(historico.router)
app.include_router(chat_history.router)
#app.include_router(process_pdf.router)
app.include_router(assistant.router)
#app.include_router(title.router)
app.include_router(auth.router)



