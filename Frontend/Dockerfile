# Usa un'immagine Node leggera
FROM node:20-alpine

# Imposta la cartella di lavoro
WORKDIR /app

# Copia i file di dipendenze
COPY package*.json ./

# Installa le dipendenze
RUN npm install

# Copia tutto il resto del codice
COPY . .

# Espone la porta di Vite (default 5173)
EXPOSE 5173

# Avvia il server di sviluppo in modalità host (per essere visibile fuori dal container)
CMD ["npm", "run", "dev", "--", "--host"]