
---

# Instruções para Executar o Projeto

Este projeto pode ser executado de duas formas: utilizando o script `start.sh` diretamente ou através do Docker.

## 1. **Ativar o Programa** (Opção 1)

Para rodar o programa com o script `start.sh`, siga os passos abaixo:

1. **Conceda permissões de execução ao script**:
    ```bash
    chmod 777 start.sh
    ```

2. **Execute o script**:
    ```bash
    ./start.sh
    ```

## 2. **Ativar o Programa** (Opção 2)

Caso prefira rodar o script utilizando o `bash`, siga os passos abaixo:

1. **Conceda permissões de execução ao script**:
    ```bash
    chmod 777 start.sh
    ```

2. **Execute o script com `bash`**:
    ```bash
    bash start.sh
    ```

## 3. **Executar com Docker**

Se preferir usar Docker para executar o programa, siga os passos abaixo:

### 3.1 **Construir a Imagem Docker**

No diretório onde está localizado o `Dockerfile`, execute o seguinte comando para construir a imagem Docker:

```bash
docker build -t app_bi .
```

### 3.2 **Rodar o Container Docker**

Após construir a imagem, você pode rodar o container com o seguinte comando:

```bash
docker run -e GIT_USER=user -e GIT_PASS=password -p 8501:8501 -p 8000:8000 app_bi
```

Isso fará com que o Docker execute o container e exponha as portas 8501, 8502 e 8000 para você acessar o aplicativo.

---

Agora, você pode acessar o serviço nas portas correspondentes (8501, 8502, 8000) diretamente do seu navegador.

---
