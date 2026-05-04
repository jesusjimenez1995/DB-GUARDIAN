# DB-Guardian

Plataforma de gestion de incidencias criticas con stack React (Vite) + Fastify + Oracle SQL.

## Estructura

- `db/DB_GUARDIAN_SCHEMA.sql`: DDL + trigger de flujo estricto de estados + datos semilla de playbooks.
- `backend/server.js`: API Fastify y conexion Oracle con `oracledb` en Thin Mode.
- `frontend/`: SPA React + Tailwind lista para build estatico.

## Inicio rapido (recomendado)

Desde la raiz del repositorio:

1. Instalar dependencias de los tres paquetes (raiz, backend y frontend):
   - `npm run install:all`
2. Iniciar toda la app con un solo comando:
   - `npm run dev`

Esto levanta:

- Frontend (Vite): `http://localhost:5173`
- Backend (Fastify): `http://localhost:3001`

## 1) Preparar Oracle

1. Crear usuario/esquema para la app (ejemplo):
   - `CREATE USER DB_GUARDIAN IDENTIFIED BY <password>;`
   - `GRANT CONNECT, RESOURCE TO DB_GUARDIAN;`
2. Ejecutar el script [db/DB_GUARDIAN_SCHEMA.sql](db/DB_GUARDIAN_SCHEMA.sql) con ese usuario.

## 2) Levantar Backend (Fastify + Thin Mode)

1. Ir a `backend`.
2. Instalar dependencias:
   - `npm install`
3. Crear `.env` desde `.env.example` y configurar credenciales Oracle:
   - `ORACLE_USER`
   - `ORACLE_PASSWORD`
   - `ORACLE_CONNECT_STRING`
   - `USE_MOCKS=true|false` (activar/desactivar modo de prueba con datos mock)
4. Iniciar API:
   - `npm run dev`

El backend expone:

- `GET /api/health`
- `GET /api/incidents`
- `POST /api/incidents`
- `PATCH /api/incidents/:id/status`
- `GET /api/lookup?q=<termino>`
- `GET /api/playbooks/:id`

## 3) Levantar Frontend (React + Vite + Tailwind)

1. Ir a `frontend`.
2. Instalar dependencias:
   - `npm install`
3. Ejecutar en desarrollo:
   - `npm run dev`

Vite esta configurado para proxy de `/api` hacia `http://localhost:3001`.

## 4) Generar Distribuible Estatico (SPA)

1. En `frontend`, ejecutar:
   - `npm run build`
2. El bundle final se genera en:
   - `frontend/dist`

Ese directorio `dist` es el entregable estatico de la SPA.

## Notas de negocio implementadas

- Branding DB base:
  - Primario `#0018A8`
  - Fondo `#F8FAFC`
  - Texto `#1E293B`
- Flujo estricto de estados:
   - `NUEVA -> ASIGNADA -> EN INVESTIGACIÓN -> ESCALADA -> SOLUCIONADA -> CERRADA`
- Lookup inteligente sin APIs externas:
  - `UTL_MATCH.JARO_WINKLER_SIMILARITY`
  - combinacion con clausulas `LIKE`
