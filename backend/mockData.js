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
  },
  {
    ID: 9009,
    APP_NAME: 'DPMTOOLS',
    ERROR_CODE: 'ORA-00054',
    TITULO: 'Bloqueo puntual en job de índices durante ventana de mantenimiento',
    DESCRIPCION: 'Un job de mantenimiento intentó ejecutar un cambio estructural sobre índices mientras un proceso de reporting seguía activo. El síntoma fue el mismo ORA-00054 y una espera prolongada hasta liberar locks.',
    ESTADO: 'SOLUCIONADA',
    PRIORIDAD: 'MEDIA',
    ASIGNADO_A: 'Marta G.',
    SOLUCION: `## Solución aplicada

Se identificó que el job de índices estaba coincidiendo con el informe de cierres nocturnos. Se replanificó la ventana, se liberó la sesión que retenía el lock y el job se reintentó correctamente.

### Resultado

- La tarea se ejecutó en la siguiente ventana.
- Se añadió validación previa de locks en el scheduler.

**Tiempo de resolución**: 30 minutos.`,
    FECHA_ALTA: ago(11 * 24 * 60),
    FECHA_RESOLUCION: ago(11 * 24 * 60 - 30),
    HISTORIAL: [
      { ESTADO: 'NUEVA', FECHA: ago(11 * 24 * 60), COMENTARIO: 'Reportada por el scheduler de mantenimiento' },
      { ESTADO: 'ASIGNADA', FECHA: ago(11 * 24 * 60 - 6), COMENTARIO: 'Asignada a Marta G.' },
      { ESTADO: 'SOLUCIONADA', FECHA: ago(11 * 24 * 60 - 30), COMENTARIO: 'Replanificación de ventana y reintento del job' }
    ]
  },
  {
    ID: 9010,
    APP_NAME: 'Valeexchange',
    ERROR_CODE: 'HTTP-503-FEED',
    TITULO: 'Caída intermitente del proveedor externo de feeds de mercado',
    DESCRIPCION: 'La integración con el proveedor externo retornaba 503 y el sistema quedó en modo degradado hasta que se aplicó una política de reintento y fallback de caché.',
    ESTADO: 'CERRADA',
    PRIORIDAD: 'MEDIA',
    ASIGNADO_A: 'Ana R.',
    SOLUCION: `## Solución aplicada

Se introdujo un circuito de reintentos con backoff y un fallback a la última cotización válida en caché. El proveedor recuperó servicio sin impacto adicional para el negocio.

### Acciones preventivas

1. Configuración de alertas tempranas ante latencia del proveedor.
2. Cache de última lectura válida para evitar interrupciones visibles.

**Tiempo de resolución**: 25 minutos.`,
    FECHA_ALTA: ago(6 * 24 * 60),
    FECHA_RESOLUCION: ago(6 * 24 * 60 - 25),
    HISTORIAL: [
      { ESTADO: 'NUEVA', FECHA: ago(6 * 24 * 60), COMENTARIO: 'Detectado por monitorización de integraciones' },
      { ESTADO: 'ASIGNADA', FECHA: ago(6 * 24 * 60 - 5), COMENTARIO: 'Asignada a Ana R.' },
      { ESTADO: 'EN INVESTIGACIÓN', FECHA: ago(6 * 24 * 60 - 12), COMENTARIO: 'Validando SLA del proveedor externo' },
      { ESTADO: 'SOLUCIONADA', FECHA: ago(6 * 24 * 60 - 25), COMENTARIO: 'Aplicado reintento con fallback a caché' },
      { ESTADO: 'CERRADA', FECHA: ago(5 * 24 * 60), COMENTARIO: 'Cierre tras 48h sin recurrencia' }
    ]
  },
  {
    ID: 9011,
    APP_NAME: 'ProcesosHistoricos',
    ERROR_CODE: 'NPE-BATCH-001',
    TITULO: 'NullPointerException en consolidación histórica por registros vacíos',
    DESCRIPCION: 'El batch de consolidación lanzaba NPE al encontrar entidades vacías en un lote heredado. La solución aplicó guard clauses y saneo previo del input.',
    ESTADO: 'SOLUCIONADA',
    PRIORIDAD: 'MEDIA',
    ASIGNADO_A: 'Luis P.',
    SOLUCION: `## Solución aplicada

Se localizó una lista con registros incompletos que no pasaban validación. Se aplicaron comprobaciones nulas antes de procesar la entidad y se descartaron registros corruptos del lote.

### Resultado

- El batch finalizó correctamente.
- Se añadió logging específico para detectar entradas vacías.

**Tiempo de resolución**: 55 minutos.`,
    FECHA_ALTA: ago(9 * 24 * 60),
    FECHA_RESOLUCION: ago(9 * 24 * 60 - 55),
    HISTORIAL: [
      { ESTADO: 'NUEVA', FECHA: ago(9 * 24 * 60), COMENTARIO: 'Incidencia detectada al consolidar históricos' },
      { ESTADO: 'ASIGNADA', FECHA: ago(9 * 24 * 60 - 8), COMENTARIO: 'Asignada a Luis P.' },
      { ESTADO: 'SOLUCIONADA', FECHA: ago(9 * 24 * 60 - 55), COMENTARIO: 'Guard clauses y saneo de registros' }
    ]
  },
  {
    ID: 9012,
    APP_NAME: 'DPMTOOLS',
    ERROR_CODE: 'INDEX-OOB-047',
    TITULO: 'Desbordamiento al exportar reportes PDF grandes',
    DESCRIPCION: 'Una exportación masiva provocaba IndexOutOfBoundsException cuando el conjunto de filas superaba un umbral concreto. Se corrigió el iterador y se limitó el tamaño del lote.',
    ESTADO: 'SOLUCIONADA',
    PRIORIDAD: 'BAJA',
    ASIGNADO_A: 'Carlos M.',
    SOLUCION: `## Solución aplicada

Se revisó el iterador que recorría las filas del PDF y se detectó un acceso fuera de rango cuando el lote superaba 500 filas. Se ajustó la lógica de paginado y el proceso quedó estabilizado.

**Tiempo de resolución**: 40 minutos.`,
    FECHA_ALTA: ago(13 * 24 * 60),
    FECHA_RESOLUCION: ago(13 * 24 * 60 - 40),
    HISTORIAL: [
      { ESTADO: 'NUEVA', FECHA: ago(13 * 24 * 60), COMENTARIO: 'Incidencia reportada por producto' },
      { ESTADO: 'ASIGNADA', FECHA: ago(13 * 24 * 60 - 7), COMENTARIO: 'Asignada a Carlos M.' },
      { ESTADO: 'SOLUCIONADA', FECHA: ago(13 * 24 * 60 - 40), COMENTARIO: 'Corrección del iterador de exportación' }
    ]
  },
  {
    ID: 9013,
    APP_NAME: 'RiskEngine',
    ERROR_CODE: 'ORA-12170',
    TITULO: 'Timeout de conexión Oracle en cálculo de riesgo por congestión de red',
    DESCRIPCION: 'El cálculo nocturno de VaR se interrumpía por timeouts de red en el listener. La incidencia se resolvió ajustando el listener y la ventana de ejecución.',
    ESTADO: 'SOLUCIONADA',
    PRIORIDAD: 'ALTA',
    ASIGNADO_A: 'Equipo DBA',
    SOLUCION: `## Solución aplicada

Se validó el listener de Oracle y se detectó congestión temporal de red en la franja de ejecución nocturna. Se adelantó la ventana y se coordinó con infraestructura la estabilización del canal.

### Medidas adoptadas

1. Revisión del listener.
2. Ajuste temporal de la ventana batch.
3. Seguimiento de métricas de red durante 72h.

**Tiempo de resolución**: 1 hora y 20 minutos.`,
    FECHA_ALTA: ago(20 * 60),
    FECHA_RESOLUCION: ago(20 * 60 - 80),
    HISTORIAL: [
      { ESTADO: 'NUEVA', FECHA: ago(20 * 60), COMENTARIO: 'Alertas de timeout durante el cálculo nocturno' },
      { ESTADO: 'ASIGNADA', FECHA: ago(20 * 60 - 10), COMENTARIO: 'Asignada a Equipo DBA' },
      { ESTADO: 'SOLUCIONADA', FECHA: ago(20 * 60 - 80), COMENTARIO: 'Listener validado y ventana ajustada' }
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

const SOLVED_STATUSES = new Set(['SOLUCIONADA', 'CERRADA']);

function stripMarkdown(value) {
  return String(value || '')
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/[#*_>`~()[\]{}|]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function normalize(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, ' ')
    .trim()
    .toUpperCase();
}

function includesEither(a, b) {
  return a.includes(b) || b.includes(a);
}

function tokenize(value) {
  return new Set(
    normalize(value)
      .split(/\s+/)
      .filter((token) => token.length > 1)
  );
}

function codeFamily(value) {
  const match = String(value || '').toUpperCase().match(/^[A-Z]+/);
  return match ? match[0] : '';
}

function overlapScore(leftValue, rightValue, maxScore) {
  const left = tokenize(leftValue);
  const right = tokenize(rightValue);
  if (left.size === 0 || right.size === 0) return 0;

  let overlap = 0;
  for (const token of left) {
    if (right.has(token)) overlap += 1;
  }

  const ratio = overlap / Math.max(left.size, right.size);
  return Math.round(ratio * maxScore);
}

function reasonListJoin(reasons) {
  return reasons.slice(0, 3);
}

export function scoreResolvedIncident(candidate, source) {
  if (!candidate || !source) return null;
  if (!SOLVED_STATUSES.has(candidate.ESTADO) || !String(candidate.SOLUCION || '').trim()) return null;

  const sourceAppRaw = source.APP_NAME ?? source.appName ?? source.app_name ?? '';
  const sourceErrorRaw = source.ERROR_CODE ?? source.errorCode ?? source.error_code ?? '';
  const sourceTitleRaw = source.TITULO ?? source.titulo ?? source.title ?? '';
  const sourceDescriptionRaw = source.DESCRIPCION ?? source.descripcion ?? source.description ?? '';

  const sourceApp = normalize(sourceAppRaw);
  const sourceError = normalize(sourceErrorRaw);
  const sourceTitle = normalize(sourceTitleRaw);
  const sourceDescription = normalize(sourceDescriptionRaw);
  const sourceContext = `${sourceAppRaw} ${sourceErrorRaw} ${sourceTitleRaw} ${sourceDescriptionRaw}`;

  const candidateApp = normalize(candidate.APP_NAME);
  const candidateError = normalize(candidate.ERROR_CODE);
  const candidateTitle = normalize(candidate.TITULO);
  const candidateDescription = normalize(candidate.DESCRIPCION);
  const candidateSolution = normalize(stripMarkdown(candidate.SOLUCION));

  let score = 0;
  const reasons = [];

  if (sourceApp && candidateApp && sourceApp === candidateApp) {
    score += 28;
    reasons.push('Misma aplicación');
  }

  if (sourceError && candidateError && sourceError === candidateError) {
    score += 48;
    reasons.push('Mismo código de error');
  } else if (codeFamily(sourceError) && codeFamily(sourceError) === codeFamily(candidateError)) {
    score += 14;
    reasons.push('Misma familia de error');
  }

  const titleScore = overlapScore(sourceTitle, candidateTitle, 24);
  if (titleScore >= 10) {
    score += titleScore;
    reasons.push('Títulos relacionados');
  }

  const descriptionScore = overlapScore(sourceDescription, candidateDescription, 14);
  if (descriptionScore >= 6) {
    score += descriptionScore;
    reasons.push('Descripción con términos comunes');
  }

  const contextScore = overlapScore(sourceContext, candidateSolution, 10);
  if (contextScore >= 4) {
    score += contextScore;
    reasons.push('La solución histórica usa términos similares');
  }

  if (sourceApp && candidateApp && sourceApp === candidateApp && sourceError && candidateError && sourceError !== candidateError) {
    score += 4;
  }

  const finalScore = Math.min(score, 100);

  if (finalScore < 25) return null;

  return {
    ...candidate,
    SCORE: finalScore,
    REASONS: reasonListJoin(reasons),
    SOLUTION_EXCERPT: stripMarkdown(candidate.SOLUCION).slice(0, 220)
  };
}

export function rankResolvedIncidents(source, incidents, { excludeId } = {}) {
  return (incidents || [])
    .filter((incident) => incident && (!excludeId || Number(incident.ID) !== Number(excludeId)))
    .map((incident) => scoreResolvedIncident(incident, source))
    .filter(Boolean)
    .sort((a, b) => b.SCORE - a.SCORE || new Date(b.FECHA_RESOLUCION || 0) - new Date(a.FECHA_RESOLUCION || 0))
    .slice(0, 5);
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
