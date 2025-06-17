# app_docling.py
from fastapi import FastAPI, UploadFile, File, Form, HTTPException, APIRouter
from typing import Optional
#from docling.document_converter import DocumentConverter
#from docling.chunking import HybridChunker
#import shutil
import os
#import uuid
from fastapi.responses import JSONResponse
import openai
import io
from dotenv import load_dotenv

load_dotenv()
router = APIRouter(prefix="/api/v1/process_pdf", tags=["PDFs"])
openai.api_key = os.getenv("OPENAI_API_KEY")

#@router.post("/convert/")
#async def convert(
#    file: Optional[UploadFile] = File(None),
#    url: Optional[str] = Form(None)
#):
#    if not file and not url:
#        raise HTTPException(status_code=400, detail="Envie um arquivo ou uma URL.")
#
#    converter = DocumentConverter()
#
#    if file:
#        filename = f"temp_{uuid.uuid4()}.pdf"
#        file_path = f"temp_files/{filename}"
#        os.makedirs("temp_files", exist_ok=True)
#
#        with open(file_path, "wb") as buffer:
#            shutil.copyfileobj(file.file, buffer)
#
#
#        try:
#            result = converter.convert(file_path)
#            doc = result.document 
#        except Exception as e:
#            raise HTTPException(status_code=500, detail=str(e))
#        finally:
#            os.remove(file_path)
#
#    else:
#        try:
#            result = converter.convert(url)
#            doc = result.document 
#        except Exception as e:
#            raise HTTPException(status_code=500, detail=str(e))
#
#    chunker = HybridChunker()
#    chunk_iter = chunker.chunk(dl_doc=doc)

#    chunks = []
#    for i, chunk in enumerate(chunk_iter):
#        enriched_text = chunker.serialize(chunk=chunk)
#        chunks.append({
#            "chunk_number": i,
#            "text": chunk.text,
#            #"enriched_text": enriched_text
#        })

#    return {"chunks": chunks}

@router.post("/enviar-pdf/")
async def enviar_pdf(
    arquivo: UploadFile,
    thread_id: str = Form(...),
    assistant_id: str = Form(...),
    mensagem: str = Form("Segue o arquivo para análise.")
):
    try:
        # Garante que o nome do arquivo tenha extensão
        if not arquivo.filename or '.' not in arquivo.filename:
            raise ValueError("Arquivo deve ter uma extensão válida, como .pdf")

        conteudo = await arquivo.read()

        # Envia o arquivo com o nome original (incluindo extensão)
        file_response = openai.files.create(
            file=io.BytesIO(conteudo),
            purpose="assistants",
            filename=arquivo.filename+".pdf",  # 👈 necessário
        )
        file_id = file_response.id

        # Cria a mensagem na thread com o anexo
        openai.beta.threads.messages.create(
            thread_id=thread_id,
            role="user",
            content=mensagem,
            attachments=[
                {
                    "file_id": file_id,
                    "tools": [{"type": "file_search"}]
                }
            ]
        )

        # Inicia a execução do assistente
        run = openai.beta.threads.runs.create(
            thread_id=thread_id,
            assistant_id=assistant_id
        )

        return JSONResponse(content={"run_id": run.id}, status_code=200)

    except Exception as e:
        return JSONResponse(content={"erro": str(e)}, status_code=500)