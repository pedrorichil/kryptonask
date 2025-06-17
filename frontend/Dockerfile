# -----------------------------------------------------------------------------
# Dockerfile para a aplicação Frontend (React) com Build Multi-Stage
# -----------------------------------------------------------------------------

# --- ESTÁGIO 1: Build da Aplicação React ---
FROM node:18-alpine AS builder
WORKDIR /app

# CORRIGIDO: Os caminhos agora incluem o prefixo 'frontend/'
COPY frontend/package*.json ./

RUN npm install

# CORRIGIDO: Copia todo o conteúdo da pasta 'frontend'
COPY frontend/ .

RUN npm run build

# --- ESTÁGIO 2: Servidor de Produção (Nginx) ---
FROM nginx:stable-alpine

COPY --from=builder /app/build /usr/share/nginx/html
RUN rm /etc/nginx/conf.d/default.conf

# CORRIGIDO: O caminho para o nginx.conf agora inclui 'frontend/'
COPY frontend/nginx.conf /etc/nginx/conf.d

#EXPOSE 80