#from fastapi import FastAPI, APIRouter
#from pydantic import BaseModel
#from transformers import pipeline

#router = APIRouter(prefix="/api/v1/title_generator", tags=["Gerador de Títulos"])
#resumidor = pipeline("summarization", model="facebook/bart-large-cnn")
#
#class TextoEntrada(BaseModel):
#    texto: str

#@router.post("/")
#def gerar_titulo_api(entrada: TextoEntrada):
#    resumo = resumidor(
#        entrada.texto,
#        max_length=15,
#        min_length=5,
#        do_sample=False
#    )
#    return {"titulo": resumo[0]['summary_text']}
