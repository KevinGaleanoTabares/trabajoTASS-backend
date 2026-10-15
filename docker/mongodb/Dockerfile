FROM mongo:8

# Los scripts se ejecutan al inicializar un directorio de datos MongoDB vacío.
COPY init/ /docker-entrypoint-initdb.d/
