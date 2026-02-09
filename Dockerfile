FROM node:24-alpine

WORKDIR /app

# Copiamos package.json y lock
COPY package.json package-lock.json ./
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

# Instala TODAS las dependencias (prod + dev)
RUN npm install

# Copiamos el resto del proyecto
COPY . .

# Compila TypeScript
RUN npm run build

EXPOSE 4173

CMD ["npm", "run", "preview", "--", "--host", "0.0.0.0", "--port", "4173"]
