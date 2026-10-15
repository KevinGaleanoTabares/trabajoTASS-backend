# Changelog — TASS Backend

Registro cronológico de funcionalidades y cambios del backend. El historial anterior se resumió a partir de los mensajes y archivos de cada commit de Git. Las entradas describen el alcance visible en el repositorio y no sustituyen la documentación detallada de cada API. No incluir secretos, credenciales ni valores de archivos `.env`.

## 2026-10-15 — HU-INFRA-01: configuración y arranque final de MongoDB

- Se mantuvo MongoDB 8 y el alias interno `mongo-practi:27017` para la conexión del backend. Compose publica Mongo en el puerto del host configurado localmente.
- Verificación final: `docker compose --env-file .env.dev up -d --build` completó la construcción e inició los cinco servicios; `docker compose --env-file .env.dev ps` mostró backend, frontend, MongoDB, Redis y RabbitMQ como `healthy`.
- La salida del arranque reportó la creación del volumen `trabajotass-backend_mongodb_data`. El healthcheck confirma disponibilidad y autenticación de Mongo, pero no verifica que los datos esperados de otra instancia estén presentes; comprobarlos por separado antes de dar por confirmada la migración de datos.

## 2026-10-14 — HU-INFRA-01: healthcheck Docker y publicación estática del frontend

### Cambios implementados
- Se añadió un `HEALTHCHECK` al `Dockerfile` del backend, usando la ruta `/health` y el nombre DNS del servicio en Compose. Se conservó Node 22 Alpine; no se cambió la versión de runtime solicitada para el proyecto.
- El `Dockerfile` del frontend ahora usa Nginx como runtime y publica los archivos compilados de Angular en el puerto 80. `nginx.conf` devuelve `index.html` para rutas de la SPA que no correspondan a un archivo estático.
- En `angular.json`, `outputMode` cambió de `server` a `static` para producir el bundle que Nginx puede servir sin ejecutar un servidor Node durante el runtime del contenedor. Las rutas Angular existentes usan `RenderMode.Client`, por lo que la aplicación ya renderizaba esas rutas en el navegador; no se modificaron componentes ni rutas funcionales. Esta modalidad elimina SSR en el runtime Docker y requiere reconstruir la imagen tras cambios de frontend.
- Se actualizaron los `.dockerignore` del backend y frontend para excluir archivos de log y cobertura. En el backend se quitó la excepción que incluía `.env.dev` en el contexto de build; en el frontend se mantuvo la excepción existente para `.env.example`. No se leyeron ni modificaron archivos `.env`.
- Compose ahora define backend, MongoDB, frontend, Redis y RabbitMQ en la red `tass-network`; Redis y RabbitMQ se agregan como infraestructura, sin conexión desde el código de la aplicación en esta fase. Se añadieron healthchecks a los servicios y dependencias saludables para que backend espere a Mongo y frontend espere al backend.
- Se mantuvo el volumen Mongo `mongo-data` que usa el contenedor activo, y se añadió el volumen persistente `rabbitmq_data`. No se eliminaron volúmenes ni se recrearon contenedores.
- Los valores de configuración del backend y credenciales de servicios se parametrizaron mediante variables de entorno de Compose. No se leyeron ni modificaron archivos `.env`; las variables requeridas deben configurarse en el entorno o en el `.env` local antes de levantar Compose.
- Para Docker, las configuraciones Angular `production` y `preprod` usan rutas API relativas (`/api/...`), y Nginx las reenvía al servicio `backend:3000` por la red Compose. `FRONTEND_ENV` continúa siendo dinámico (`${FRONTEND_ENV:-production}`), por lo que puede seleccionarse desde el entorno; se dejaron intactas las configuraciones `development` y `local` usadas por `ng serve`. En Docker debe seleccionarse `production` o `preprod`; `development` conserva su configuración API previa.
- `.env.example` documenta las variables de Compose con valores ficticios y explica qué cambiar para uso local/despliegue. No se leyó ni modificó el `.env` real. `PORT` quedó parametrizado tanto para el listener del backend como para el puerto destino publicado, manteniendo el mismo valor por defecto.

### Pruebas y validación
- `npm run build` en el frontend — compilación completada correctamente; Angular emitió advertencias de presupuesto de bundle/estilos.
- `docker build -t tass-backend:infra01 .` — imagen del backend construida correctamente tras añadir el healthcheck.
- `docker build -t tass-frontend:infra01 .` — imagen del frontend construida correctamente con Nginx.
- Solicitudes HTTP de comprobación a la ruta raíz y a una ruta profunda de prueba de la SPA — ambas respondieron HTTP 200.
- `docker build -t tass-backend:infra01-step4 .` y `docker build -t tass-frontend:infra01-step4 .` — ambas imágenes se construyeron correctamente después de actualizar los `.dockerignore`.
- En Paso 5, `docker compose config -q` — configuración validada usando valores ficticios temporales en el proceso de PowerShell; no se imprimieron ni se alteraron valores del `.env`.
- En Paso 5, `docker compose build backend frontend` — ambos builds completados correctamente. No se iniciaron ni recrearon servicios, por lo que los healthchecks de Redis/RabbitMQ y el mapeo nuevo del frontend no se han validado en ejecución.
- Tras añadir el proxy, `npx ng build --configuration=production` y `npx ng build --configuration=preprod` — ambas compilaciones finalizaron correctamente; producción conserva advertencias de presupuesto de bundle y estilos.
- `docker build -t tass-frontend:infra01-proxy .` y `docker run --rm --add-host backend:127.0.0.1 tass-frontend:infra01-proxy nginx -t` — imagen compilada y sintaxis Nginx validada.
- Prueba HTTP con contenedores temporales aislados — la raíz SPA respondió HTTP 200 y `/api/auth/login` se reenvió a un backend simulado conservando la ruta; los contenedores y la red de prueba se retiraron.
- `docker compose config --format json` con valores ficticios temporales — confirmó que `FRONTEND_ENV=preprod` se transmite como argumento de build. No se mostraron variables sensibles.
- `docker compose --env-file .env.example config --format json` con una sobreescritura temporal `PORT=3301` — validó que Compose lee el ejemplo y propaga el puerto tanto al backend como al puerto destino, sin imprimir valores del archivo.
- `git diff --check` en los dos repositorios — terminó correctamente.
- El healthcheck del backend se validó al construir la imagen; no se verificó el estado de salud de un contenedor backend ejecutándose con esa imagen.

## 2026-10-15 — HU-INFRA-01: catálogo interno de errores TASS

- Se añadió `src/utils/errorCatalog.ts` con los códigos T400–T508 aprobados, sus estados HTTP, descripciones y módulos, usando tipos TypeScript derivados de un objeto constante.
- Se añadió `docs/error-catalog.md` con la misma tabla, un ejemplo de registro con Winston y una nota sobre diferencias entre algunos estados HTTP estándar y las descripciones internas aprobadas.
- El catálogo aún no se conectó al middleware ni a servicios/controladores; no se cambió el comportamiento HTTP existente.
- Verificación: `npm test` — build TypeScript y 6 pruebas completados correctamente.

## 2026-10-15 — HU-INFRA-01: imágenes MongoDB, Redis y RabbitMQ

### Cambios implementados
- Se añadieron Dockerfiles propios para MongoDB 7.0, Redis 7 y RabbitMQ 3.13. Compose construye ahora las cinco imágenes de servicio.
- Mongo copia un script de inicialización que crea los seis índices únicos declarados por los modelos Mongoose. El script de la imagen oficial se ejecuta solo cuando Mongo inicializa un directorio de datos vacío; no altera ni reinicializa `mongo-data`.
- Redis carga `redis.conf` con AOF y snapshots deshabilitados; Compose aplica los valores configurables `REDIS_MAXMEMORY` (128mb por defecto) y `REDIS_MAXMEMORY_POLICY` (`allkeys-lru` por defecto).
- RabbitMQ importa `definitions.json` válido con los usuarios `tass_admin` y `tass_backend`, vhosts `/` y `tass`, permisos de cada usuario, tres colas aprobadas y el exchange fanout durable `tass.dlx` sin bindings. El entrypoint deriva hashes desde variables de entorno y no imprime las contraseñas. El TODO de HU-INFRA-02 está en `rabbitmq.conf` y la documentación; no se insertó comentario en JSON porque invalidaría el formato.
- El healthcheck RabbitMQ usa `check_running`, que espera a que la aplicación broker esté activa, no solo al proceso Erlang.
- El puerto interno del backend se fijó en 3000 para que coincida con el proxy Nginx; `BACKEND_HOST_PORT` permite cambiar el puerto publicado en el host sin romper la comunicación frontend-backend.
- Se amplió `.env.example` con límites/política Redis y contraseñas separadas de ambos usuarios RabbitMQ. No se leyó ni modificó `.env`.
- Se añadió `documentation/infraestructura-docker.md` y se enlazó desde `documentation/README.md`. La guía distingue el comando que inicia solo backend/Mongo del comando que inicia los cinco servicios.

### Pruebas y validación
- `docker compose up -d --build backend` — intentado con Docker Desktop activo; Compose se detuvo antes de crear/recrear servicios porque no recibe `MONGO_INITDB_ROOT_PASSWORD`, `MONGO_BIND_ADDRESS`, `RABBITMQ_ADMIN_PASSWORD` ni `RABBITMQ_BACKEND_PASSWORD`. No se leyó `.env` ni se cambió el stack existente.
- `docker compose --env-file .env.example config -q` y `docker compose --env-file .env.example build` — configuración válida e imágenes de los cinco servicios construidas.
- Stack Compose aislado con `.env.example` y puertos de prueba — los cinco servicios alcanzaron `healthy`; backend `/health` respondió HTTP 200, frontend respondió HTTP 200 y Nginx reenvió `/api/conflicts` al backend, que contestó JSON HTTP 400 a la solicitud no autenticada.
- Mongo en contenedor aislado — el script creó los seis índices únicos esperados; un marcador de prueba permaneció después de reiniciar el contenedor, confirmando persistencia del volumen aislado.
- Redis aislado — `PING` respondió `PONG`; se verificaron el límite de memoria, `allkeys-lru` y AOF deshabilitado.
- RabbitMQ aislado con contraseñas ficticias — broker healthy; se verificaron usuarios, vhosts, permisos, argumentos y durabilidad de las tres colas, exchange `tass.dlx` fanout durable y ausencia de bindings de ese exchange. RabbitMQ crea bindings implícitos desde el exchange por defecto hacia las colas.
- `npm test` — build TypeScript y 6 pruebas completados correctamente. `git diff --check` pasó.
- Se retiraron los contenedores y la red de prueba con `docker compose down` sin `-v`; los volúmenes aislados de validación se conservaron. No se detuvo ni recreó el stack que ya estaba activo.

## 2026-10-12 — Configuración Docker y diagnóstico local

### Configuración
- En `compose.yml`, el servicio de backend carga `.env.dev` con `env_file`. Se retiró la asignación explícita `MONGO_URI: ${MONGO_URI}`, que interpolaba esa variable desde el entorno usado por Docker Compose y podía prevalecer sobre el valor del archivo cargado en el contenedor.
- No se modificaron archivos `.env`. La URI que recibe el contenedor depende ahora del entorno que le proporcione Compose; la conectividad efectiva a Mongo debe comprobarse para la topología usada.

### Guía de comprobación ejecutada
- `npm run build` — compila TypeScript y copia plantillas/recursos. Resultado: terminó correctamente.
- `Test-NetConnection localhost -Port 3000` — comprueba si Windows puede abrir una conexión TCP al puerto publicado del backend. Resultado: `TcpTestSucceeded: True`. Esto confirma que hay un servicio accesible en ese puerto, no que una ruta HTTP o una operación de negocio funcione.
- `docker logs --tail 100 trabajotassbackend 2>&1 | Select-String 'Base de datos Online|Servidor HTTP iniciado|Servidor no iniciado'` — filtra los últimos logs del contenedor para encontrar mensajes de conexión a Mongo y de inicio HTTP sin mostrar todo el log. Resultado observado: aparecen `Base de datos Online` y `Servidor HTTP iniciado`. `docker logs` puede incluir eventos de inicios anteriores; por sí solo no prueba que el contenedor se haya recreado con la configuración más reciente.
- `Invoke-WebRequest http://localhost:3000/ -UseBasicParsing` — solicita la ruta raíz HTTP. Resultado: `Cannot GET /`, esperado porque la API no registra una ruta `GET /`; las rutas de aplicación se montan bajo prefijos `/api`.
- Una solicitud sin autenticación a `GET /api/conflicts` respondió HTTP 400. La ruta existe, pero esa petición no valida el flujo autenticado ni constituye una comprobación de salud.

### Pendientes
- No se verificó una conexión nueva a Mongo recreando el backend con la configuración final de Compose. Los resultados de puerto y logs citados no deben interpretarse como prueba de esa reconexión.
- El backend no registra una ruta dedicada de healthcheck.
- `package.json` no define un script `test` ni se encontraron pruebas automatizadas.

## 2026-10-12 — HU-INFRA-01: logs, healthchecks y pruebas

### Cambios implementados
- Se incorporó Winston como logger de consola JSON, con timestamp, nivel y evento. Los errores registrados incluyen solo el tipo de error y contexto operativo controlado; no incluyen mensajes/stack de excepciones, URI, query strings, cuerpos HTTP, tokens ni documentos.
- Se retiraron logs que imprimían contraseñas de registro, datos personales, payloads JWT, NIT, documentos de Mongo y conflictos completos.
- El middleware global ahora responde con mensaje genérico para errores HTTP 5xx y no devuelve sus detalles internos. Conserva mensajes y detalles de validación para errores de cliente.
- Se añadió `GET /health`. Devuelve HTTP 200 solo cuando la conexión Mongoose está lista y un ping a Mongo responde; en caso contrario devuelve HTTP 503 sin detalles internos.
- Compose comprueba Mongo con `mongosh` y la aplicación con Node 22 (`fetch` nativo), sin depender de `curl`/`wget`. El backend espera a que Mongo esté saludable.
- Mongo ya no publica su puerto en el host desde este Compose. Los contenedores de la red Compose se comunican por el nombre de servicio; el cambio evita exponer una base sin autenticación y evita conflictos con un Mongo del host en el puerto 27017. Se conserva el volumen `mongodb_data`.
- Se configuró `npm test` con el runner integrado `node:test`, sin añadir dependencias.

### Pruebas y validación
- `npm test` — build TypeScript y 6 pruebas completadas: respuesta sanitizada del middleware, preservación de errores de validación y estados saludables/no saludables de Mongo en `/health`.
- `docker compose --profile desarrollo config -q` — configuración válida; se usó `-q` para no imprimir valores interpolados.
- `docker compose --profile desarrollo build server-desarrollo` — imagen backend construida correctamente con Winston. `npm ci` informó vulnerabilidades en dependencias (15 en la etapa de build y 9 en la etapa de producción); no se ejecutó `npm audit fix`.
- `docker compose --profile desarrollo up -d --no-deps mongodb` — servicio Mongo iniciado con healthcheck `healthy`; el contenedor monta el volumen nombrado `trabajotass-backend_mongodb_data` en `/data/db`.
- `docker exec trabajotassmongo mongosh --quiet --eval "quit(db.adminCommand({ ping: 1 }).ok === 1 ? 0 : 1)"` — ping real de Mongo completado correctamente.
- Se inició un contenedor backend temporal con variables de prueba y una URI efímera al servicio `mongodb`, sin cambiar archivos `.env`. El contenedor alcanzó estado `healthy`; `GET /health` respondió `{"status":"ok","database":"connected"}`, `GET /api/conflicts` sin autenticación respondió HTTP 400 y `GET /` respondió HTTP 404. Se comprobaron 3 entradas recientes de logs: eran JSON con `timestamp`, `level` y `event`; no contenían el marcador de JWT de prueba ni cadenas `mongodb://`. El contenedor temporal se retiró al terminar la prueba.
- Se insertó un marcador claramente identificado en una base/colección aislada de validación, se reinició únicamente el contenedor Mongo y se comprobó que el marcador persistió. El marcador de prueba queda conservado para respetar la instrucción de no borrar datos; no se eliminó ninguna base ni volumen.
- El primer intento de recrear Mongo con el puerto de host ligado a loopback falló porque el puerto 27017 ya estaba ocupado. Para no detener esa instancia, Mongo dejó de publicar puertos en el host; permanece accesible desde los servicios de su red Compose.
- El contenedor normal `trabajotassbackend`, que ya estaba en ejecución antes de estos cambios, no se recreó: se comprobó su estado activo y que continuaba respondiendo, pero no tiene cargados todavía los nuevos healthchecks/código. Tras confirmar que la URI ya configurada es accesible desde Compose, se puede aplicar la imagen/configuración con `docker compose --profile desarrollo up -d --build server-desarrollo`; luego comprobar con `docker inspect --format "{{.State.Health.Status}}" trabajotassbackend` y `curl.exe -i http://localhost:3000/health`. No se ejecutó ese reemplazo porque iba a sustituir el contenedor activo y no se inspeccionó el archivo de entorno para anticipar su URI efectiva.
- El catálogo oficial de errores T400–T508 no se encontró en el código ni documentación revisados; no se inventaron sus significados ni se implementaron códigos ficticios.

## Historial anterior — commits del backend

Resumen de los 13 commits disponibles al 2026-10-12, desde la base inicial hasta `f3a6f8e`. Los hashes permiten consultar los cambios exactos con Git.

### 2026-10-08
- `f3a6f8e` — Se agregó el campo `parentesco` al modelo `Conflict`. También se actualizaron la detección de conflictos y la generación de reportes Excel/PDF para incorporar la relación familiar en los datos de conflictos.

### 2026-10-05
- `a962af5` — Se añadió el controlador para obtener administradores y se registró su ruta bajo el módulo de administración. También se ajustaron las rutas y servicios de conflictos y reportes relacionados.
- `09c677d` — Se amplió la generación de informes PDF y Excel de conflictos, con más información y cambios de formato en los servicios de reportes.

### 2026-10-01
- `d3bc2e4` — Se implementó el flujo de cambio de contraseña en autenticación: controlador y ruta de autenticación, además de los ajustes asociados a conflictos, servidor y reportes.

### 2026-09-28
- `9167131` — Se centralizó/mejoró el tratamiento de errores y validaciones en controladores y servicios de conflictos, empresas, correo, declaraciones y relaciones familiares. Se actualizaron también el middleware de errores y el modelo/tipos de conflicto.

### 2026-09-23
- `4c4c392` — Se incorporó la gestión de relaciones familiares con modelo, controlador, servicio y rutas. Se extendió la detección de conflictos para tomar esas relaciones en cuenta.

### 2026-09-14
- `68fc1b8` — Se añadieron los modelos y flujos iniciales para declaraciones familiares y conflictos, junto con controladores, rutas y servicios. Se integraron además utilidades de autenticación/autorización necesarias para esos flujos.

### 2026-09-03
- `13cae7b` — Se reforzó el registro de usuarios con validaciones de datos y comprobación de personas autorizadas. Se añadieron/actualizaron los modelos y rutas de personas autorizadas y empresas, y el envío de correo de verificación.

### 2026-08-26
- `b0e7a81` — Se ajustaron el arranque del backend, la configuración de entorno y el Dockerfile después de los cambios de despliegue introducidos previamente.

### 2026-08-25
- `07d551a` — Se preparó el backend para ejecutarse en Docker junto al frontend. El commit incorporó Dockerfile y Compose, ajustes de variables de entorno y cambios en rutas, autenticación, empresas y correo.

### 2026-08-19
- `2b044c4` — El mensaje del commit registra mejoras de seguridad. Consultar el diff de `2b044c4` para identificar los archivos y cambios concretos antes de usarlo como referencia técnica.

### 2026-08-11
- `212b133` — Se reorganizó el repositorio y se retiraron dependencias/artefactos generados que no debían mantenerse como archivos fuente versionados.

### 2026-08-10
- `7c08809` — Commit inicial del backend. Estableció la base del repositorio sobre la que se añadieron posteriormente autenticación, rutas y servicios de la aplicación.
