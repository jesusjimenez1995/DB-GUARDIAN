import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Chip,
  FormControl,
  InputLabel,
  LinearProgress,
  MenuItem,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography
} from '@mui/material';
import { fetchIncidents } from '../api';
import PriorityBadge from '../components/PriorityBadge';
import StatusBadge from '../components/StatusBadge';
import { STATUS_FLOW } from '../constants';

const ALL_APPS = ['Todas', 'DPMTOOLS', 'Valeexchange', 'ProcesosHistoricos', 'RiskEngine', 'PaymentsCore'];
const PRIORITIES = ['Todas', 'ALTA', 'MEDIA', 'BAJA'];

function fmt(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('es-ES', {
    day: '2-digit', month: 'short', year: 'numeric'
  });
}

function IncidentList() {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterApp, setFilterApp] = useState('Todas');
  const [filterStatus, setFilterStatus] = useState('Todos');
  const [filterPriority, setFilterPriority] = useState('Todas');

  useEffect(() => {
    fetchIncidents()
      .then((res) => setIncidents(res.data || []))
      .finally(() => setLoading(false));
  }, []);

  const q = search.toLowerCase();
  const filtered = incidents.filter((inc) => {
    const matchSearch =
      !q ||
      inc.TITULO.toLowerCase().includes(q) ||
      inc.ERROR_CODE.toLowerCase().includes(q) ||
      inc.APP_NAME.toLowerCase().includes(q) ||
      (inc.ASIGNADO_A || '').toLowerCase().includes(q);

    return (
      matchSearch &&
      (filterApp === 'Todas' || inc.APP_NAME === filterApp) &&
      (filterStatus === 'Todos' || inc.ESTADO === filterStatus) &&
      (filterPriority === 'Todas' || inc.PRIORIDAD === filterPriority)
    );
  });

  return (
    <Stack spacing={2}>
      <Box>
        <Typography variant="h4">Libro Maestro de Incidencias</Typography>
        <Typography color="text.secondary">
          Filtra por aplicacion, criticidad y estado para priorizar el backlog operativo.
        </Typography>
      </Box>

      <Card>
        <CardContent>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))', lg: 'minmax(0, 2fr) repeat(3, minmax(0, 1fr)) auto' },
              gap: 1.2,
              alignItems: 'center'
            }}
          >
            <TextField
              sx={{ minWidth: 260, flex: 1 }}
              placeholder="Buscar por título, error, aplicación o responsable..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            <FormControl sx={{ minWidth: 180 }}>
              <InputLabel>Aplicacion</InputLabel>
              <Select
                label="Aplicacion"
          value={filterApp}
          onChange={(e) => setFilterApp(e.target.value)}
              >
                {ALL_APPS.map((a) => <MenuItem key={a} value={a}>{a}</MenuItem>)}
              </Select>
            </FormControl>

            <FormControl sx={{ minWidth: 190 }}>
              <InputLabel>Estado</InputLabel>
              <Select
                label="Estado"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
              >
                {['Todos', ...STATUS_FLOW].map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
              </Select>
            </FormControl>

            <FormControl sx={{ minWidth: 160 }}>
              <InputLabel>Prioridad</InputLabel>
              <Select
                label="Prioridad"
          value={filterPriority}
          onChange={(e) => setFilterPriority(e.target.value)}
              >
                {PRIORITIES.map((p) => <MenuItem key={p} value={p}>{p}</MenuItem>)}
              </Select>
            </FormControl>

            <Chip label={`${filtered.length} de ${incidents.length}`} sx={{ fontWeight: 700, ml: { lg: 'auto' } }} />
          </Box>
        </CardContent>
      </Card>

      {loading ? (
        <LinearProgress />
      ) : (
        <Card>
          <CardContent sx={{ p: 0 }}>
            <TableContainer>
              <Table size="small" sx={{ minWidth: 860 }}>
                <TableHead>
                  <TableRow sx={{ bgcolor: '#F9FAFB' }}>
                    <TableCell>ID</TableCell>
                    <TableCell>Aplicacion</TableCell>
                    <TableCell>Titulo</TableCell>
                    <TableCell>Codigo Error</TableCell>
                    <TableCell>Prioridad</TableCell>
                    <TableCell>Estado</TableCell>
                    <TableCell>Responsable</TableCell>
                    <TableCell>Fecha</TableCell>
                    <TableCell>Sol.</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} sx={{ py: 6, textAlign: 'center', color: 'text.secondary' }}>
                    No hay incidencias con los filtros actuales.
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((inc) => (
                  <TableRow
                    key={inc.ID}
                    hover
                  >
                    <TableCell sx={{ color: 'text.secondary' }}>#{inc.ID}</TableCell>
                    <TableCell>
                      <Chip size="small" label={inc.APP_NAME} sx={{ bgcolor: '#F2F4F7', fontWeight: 700 }} />
                    </TableCell>
                    <TableCell sx={{ maxWidth: 340 }}>
                      <Typography
                        component={Link}
                        to={`/incidencias/${inc.ID}`}
                        sx={{ color: 'text.primary', textDecoration: 'none', fontWeight: 600 }}
                      >
                        {inc.TITULO}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ fontFamily: 'monospace', color: 'text.secondary' }}>{inc.ERROR_CODE}</TableCell>
                    <TableCell><PriorityBadge priority={inc.PRIORIDAD} /></TableCell>
                    <TableCell><StatusBadge status={inc.ESTADO} /></TableCell>
                    <TableCell sx={{ color: 'text.secondary' }}>{inc.ASIGNADO_A || '—'}</TableCell>
                    <TableCell sx={{ color: 'text.secondary' }}>{fmt(inc.FECHA_ALTA)}</TableCell>
                    <TableCell>
                      {inc.SOLUCION
                        ? <Typography color="success.main" fontWeight={700}>Si</Typography>
                        : <Typography color="text.disabled">—</Typography>}
                    </TableCell>
                  </TableRow>
                ))
              )}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}
    </Stack>
  );
}

export default IncidentList;
