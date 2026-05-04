import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  LinearProgress,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography
} from '@mui/material';
import { fetchIncidents, fetchStats } from '../api';
import KpiCard from '../components/KpiCard';
import PriorityBadge from '../components/PriorityBadge';
import StatusBadge from '../components/StatusBadge';

const STATUS_KPI = [
  { key: 'NUEVA', tone: '#667085' },
  { key: 'ASIGNADA', tone: '#175CD3' },
  { key: 'EN INVESTIGACIÓN', tone: '#B54708', label: 'Investigación' },
  { key: 'ESCALADA', tone: '#C4320A' }
];

function fmt(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' });
}

function Dashboard() {
  const [stats, setStats] = useState(null);
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([fetchStats(), fetchIncidents()])
      .then(([sRes, iRes]) => {
        setStats(sRes.data);
        setIncidents((iRes.data || []).slice(0, 6));
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <LinearProgress sx={{ mt: 2 }} />;
  }

  const open = (stats?.total || 0)
    - (stats?.byStatus?.SOLUCIONADA || 0)
    - (stats?.byStatus?.CERRADA || 0);

  const resolved = (stats?.byStatus?.SOLUCIONADA || 0) + (stats?.byStatus?.CERRADA || 0);

  return (
    <Stack spacing={2.4}>
      <Box>
        <Typography variant="overline" color="primary.main" sx={{ letterSpacing: 1.4 }}>
          Operations Pulse
        </Typography>
        <Typography variant="h4">Centro de Control de Incidencias</Typography>
        <Typography color="text.secondary" sx={{ mt: 0.5 }}>
          Supervisa riesgo operativo, saturacion por aplicacion y velocidad de resolucion del equipo.
        </Typography>
      </Box>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' },
          gap: 2
        }}
      >
          <KpiCard label="Total registradas" value={stats?.total || 0} color="blue" />
          <KpiCard label="Abiertas" value={open} color="amber" />
          <KpiCard label="Escaladas" value={stats?.byStatus?.ESCALADA || 0} color="orange" />
          <KpiCard label="Resueltas / Cerradas" value={resolved} color="green" />
      </Box>

      <Card sx={{ bgcolor: '#FCFCFD' }}>
        <CardContent sx={{ p: 0 }}>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', md: 'repeat(4, 1fr)' } }}>
            {STATUS_KPI.map(({ key, tone, label }, index) => (
              <Box
                key={key}
                sx={{
                  px: 2.2,
                  py: 1.8,
                  borderRight: { md: index < STATUS_KPI.length - 1 ? '1px solid #EAECF0' : 'none' },
                  borderBottom: { xs: index < 2 ? '1px solid #EAECF0' : 'none', md: 'none' }
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, mb: 0.6 }}>
                  <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: tone }} />
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
                    {label || key}
                  </Typography>
                </Box>
                <Typography variant="h4" sx={{ lineHeight: 1.1 }}>
                  {stats?.byStatus?.[key] || 0}
                </Typography>
              </Box>
            ))}
          </Box>
        </CardContent>
      </Card>

      <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', lg: '320px 1fr' } }}>
        <Card>
          <CardContent>
            <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 700 }}>
              Incidencias por Aplicacion
            </Typography>
            <Stack spacing={1.8}>
            {Object.entries(stats?.byApp || {})
              .sort((a, b) => b[1] - a[1])
              .map(([app, count]) => (
                <Box key={app}>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="body2" fontWeight={600}>{app}</Typography>
                    <Typography variant="body2" fontWeight={700}>{count}</Typography>
                  </Stack>
                  <LinearProgress
                    variant="determinate"
                    value={Math.min((count / (stats?.total || 1)) * 100, 100)}
                    sx={{ mt: 0.6, height: 8, borderRadius: 999, bgcolor: '#EEF2F6' }}
                  />
                </Box>
              ))}
            </Stack>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
              <Typography variant="subtitle2" fontWeight={700}>Incidencias Recientes</Typography>
              <Typography component={Link} to="/incidencias" color="primary.main" sx={{ fontWeight: 700, textDecoration: 'none' }}>
                Ver todas
              </Typography>
            </Stack>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Aplicacion</TableCell>
                    <TableCell>Titulo</TableCell>
                    <TableCell>Prioridad</TableCell>
                    <TableCell>Estado</TableCell>
                    <TableCell>Fecha</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                {incidents.map((inc) => (
                  <TableRow key={inc.ID} hover>
                    <TableCell>
                      <Chip
                        size="small"
                        label={inc.APP_NAME}
                        sx={{ bgcolor: '#F2F4F7', fontWeight: 700 }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography
                        component={Link}
                        to={`/incidencias/${inc.ID}`}
                        sx={{ textDecoration: 'none', color: 'text.primary', fontWeight: 600 }}
                      >
                        {inc.TITULO}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <PriorityBadge priority={inc.PRIORIDAD} />
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={inc.ESTADO} />
                    </TableCell>
                    <TableCell sx={{ color: 'text.secondary' }}>{fmt(inc.FECHA_ALTA)}</TableCell>
                  </TableRow>
                ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </Box>
    </Stack>
  );
}

export default Dashboard;
