# 1. Usa uma imagem oficial do Python estável e leve
FROM python:3.11-slim

# 2. Instala dependências do sistema necessárias para o MySQL
RUN apt-get update && apt-get install -y \
    gcc \
    default-libmysqlclient-dev \
    pkg-config \
    && rm -rf /var/lib/apt/lists/*

# 3. Define o diretório de trabalho dentro do contêiner
WORKDIR /app

# 4. Copia o restante do código do seu projeto para dentro do contêiner
COPY . .

# 5. INSTALAÇÃO DIRETA: Garante a instalação do Flask e do conector MySQL sem depender do requirements.txt
RUN pip install --no-cache-dir Flask==3.0.3 Flask-MySQLdb==2.0.0 cryptography==43.0.1 Werkzeug

# 6. Informa a porta que o Flask vai expor
EXPOSE 5000

# 7. Comando para rodar a aplicação
CMD ["python", "app.py"]
