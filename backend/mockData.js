const now = new Date();

function ago(minutesAgo = 0) {
  return new Date(now.getTime() - minutesAgo * 60 * 1000).toISOString();
}

/** @deprecated use ago() */
function toIsoOffset(minutesAgo = 0) { return ago(minutesAgo); }

export const KNOWN_APPS = [
  'DPMTOOLS',
  'Valeexchange',
  'ProcesosHistoricos',
  'RiskEngine',
  'PaymentsCore'
];

export const mockPlaybooks = [
  {
    ID: 101,
    ERROR_MATCH: 'ORA-00054',
    PROCEDIMIENTO_CLOB: `# ORA-00054 — Resource Busy

## Síntomas
El DDL queda bloqueado esperando un lock exclusivo sobre el objeto.

## Diagnóstico

\`\`\`sql
SELECT s.sid, s.serial#, s.username, s.status, s.machine,
       l.type, l.lmode, l.request
FROM   v$session s
JOIN   v$lock    l ON s.sid = l.sid
WHERE  l.block = 1;
\`\`\`

## Procedimiento

1. Identificar la sesión bloqueadora con la consulta anterior.
2. Contactar al responsable del proceso bloqueador para coordinación.
3. Si no hay respuesta en 15 min, escalar a DBA para kill de sesión.
4. Ejecutar el DDL en la ventana liberada.

## Acción preventiva
Ajustar el scheduler para evitar solapamiento de procesos DDL con sesiones de reporting.`,
    LINKS_INTERNOS: 'https://intranet.db.local/playbooks/ora-00054'
  },
  {
    ID: 102,
    ERROR_MATCH: 'TIMEOUT JDBC POOL',
    PROCEDIMIENTO_CLOB: `# Timeout JDBC Connection Pool

## Síntomas
Requests devuelven timeout. Logs muestran \`Cannot get a connection, pool error Timeout waiting for idle object\`.

## Procedimiento

1. Incrementar temporalmente \`maxActive\` en la configuración del datasource.
2. Identificar y corregir leaks con stack trace de apertura de conexiones.
3. Revisar sesiones zombie en Oracle: \`STATUS='INACTIVE'\` con tiempo elevado.
4. Reiniciar el pool de la aplicación con ventana de cambio.`,
    LINKS_INTERNOS: 'https://intranet.db.local/playbooks/jdbc-timeout'
  },
  {
    ID: 103,
    ERROR_MATCH: 'ORA-12170',
    PROCEDIMIENTO_CLOB: `# ORA-12170 — TNS Connect Timeout

## Procedimiento

1. Verificar disponibilidad del listener: \`lsnrctl status\`.
2. Confirmar reachability de red: \`ping\` y \`traceroute\` al host Oracle.
3. Revisar firewall y ACL internas (puerto 1521).
4. Verificar parámetros de timeout en \`sqlnet.ora\`.
5. Contactar a DBA para revisión del listener si persiste.`,
    LINKS_INTERNOS: 'https://intranet.db.local/playbooks/ora-12170'
  },
  {
    ID: 104,
    ERROR_MATCH: 'NullPointerException batch',
    PROCEDIMIENTO_CLOB: `# NullPointerException en proceso batch

## Procedimiento

1. Revisar el stack trace completo en los logs de la aplicación.
2. Identificar el campo o referencia nula que causa la excepción.
3. Verificar la integridad de los datos de entrada (campos vacíos/null inesperados).
4. Aplicar guard clauses o validaciones de entrada en el código.
5. Re-ejecutar el proceso con los datos corregidos.`,
    LINKS_INTERNOS: 'https://intranet.db.local/playbooks/npe'
  },
  {
    ID: 105,
    ERROR_MATCH: 'ORA-01017 invalid username password',
    PROCEDIMIENTO_CLOB: `# ORA-01017 — Invalid Username/Password

## Procedimiento

1. Verificar credenciales en el gestor de secretos (Vault/properties).
2. Comprobar si hubo rotación de credenciales no propagada.
3. Verificar cuenta Oracle no bloqueada:

\`\`\`sql
SELECT account_status FROM dba_users WHERE username = 'PAYMENTS_SVC';
\`\`\`

4. Actualizar contraseña en el datasource y reiniciar la aplicación.

## Acción preventiva
Migrar datasources a lectura directa desde Vault para propagación automática.`,
    LINKS_INTERNOS: 'https://intranet.db.local/playbooks/ora-01017'
  }
];

export const mockIncidents = [
  {
    ID: 9001,
    APP_NAME: 'DPMTOOLS',
    ERROR_CODE: 'ORA-00054',
    TITULO: 'Bloqueo DDL en tabla de posiciones durante cierre diario',
    DESCRIPCION: 'La tarea de cierre diario lanza un ALTER TABLE que queda bloqueado por sesiones de reporting activas. Impacto: retraso en el cierre nocturno de 45 minutos. Detectado por alerta de monitorización a las 01:15.',
    ESTADO: 'SOLUCIONADA',
    PRIORIDAD: 'ALTA',
    ASIGNADO_A: 'Carlos M.',
    SOLUCION: `## Solución aplicada

**Causa raíz**: La sesión de reporting overnight (SID 147, usuario REPORT_USER) mantenía un lock compartido sobre la tabla POSICIONES_DIARIAS mientras el batch de cierre intentaba ejecutar un DDL.

### Pasos ejecutados

1. Identificada la sesión bloqueadora mediante \`V$LOCK\` y \`V$SESSION\`.
2. Contactado el equipo de reporting: proceso no crítico, se podía detener.
3. Parada controlada del proceso de reporting a las 02:00.
4. DDL ejecutado satisfactoriamente a las 02:05.

### Acción preventiva

Añadido control en el scheduler de cierre para verificar ausencia de locks antes de ejecutar DDL. El proceso de reporting se ha movido a las 03:00.

**Tiempo de resolución**: 45 minutos.`,
    FECHA_ALTA: ago(5 * 24 * 60),
    FECHA_RESOLUCION: ago(4 * 24 * 60 + 45),
    HISTORIAL: [
      { ESTADO: 'NUEVA', FECHA: ago(5 * 24 * 60), COMENTARIO: 'Incidencia registrada por alerta automática de monitorización' },
      { ESTADO: 'ASIGNADA', FECHA: ago(5 * 24 * 60 - 10), COMENTARIO: 'Asignada a Carlos M. por guardia de DBA' },
      { ESTADO: 'EN INVESTIGACIÓN', FECHA: ago(5 * 24 * 60 - 20), COMENTARIO: 'Revisando locks activos en V$LOCK y V$SESSION' },
      { ESTADO: 'SOLUCIONADA', FECHA: ago(4 * 24 * 60 + 45), COMENTARIO: 'DDL ejecutado tras parada controlada del proceso de reporting' }
    ]
  },
  {
    ID: 9002,
    APP_NAME: 'Valeexchange',
    ERROR_CODE: 'TIMEOUT JDBC POOL',
    TITULO: 'Degradación del servicio API de valoración por timeout en pool de conexiones',
    DESCRIPCION: 'Los endpoints de valoración devuelven errores HTTP 503 intermitentes. Los logs muestran "Cannot get a connection, pool error Timeout waiting for idle object". Afecta a los procesos de pricing en tiempo real.',
    ESTADO: 'EN INVESTIGACIÓN',
    PRIORIDAD: 'ALTA',
    ASIGNADO_A: 'Ana R.',
    SOLUCION: null,
    FECHA_ALTA: ago(2 * 24 * 60 + 30),
    FECHA_RESOLUCION: null,
    HISTORIAL: [
      { ESTADO: 'NUEVA', FECHA: ago(2 * 24 * 60 + 30), COMENTARIO: 'Detectado por alertas de Dynatrace' },
      { ESTADO: 'ASIGNADA', FECHA: ago(2 * 24 * 60 + 20), COMENTARIO: 'Asignada a Ana R.' },
      { ESTADO: 'EN INVESTIGACIÓN', FECHA: ago(2 * 24 * 60 + 10), COMENTARIO: 'Revisando métricas de pool y sesiones Oracle activas' }
    ]
  },
  {
    ID: 9003,
    APP_NAME: 'ProcesosHistoricos',
    ERROR_CODE: 'NPE-BATCH-001',
    TITULO: 'NullPointerException en proceso de consolidación histórica Q1',
    DESCRIPCION: 'El proceso batch de consolidación de históricos del Q1 falla con NullPointerException al procesar registros de la entidad IBERIA_TRADES. Error en ConsolidadorService.java:284. Se procesan 0 de 14.820 registros.',
    ESTADO: 'ASIGNADA',
    PRIORIDAD: 'MEDIA',
    ASIGNADO_A: 'Luis P.',
    SOLUCION: null,
    FECHA_ALTA: ago(1 * 24 * 60 + 15),
    FECHA_RESOLUCION: null,
    HISTORIAL: [
      { ESTADO: 'NUEVA', FECHA: ago(1 * 24 * 60 + 15), COMENTARIO: 'Reportado por equipo de operaciones tras fallo del batch nocturno' },
      { ESTADO: 'ASIGNADA', FECHA: ago(1 * 24 * 60), COMENTARIO: 'Asignada a Luis P. para análisis del stack trace' }
    ]
  },
  {
    ID: 9004,
    APP_NAME: 'RiskEngine',
    ERROR_CODE: 'ORA-12170',
    TITULO: 'Pérdida de conectividad Oracle en cálculo de VaR nocturno',
    DESCRIPCION: 'El motor de cálculo de Value at Risk pierde conectividad con la base de datos durante la ejecución nocturna. TNS Connect Timeout. El cálculo queda incompleto y los informes de riesgo de la mañana no están disponibles para los traders.',
    ESTADO: 'ESCALADA',
    PRIORIDAD: 'ALTA',
    ASIGNADO_A: 'Equipo DBA',
    SOLUCION: null,
    FECHA_ALTA: ago(18 * 60),
    FECHA_RESOLUCION: null,
    HISTORIAL: [
      { ESTADO: 'NUEVA', FECHA: ago(18 * 60), COMENTARIO: 'Alerta automática del sistema de monitorización de RiskEngine' },
      { ESTADO: 'ASIGNADA', FECHA: ago(17 * 60 + 45), COMENTARIO: 'Asignada a Equipo DBA' },
      { ESTADO: 'EN INVESTIGACIÓN', FECHA: ago(17 * 60 + 30), COMENTARIO: 'Revisando estado del listener y conectividad de red' },
      { ESTADO: 'ESCALADA', FECHA: ago(16 * 60), COMENTARIO: 'Escalado a infraestructura por posible problema de firewall/ACL' }
    ]
  },
  {
    ID: 9005,
    APP_NAME: 'DPMTOOLS',
    ERROR_CODE: 'INDEX-OOB-047',
    TITULO: 'IndexOutOfBoundsException en exportación de reportes PDF con más de 500 filas',
    DESCRIPCION: 'La exportación de reportes PDF en DPMTOOLS falla al procesar reportes con más de 500 registros. Error en PDFExporter.java:198 al iterar la lista de filas. Reportado por el equipo de producto.',
    ESTADO: 'NUEVA',
    PRIORIDAD: 'BAJA',
    ASIGNADO_A: null,
    SOLUCION: null,
    FECHA_ALTA: ago(4 * 60),
    FECHA_RESOLUCION: null,
    HISTORIAL: [
      { ESTADO: 'NUEVA', FECHA: ago(4 * 60), COMENTARIO: 'Reportado por usuario vía Helpdesk (ticket HLP-8821)' }
    ]
  },
  {
    ID: 9006,
    APP_NAME: 'PaymentsCore',
    ERROR_CODE: 'ORA-01017',
    TITULO: 'Fallo de autenticación en cuenta de servicio tras rotación de credenciales',
    DESCRIPCION: 'Tras la rotación programada de credenciales del viernes, la cuenta de servicio PAYMENTS_SVC no pudo autenticarse en Oracle. ORA-01017: invalid username/password. Impacto: servicio de pagos fuera de línea durante 20 minutos.',
    ESTADO: 'CERRADA',
    PRIORIDAD: 'ALTA',
    ASIGNADO_A: 'Marta G.',
    SOLUCION: `## Solución aplicada

**Causa raíz**: La rotación de credenciales actualiza las contraseñas en Vault pero no se propagó al datasource de PaymentsCore, que leía las credenciales de un fichero \`application.properties\` local no gestionado por Vault.

### Pasos ejecutados

1. Identificado el error ORA-01017 en los logs de arranque de la aplicación.
2. Verificado que la credencial en Vault era correcta y estaba actualizada.
3. Detectado que el datasource leía la contraseña del fichero properties local.
4. Actualizada la contraseña en \`application.properties\` con la nueva credencial de Vault.
5. Reiniciada la aplicación PaymentsCore. Servicio restaurado en 20 minutos.

### Acción preventiva

- **Ticket INFRA-2847**: Migración del datasource a lectura directa desde Vault.
- Añadido al checklist de rotación de credenciales: verificar arranque de PaymentsCore.

**Tiempo de resolución**: 20 minutos.`,
    FECHA_ALTA: ago(8 * 24 * 60),
    FECHA_RESOLUCION: ago(8 * 24 * 60 - 20),
    HISTORIAL: [
      { ESTADO: 'NUEVA', FECHA: ago(8 * 24 * 60), COMENTARIO: 'Alerta inmediata de disponibilidad tras rotación de credenciales' },
      { ESTADO: 'ASIGNADA', FECHA: ago(8 * 24 * 60 - 5), COMENTARIO: 'Asignada a Marta G.' },
      { ESTADO: 'EN INVESTIGACIÓN', FECHA: ago(8 * 24 * 60 - 10), COMENTARIO: 'Revisando logs de arranque de PaymentsCore' },
      { ESTADO: 'SOLUCIONADA', FECHA: ago(8 * 24 * 60 - 20), COMENTARIO: 'Credencial actualizada en application.properties' },
      { ESTADO: 'CERRADA', FECHA: ago(7 * 24 * 60), COMENTARIO: 'Cerrada tras 24h de monitorización sin recurrencia' }
    ]
  },
  {
    ID: 9007,
    APP_NAME: 'Valeexchange',
    ERROR_CODE: 'HTTP-503-FEED',
    TITULO: 'Gateway 503 en integración con proveedor de feeds de tipos de cambio',
    DESCRIPCION: 'La integración con el proveedor externo de feeds de mercado devuelve HTTP 503 de forma continua desde las 09:15. Afecta a la actualización de tipos de cambio en tiempo real para todas las operaciones de Valeexchange.',
    ESTADO: 'NUEVA',
    PRIORIDAD: 'MEDIA',
    ASIGNADO_A: null,
    SOLUCION: null,
    FECHA_ALTA: ago(45),
    FECHA_RESOLUCION: null,
    HISTORIAL: [
      { ESTADO: 'NUEVA', FECHA: ago(45), COMENTARIO: 'Detectado por monitorización de integraciones externas' }
    ]
  },
  {
    ID: 9008,
    APP_NAME: 'ProcesosHistoricos',
    ERROR_CODE: 'ORA-01555',
    TITULO: 'Snapshot too old en consulta de conciliación mensual',
    DESCRIPCION: 'La consulta de conciliación mensual falla con ORA-01555 (snapshot too old). El proceso requiere leer datos consistentes de hace 6 horas y el UNDO tablespace no tiene suficiente retención configurada.',
    ESTADO: 'SOLUCIONADA',
    PRIORIDAD: 'MEDIA',
    ASIGNADO_A: 'Carlos M.',
    SOLUCION: `## Solución aplicada

**Causa raíz**: El parámetro \`UNDO_RETENTION\` no estaba ajustado para soportar consultas de larga duración. La conciliación mensual requiere consistencia de lectura de hasta 6 horas.

### Pasos ejecutados

1. Confirmado el error ORA-01555 en el log de la consulta de conciliación.
2. Revisado el valor de \`UNDO_RETENTION\` en la BD: era de 900 segundos (15 min).
3. Coordinado con DBA para incrementar \`UNDO_RETENTION\` a 21600 (6 horas).
4. Re-ejecutada la conciliación satisfactoriamente.

### Acción preventiva

Configurado \`UNDO_RETENTION = 21600\` de forma permanente. Revisadas otras consultas batch de larga duración.

**Tiempo de resolución**: 2 horas.`,
    FECHA_ALTA: ago(15 * 24 * 60),
    FECHA_RESOLUCION: ago(15 * 24 * 60 - 120),
    HISTORIAL: [
      { ESTADO: 'NUEVA', FECHA: ago(15 * 24 * 60), COMENTARIO: 'Error detectado en log de conciliación mensual' },
      { ESTADO: 'ASIGNADA', FECHA: ago(15 * 24 * 60 - 15), COMENTARIO: 'Asignada a Carlos M.' },
      { ESTADO: 'EN INVESTIGACIÓN', FECHA: ago(15 * 24 * 60 - 30), COMENTARIO: 'Analizando parámetros de UNDO y retención' },
      { ESTADO: 'SOLUCIONADA', FECHA: ago(15 * 24 * 60 - 120), COMENTARIO: 'UNDO_RETENTION incrementado y conciliación re-ejecutada' }
    ]
  }
];

export function nextIncidentId() {
  const max = mockIncidents.reduce((acc, item) => Math.max(acc, item.ID), 0);
  return max + 1;
}

export function findPlaybookById(id) {
  return mockPlaybooks.find((item) => item.ID === id) || null;
}

export function findIncidentById(id) {
  return mockIncidents.find((item) => item.ID === id) || null;
}

export function computeStats() {
  const byStatus = {};
  const byApp = {};

  for (const inc of mockIncidents) {
    byStatus[inc.ESTADO] = (byStatus[inc.ESTADO] || 0) + 1;
    byApp[inc.APP_NAME] = (byApp[inc.APP_NAME] || 0) + 1;
  }

  return { total: mockIncidents.length, byStatus, byApp };
}

function normalize(value) {
  return String(value || '').trim().toUpperCase();
}

function includesEither(a, b) {
  return a.includes(b) || b.includes(a);
}

function similarityScore(a, b) {
  if (!a || !b) return 0;
  if (a === b) return 100;

  const tokenA = new Set(a.split(/\s+/).filter(Boolean));
  const tokenB = new Set(b.split(/\s+/).filter(Boolean));

  let overlap = 0;
  for (const token of tokenA) {
    if (tokenB.has(token)) overlap += 1;
  }

  const base = Math.round((2 * overlap * 100) / (tokenA.size + tokenB.size || 1));
  return Math.max(base, includesEither(a, b) ? 82 : 0);
}

export function lookupPlaybooksMock(term) {
  const q = normalize(term);
  if (q.length < 2) return [];

  return mockPlaybooks
    .map((playbook) => ({
      ...playbook,
      SCORE: similarityScore(normalize(playbook.ERROR_MATCH), q)
    }))
    .filter((item) => item.SCORE >= 60 || includesEither(normalize(item.ERROR_MATCH), q))
    .sort((a, b) => b.SCORE - a.SCORE || b.ID - a.ID)
    .slice(0, 10);
}
