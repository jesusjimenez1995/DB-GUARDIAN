import Fastify from 'fastify';
import cors from '@fastify/cors';
import dotenv from 'dotenv';
import oracledb from 'oracledb';
import {
  computeStats,
  findIncidentById,
  findPlaybookById,
  lookupPlaybooksMock,
  mockIncidents,
  nextIncidentId
} from './mockData.js';

dotenv.config();

const STATUS_FLOW = ['NUEVA', 'ASIGNADA', 'EN INVESTIGACIÓN', 'ESCALADA', 'SOLUCIONADA', 'CERRADA'];
const NEXT_STATUS_MAP = {
  NUEVA: 'ASIGNADA',
  ASIGNADA: 'EN INVESTIGACIÓN',
  'EN INVESTIGACIÓN': 'ESCALADA',
  ESCALADA: 'SOLUCIONADA',
  SOLUCIONADA: 'CERRADA',
  CERRADA: null
};

const SUPPORT_USERS = [
  'ana.rodriguez@db-guardian.local',
  'carlos.moreno@db-guardian.local',
  'luis.perez@db-guardian.local',
  'marta.gomez@db-guardian.local',
  'sofia.hernandez@db-guardian.local',
  'david.sanchez@db-guardian.local'
];

const app = Fastify({ logger: true });

app.register(cors, {
  origin: process.env.FRONTEND_ORIGIN || 'http://localhost:5173'
});

oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;
oracledb.fetchAsString = [oracledb.CLOB];

const poolConfig = {
  user: process.env.ORACLE_USER,
  password: process.env.ORACLE_PASSWORD,
  connectString: process.env.ORACLE_CONNECT_STRING,
  poolMin: Number(process.env.ORACLE_POOL_MIN || 1),
  poolMax: Number(process.env.ORACLE_POOL_MAX || 10),
  poolIncrement: Number(process.env.ORACLE_POOL_INCREMENT || 1)
};

let pool;

const useMocks = String(process.env.USE_MOCKS || 'false').toLowerCase() === 'true';

async function getConnection() {
  if (useMocks) {
    return null;
  }
  if (!pool) {
    pool = await oracledb.createPool(poolConfig);
  }
  return pool.getConnection();
}

app.get('/api/health', async () => ({
  status: 'ok',
  service: 'DB-Guardian API',
  mode: useMocks ? 'mock' : 'oracle'
}));

app.get('/api/users', async () => ({ data: SUPPORT_USERS }));

// ── STATS ────────────────────────────────────────────────────────────────────

app.get('/api/stats', async (_, reply) => {
  if (useMocks) {
    return { data: computeStats() };
  }

  let connection;
  try {
    connection = await getConnection();
    const [statusRes, appRes] = await Promise.all([
      connection.execute(`SELECT ESTADO, COUNT(*) AS CNT FROM INCIDENCIAS GROUP BY ESTADO`),
      connection.execute(`SELECT APP_NAME, COUNT(*) AS CNT FROM INCIDENCIAS GROUP BY APP_NAME`)
    ]);

    const byStatus = Object.fromEntries((statusRes.rows || []).map((r) => [r.ESTADO, r.CNT]));
    const byApp = Object.fromEntries((appRes.rows || []).map((r) => [r.APP_NAME, r.CNT]));
    const total = Object.values(byStatus).reduce((a, b) => a + b, 0);

    return { data: { total, byStatus, byApp } };
  } catch (error) {
    app.log.error(error, 'Failed to fetch stats');
    return reply.code(500).send({ error: 'Error fetching stats' });
  } finally {
    if (connection) await connection.close();
  }
});

app.get('/api/incidents', async (_, reply) => {
  if (useMocks) {
    const sorted = [...mockIncidents].sort(
      (a, b) => new Date(b.FECHA_ALTA).getTime() - new Date(a.FECHA_ALTA).getTime()
    );
    return { data: sorted };
  }

  let connection;
  try {
    connection = await getConnection();
    const result = await connection.execute(
      `SELECT ID, APP_NAME, ERROR_CODE, TITULO, DESCRIPCION, ESTADO, PRIORIDAD, ASIGNADO_A,
              FECHA_ALTA, FECHA_RESOLUCION
       FROM INCIDENCIAS
       ORDER BY FECHA_ALTA DESC`
    );
    return { data: result.rows || [] };
  } catch (error) {
    app.log.error(error, 'Failed to fetch incidents');
    return reply.code(500).send({ error: 'Error fetching incidents' });
  } finally {
    if (connection) await connection.close();
  }
});

// ── INCIDENT DETAIL ───────────────────────────────────────────────────────────

app.get('/api/incidents/:id', async (request, reply) => {
  const id = Number(request.params.id);
  if (!id || Number.isNaN(id)) {
    return reply.code(400).send({ error: 'Invalid incident id' });
  }

  if (useMocks) {
    const incident = findIncidentById(id);
    if (!incident) return reply.code(404).send({ error: 'Incident not found' });
    return { data: incident };
  }

  let connection;
  try {
    connection = await getConnection();
    const incRes = await connection.execute(
      `SELECT ID, APP_NAME, ERROR_CODE, TITULO, DESCRIPCION, ESTADO, PRIORIDAD,
              ASIGNADO_A, SOLUCION, FECHA_ALTA, FECHA_RESOLUCION
       FROM INCIDENCIAS WHERE ID = :id`,
      { id }
    );

    if (!incRes.rows || incRes.rows.length === 0) {
      return reply.code(404).send({ error: 'Incident not found' });
    }

    const incident = incRes.rows[0];
    const histRes = await connection.execute(
      `SELECT ESTADO_NUEVO AS ESTADO, FECHA_CAMBIO AS FECHA, COMENTARIO, USUARIO
       FROM HISTORIAL_ESTADOS
       WHERE INCIDENCIA_ID = :id ORDER BY FECHA_CAMBIO`,
      { id }
    );
    incident.HISTORIAL = histRes.rows || [];

    return { data: incident };
  } catch (error) {
    app.log.error(error, 'Failed to fetch incident');
    return reply.code(500).send({ error: 'Error fetching incident' });
  } finally {
    if (connection) await connection.close();
  }
});

app.post('/api/incidents', async (request, reply) => {
  const { appName, errorCode, titulo, descripcion, estado, prioridad, asignadoA } = request.body || {};

  if (!appName || !errorCode || !titulo) {
    return reply.code(400).send({ error: 'appName, errorCode and titulo are required' });
  }

  const normalizedStatus = (estado || 'NUEVA').trim().toUpperCase();
  if (!STATUS_FLOW.includes(normalizedStatus)) {
    return reply.code(400).send({ error: 'Invalid status value' });
  }

  const VALID_PRIORITIES = ['ALTA', 'MEDIA', 'BAJA'];
  const normalizedPriority = (prioridad || 'MEDIA').trim().toUpperCase();
  if (!VALID_PRIORITIES.includes(normalizedPriority)) {
    return reply.code(400).send({ error: 'Invalid priority value' });
  }

  if (useMocks) {
    const id = nextIncidentId();
    mockIncidents.push({
      ID: id,
      APP_NAME: appName,
      ERROR_CODE: errorCode,
      TITULO: titulo,
      DESCRIPCION: descripcion || null,
      ESTADO: normalizedStatus,
      PRIORIDAD: normalizedPriority,
      ASIGNADO_A: asignadoA || null,
      SOLUCION: null,
      FECHA_ALTA: new Date().toISOString(),
      FECHA_RESOLUCION: null,
      HISTORIAL: [{ ESTADO: normalizedStatus, FECHA: new Date().toISOString(), COMENTARIO: 'Incidencia registrada' }]
    });
    return reply.code(201).send({ id, message: 'Incident created (mock mode)' });
  }

  let connection;
  try {
    connection = await getConnection();
    const insertResult = await connection.execute(
      `INSERT INTO INCIDENCIAS (APP_NAME, ERROR_CODE, TITULO, DESCRIPCION, ESTADO, PRIORIDAD, ASIGNADO_A)
       VALUES (:appName, :errorCode, :titulo, :descripcion, :estado, :prioridad, :asignadoA)
       RETURNING ID INTO :id`,
      {
        appName,
        errorCode,
        titulo,
        descripcion: descripcion || null,
        estado: normalizedStatus,
        prioridad: normalizedPriority,
        asignadoA: asignadoA || null,
        id: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER }
      },
      { autoCommit: true }
    );

    const id = insertResult.outBinds.id[0];
    return reply.code(201).send({ id, message: 'Incident created' });
  } catch (error) {
    app.log.error(error, 'Failed to create incident');
    return reply.code(500).send({ error: 'Error creating incident' });
  } finally {
    if (connection) {
      await connection.close();
    }
  }
});

// ── UPDATE INCIDENT (resolution + assigned) ───────────────────────────────────

app.patch('/api/incidents/:id', async (request, reply) => {
  const id = Number(request.params.id);
  if (!id || Number.isNaN(id)) {
    return reply.code(400).send({ error: 'Invalid incident id' });
  }

  const { solucion, asignadoA } = request.body || {};

  if (useMocks) {
    const incident = findIncidentById(id);
    if (!incident) return reply.code(404).send({ error: 'Incident not found' });
    if (solucion !== undefined) incident.SOLUCION = solucion;
    if (asignadoA !== undefined) incident.ASIGNADO_A = asignadoA;
    return { id, updated: true };
  }

  let connection;
  try {
    connection = await getConnection();
    const fields = [];
    const binds = { id };

    if (solucion !== undefined) { fields.push('SOLUCION = :solucion'); binds.solucion = solucion; }
    if (asignadoA !== undefined) { fields.push('ASIGNADO_A = :asignadoA'); binds.asignadoA = asignadoA; }

    if (fields.length === 0) {
      return reply.code(400).send({ error: 'No fields to update' });
    }

    await connection.execute(
      `UPDATE INCIDENCIAS SET ${fields.join(', ')} WHERE ID = :id`,
      binds,
      { autoCommit: true }
    );

    return { id, updated: true };
  } catch (error) {
    app.log.error(error, 'Failed to update incident');
    return reply.code(500).send({ error: 'Error updating incident' });
  } finally {
    if (connection) await connection.close();
  }
});

// ── ADVANCE STATUS ────────────────────────────────────────────────────────────

app.patch('/api/incidents/:id/status', async (request, reply) => {
  const id = Number(request.params.id);
  const { nextStatus, assignedTo } = request.body || {};

  if (!id || Number.isNaN(id)) {
    return reply.code(400).send({ error: 'Invalid incident id' });
  }

  const assignee = String(assignedTo || '').trim().toLowerCase();

  if (useMocks) {
    const incident = mockIncidents.find((item) => item.ID === id);
    if (!incident) {
      return reply.code(404).send({ error: 'Incident not found' });
    }

    const expectedNext = NEXT_STATUS_MAP[incident.ESTADO];
    if (!expectedNext) {
      return reply.code(400).send({ error: 'Incident is already in terminal state' });
    }

    if (nextStatus !== expectedNext) {
      return reply.code(400).send({
        error: `Invalid transition. Expected ${expectedNext} from ${incident.ESTADO}`
      });
    }

    if (nextStatus === 'ASIGNADA') {
      if (!assignee) {
        return reply.code(400).send({ error: 'assignedTo is required when transitioning to ASIGNADA' });
      }
      if (!SUPPORT_USERS.includes(assignee)) {
        return reply.code(400).send({ error: 'assignedTo must be a valid user from /api/users' });
      }
      incident.ASIGNADO_A = assignee;
    }

    const currentStatus = incident.ESTADO;
    incident.ESTADO = nextStatus;
    if (!incident.HISTORIAL) incident.HISTORIAL = [];
    incident.HISTORIAL.push({
      ESTADO: nextStatus,
      FECHA: new Date().toISOString(),
      COMENTARIO:
        nextStatus === 'ASIGNADA'
          ? `Estado actualizado a ASIGNADA · responsable: ${incident.ASIGNADO_A}`
          : `Estado actualizado a ${nextStatus}`
    });
    if (nextStatus === 'SOLUCIONADA' || nextStatus === 'CERRADA') {
      incident.FECHA_RESOLUCION = new Date().toISOString();
    }
    return { id, from: currentStatus, to: nextStatus, mode: 'mock' };
  }

  let connection;
  try {
    connection = await getConnection();

    const currentResult = await connection.execute(
      `SELECT ESTADO FROM INCIDENCIAS WHERE ID = :id`,
      { id }
    );

    if (!currentResult.rows || currentResult.rows.length === 0) {
      return reply.code(404).send({ error: 'Incident not found' });
    }

    const currentStatus = currentResult.rows[0].ESTADO;
    const expectedNext = NEXT_STATUS_MAP[currentStatus];

    if (!expectedNext) {
      return reply.code(400).send({ error: 'Incident is already in terminal state' });
    }

    if (nextStatus !== expectedNext) {
      return reply.code(400).send({
        error: `Invalid transition. Expected ${expectedNext} from ${currentStatus}`
      });
    }

    if (nextStatus === 'ASIGNADA') {
      if (!assignee) {
        return reply.code(400).send({ error: 'assignedTo is required when transitioning to ASIGNADA' });
      }
      if (!SUPPORT_USERS.includes(assignee)) {
        return reply.code(400).send({ error: 'assignedTo must be a valid user from /api/users' });
      }
    }

    await connection.execute(
      `UPDATE INCIDENCIAS
       SET ESTADO = :nextStatus,
           ASIGNADO_A = CASE WHEN :assignee IS NULL THEN ASIGNADO_A ELSE :assignee END
       WHERE ID = :id`,
      {
        id,
        nextStatus,
        assignee: nextStatus === 'ASIGNADA' ? assignee : null
      },
      { autoCommit: true }
    );

    return { id, from: currentStatus, to: nextStatus };
  } catch (error) {
    app.log.error(error, 'Failed to update status');
    return reply.code(500).send({ error: 'Error updating status' });
  } finally {
    if (connection) {
      await connection.close();
    }
  }
});

app.get('/api/playbooks/:id', async (request, reply) => {
  const id = Number(request.params.id);
  if (!id || Number.isNaN(id)) {
    return reply.code(400).send({ error: 'Invalid playbook id' });
  }

  if (useMocks) {
    const playbook = findPlaybookById(id);
    if (!playbook) {
      return reply.code(404).send({ error: 'Playbook not found' });
    }
    return { data: playbook };
  }

  let connection;
  try {
    connection = await getConnection();
    const result = await connection.execute(
      `SELECT ID, ERROR_MATCH, PROCEDIMIENTO_CLOB, LINKS_INTERNOS
       FROM PLAYBOOKS
       WHERE ID = :id`,
      { id }
    );

    if (!result.rows || result.rows.length === 0) {
      return reply.code(404).send({ error: 'Playbook not found' });
    }

    return { data: result.rows[0] };
  } catch (error) {
    app.log.error(error, 'Failed to fetch playbook');
    return reply.code(500).send({ error: 'Error fetching playbook' });
  } finally {
    if (connection) {
      await connection.close();
    }
  }
});

app.get('/api/lookup', async (request, reply) => {
  const q = String(request.query.q || '').trim();

  if (!q || q.length < 2) {
    return { data: [] };
  }

  if (useMocks) {
    return { data: lookupPlaybooksMock(q) };
  }

  let connection;
  try {
    connection = await getConnection();

    const result = await connection.execute(
      `SELECT *
       FROM (
         SELECT
           ID,
           ERROR_MATCH,
           PROCEDIMIENTO_CLOB,
           LINKS_INTERNOS,
           GREATEST(
             UTL_MATCH.JARO_WINKLER_SIMILARITY(UPPER(ERROR_MATCH), UPPER(:q)),
             UTL_MATCH.JARO_WINKLER_SIMILARITY(UPPER(:q), UPPER(ERROR_MATCH))
           ) AS SCORE
         FROM PLAYBOOKS
         WHERE UPPER(ERROR_MATCH) LIKE '%' || UPPER(:q) || '%'
            OR UPPER(:q) LIKE '%' || UPPER(ERROR_MATCH) || '%'
            OR UTL_MATCH.JARO_WINKLER_SIMILARITY(UPPER(ERROR_MATCH), UPPER(:q)) >= 78
       )
       ORDER BY SCORE DESC, ID DESC
       FETCH FIRST 10 ROWS ONLY`,
      { q }
    );

    return { data: result.rows || [] };
  } catch (error) {
    app.log.error(error, 'Failed to perform lookup');
    return reply.code(500).send({ error: 'Error in lookup' });
  } finally {
    if (connection) {
      await connection.close();
    }
  }
});

app.setErrorHandler((error, _, reply) => {
  app.log.error(error);
  reply.code(500).send({ error: 'Internal server error' });
});

async function start() {
  try {
    app.log.info({ useMocks }, 'Starting DB-Guardian API');
    await app.listen({
      port: Number(process.env.PORT || 3001),
      host: process.env.HOST || '0.0.0.0'
    });
  } catch (error) {
    app.log.error(error);
    process.exit(1);
  }
}

const close = async () => {
  try {
    if (pool) {
      await pool.close(10);
    }
    await app.close();
  } catch (error) {
    app.log.error(error, 'Error during shutdown');
  } finally {
    process.exit(0);
  }
};

process.on('SIGINT', close);
process.on('SIGTERM', close);

start();
