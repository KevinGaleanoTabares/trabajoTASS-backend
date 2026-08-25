
# syntax=docker/dockerfile:1

ARG NODE_VERSION=22.23.2

FROM node:${NODE_VERSION}-alpine

ENV NODE_ENV=development

WORKDIR /src/app

# Copiar package files primero
COPY package*.json ./

# Instalar dependencias
RUN npm install

# Copiar proyecto
COPY . .


# Exponer puerto
EXPOSE 3200

# Usuario no root
USER node

# Comando inicio
CMD ["npm", "run", "dev"]
