FROM node:20

# Instala ffmpeg
RUN apt-get update && apt-get install -y ffmpeg

# Define diretório de trabalho dentro do container
WORKDIR /app

# Copia apenas os arquivos de dependências para instalar primeiro (melhor para cache)
COPY package*.json ./

# Instala dependências
RUN npm install

# Copia o restante do código
COPY . .

# Gera o build TypeScript (se estiver usando build manual)
RUN npm run build

# Expõe a porta da API
EXPOSE 3030

# Comando para rodar o servidor
CMD ["npm", "start"]
