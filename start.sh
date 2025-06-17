#!/bin/bash

# Define cores para a saída do terminal para melhor legibilidade
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${GREEN}=========================================================================${NC}"
echo -e "${GREEN}  INSTRUÇÕES PARA INICIAR O AMBIENTE DE DESENVOLVIMENTO LOCAL"
echo -e "${GREEN}=========================================================================${NC}"
echo ""
echo -e "${YELLOW}A arquitetura com Celery requer DOIS terminais rodando processos separados.${NC}"
echo "Por favor, abra dois terminais e navegue até a pasta 'backend' em cada um."
echo ""
echo "-------------------------------------------------------------------------"
echo -e "No ${CYAN}TERMINAL 1${NC}, inicie o Servidor Web (FastAPI):"
echo "-------------------------------------------------------------------------"
echo "uvicorn main:app --host 0.0.0.0 --reload"
echo ""
echo ""
echo "-------------------------------------------------------------------------"
echo -e "No ${CYAN}TERMINAL 2${NC}, inicie o Worker de Tarefas (Celery):"
echo "-------------------------------------------------------------------------"
echo "celery -A celery_worker.celery_app worker --loglevel=info"
echo ""
echo "========================================================================="
echo -e "${YELLOW}Ambos os terminais devem permanecer abertos para a aplicação funcionar.${NC}"
echo "========================================================================="
echo ""