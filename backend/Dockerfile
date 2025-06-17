# -----------------------------------------------------------------------------
# Dockerfile para a aplicação Backend (FastAPI + Celery)
# -----------------------------------------------------------------------------

# Etapa 1: Use uma imagem base oficial do Python
FROM python:3.9-slim

# Etapa 2: Definir o diretório de trabalho dentro do contêiner
WORKDIR /app

# Etapa 3: Copiar o arquivo de dependências e instalá-las
# CORREÇÃO: Especifique o caminho correto a partir da raiz do projeto.
COPY backend/requirements.txt /app/requirements.txt

RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r /app/requirements.txt

# Etapa 4: Copiar o restante do código da aplicação para o contêiner
# CORREÇÃO: Copie apenas o conteúdo da pasta 'backend'.
COPY backend/ /app/

# Etapa 5: Expor a porta que o Uvicorn usará
EXPOSE 8007

# Define o comando padrão para iniciar o servidor web.
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8007"]
