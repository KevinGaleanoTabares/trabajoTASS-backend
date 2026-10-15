# Infraestructura Docker de TASS

## Requisitos de configuración

Compose usa el archivo `.env` de la raíz del backend para interpolar variables. Si se parte de cero, copia `.env.example` a `.env` y reemplaza los valores `CAMBIAR_*` por valores ficticios de desarrollo o secretos propios del entorno. No compartas ni subas el `.env` real.

Variables de infraestructura que deben coincidir entre servicios:

- `MONGO_INITDB_ROOT_USERNAME`, `MONGO_INITDB_ROOT_PASSWORD` y `MONGO_URI`: la URI debe usar el usuario y la contraseña que inicializaron el Mongo actual; codifica caracteres reservados de la contraseña como percent-encoding.
- `MONGO_BIND_ADDRESS` y `MONGO_HOST_PORT`: controlan la publicación de Mongo en el host. El ejemplo enlaza solo a loopback en el puerto `27018` para evitar conflictos con MongoDB local; los contenedores se comunican por `mongo-practi:27017`.
- `BACKEND_HOST_PORT` y `FRONTEND_HOST_PORT`: puertos accesibles desde el host. Dentro de la red Compose el backend escucha siempre en el puerto 3000 para que coincida con el proxy Nginx.
- `RABBITMQ_ADMIN_PASSWORD` y `RABBITMQ_BACKEND_PASSWORD`: contraseñas de los usuarios de RabbitMQ. El contenedor genera sus hashes al inicio; los valores no se escriben en el archivo de definiciones ni se imprimen por el script.
- `REDIS_MAXMEMORY` y `REDIS_MAXMEMORY_POLICY`: límite y política de expulsión del caché Redis.

## Comandos

Desde la raíz del backend, con las variables requeridas configuradas:

```powershell
docker compose up -d --build
```

Este comando construye e inicia los cinco servicios: `backend`, `mongodb`, `redis`, `rabbitmq` y `frontend`. Espera a que Mongo esté saludable antes del backend y a que el backend esté saludable antes del frontend.

Para iniciar solo backend y sus dependencias declaradas:

```powershell
docker compose up -d --build backend
```

Este comando inicia/reconstruye backend y MongoDB; **no** inicia frontend, Redis ni RabbitMQ porque el backend todavía no consume Redis o RabbitMQ y no depende del frontend.

Comprobaciones operativas:

```powershell
docker compose ps
Invoke-WebRequest http://localhost:3000/health -UseBasicParsing
Invoke-WebRequest http://localhost:11001/ -UseBasicParsing
```

`/health` comprueba la conexión backend-Mongo. La raíz del puerto 11001 comprueba la entrega del frontend. Los puertos publicados pueden cambiar en `.env`.

## Servicios y persistencia

- MongoDB usa `mongo:8` y el volumen persistente `mongodb_data` en `/data/db`, reutilizando el volumen existente del proyecto. Se publica en `127.0.0.1:27018` por defecto; el backend se conecta por el alias interno `mongo-practi:27017`. `docker/mongodb/init/01-create-model-indexes.js` crea índices únicos que ya aparecen en los modelos Mongoose. La imagen oficial solo ejecuta esos scripts cuando el directorio de datos está vacío; no vuelve a aplicarlos ni modifica un volumen ya inicializado.
- Redis usa configuración efímera: `appendonly no`, snapshots RDB deshabilitados, memoria máxima `128mb` y expulsión `allkeys-lru` de forma predeterminada. No se publica un puerto del host y aún no existe integración del backend.
- RabbitMQ usa `rabbitmq:3.13-management-alpine` y el volumen `rabbitmq_data`. El archivo de definiciones configura los usuarios `tass_admin` y `tass_backend`, los vhosts `/` y `tass`, las tres colas conocidas y el exchange `tass.dlx`. No define bindings.
- Las colas `tass.conflict.detection` y `tass.email.notification` usan únicamente los argumentos confirmados. `tass.report.generation` queda durable y sin argumentos. `tass.dlx` es fanout y durable, sin bindings.
- La topología de RabbitMQ es parcial por alcance de HU-INFRA-01. **TODO HU-INFRA-02:** validar el catálogo completo de colas con el líder técnico.
- Frontend Nginx publica los assets Angular y reenvía `/api/` a `backend:3000` por la red de Compose. La red compartida permite resolución DNS de los servicios; conserva salida a internet para que el backend pueda usar SMTP.

## Precauciones de datos

- La inicialización de Mongo se omite automáticamente cuando el volumen `mongodb_data` ya contiene datos. Agregar scripts a la imagen no recrea ese volumen ni ejecuta los scripts sobre él.
- `docker compose down` detiene y elimina contenedores/redes del proyecto, pero conserva los volúmenes nombrados. No uses `docker compose down -v` para reiniciar servicios: borraría datos persistentes.
- Ejecutar `docker compose up -d --build backend` no valida la imagen actual del frontend ni el estado de Redis/RabbitMQ. Para verificar el stack completo, usa el comando sin nombre de servicio y revisa todos los servicios con `docker compose ps`.
- El contexto de build del frontend es `../trabajoTASSfrontend`; ambos repositorios deben estar como carpetas hermanas en la máquina de despliegue.
