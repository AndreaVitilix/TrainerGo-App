# Usa un'immagine leggera di Node
FROM node:20-alpine

# Imposta la cartella di lavoro
WORKDIR /app

# Copia i file delle dipendenze
COPY package*.json ./

# --- MODIFICA QUI ---
# Installa le dipendenze ignorando i conflitti di versione
RUN npm install --legacy-peer-deps
# --------------------

# Copia tutto il resto del codice
COPY . .

# Espone la porta usata da Vite (di solito 5173 o 3000)
EXPOSE 5173

# Avvia l'app in modalità sviluppo (con host aperto per Docker)
CMD ["npm", "run", "dev", "--", "--host"]