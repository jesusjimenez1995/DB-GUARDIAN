import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Chip,
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
import { motion } from 'framer-motion';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';
import { fetchIncidents, fetchStats } from '../api';
import KpiCard from '../components/KpiCard';
import PriorityBadge from '../components/PriorityBadge';
import StatusBadge from '../components/StatusBadge';

const STATUS_KPI = [
  { key: 'NUEVA', tone: '#667085' },
  { key: 'ASIGNADA', tone: '#1F3F9C' },
  { key: 'EN INVESTIGACIÓN', tone: '#334155', label: 'Investigacion' },
  { key: 'ESCALADA', tone: '#9A6700' }
];

function fmt(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' });
}

function Dashboard() {
  const [stats, setStats] = useState(null);
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [chartsReady, setChartsReady] = useState(false);

  useEffect(() => {
    Promise.all([fetchStats(), fetchIncidents()])
      .then(([sRes, iRes]) => {
        setStats(sRes.data);
        setIncidents((iRes.data || []).slice(0, 6));
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (loading) return;
    const timer = window.setTimeout(() => setChartsReady(true), 180);
    return () => window.clearTimeout(timer);
  }, [loading]);

  if (loading) {
    return <LinearProgress sx={{ mt: 2 }} />;
  }

  const open = (stats?.total || 0)
    - (stats?.byStatus?.SOLUCIONADA || 0)
    - (stats?.byStatus?.CERRADA || 0);

  const resolved = (stats?.byStatus?.SOLUCIONADA || 0) + (stats?.byStatus?.CERRADA || 0);
  const incidentsWithSolution = incidents.filter((item) => Boolean(item.SOLUCION)).length;
  const knowledgeCoverage = incidents.length ? Math.round((incidentsWithSolution / incidents.length) * 100) : 0;

  const appChartData = Object.entries(stats?.byApp || {})
    .sort((a, b) => b[1] - a[1])
    .map(([app, total]) => ({ app, total }));

  const statusExecutiveData = STATUS_KPI.map(({ key, label }) => ({
    status: label || key,
    total: stats?.byStatus?.[key] || 0
  }));

  return (
    <Stack spacing={2.4}>
      <Box component={motion.div} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
        <Typography variant="overline" color="primary.main" sx={{ letterSpacing: 1.4 }}>
          Operations Command Center
        </Typography>
        <Typography variant="h4">Centro de Control de Incidencias</Typography>
        <Typography color="text.secondary" sx={{ mt: 0.5 }}>
          Vista ejecutiva para seguimiento de riesgo operativo, saturacion por aplicacion y nivel de reutilizacion del conocimiento.
        </Typography>
      </Box>

      <Box
        component={motion.div}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.08 }}
        sx={{
          display: 'grid',
          gap: 2,
          gridTemplateColumns: { xs: '1fr', md: 'repeat(3, minmax(0, 1fr))' }
        }}
      >
        <Card>
          <CardContent>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700 }}>Cobertura de conocimiento</Typography>
            <Typography variant="h4" sx={{ mt: 0.7, color: 'primary.main' }}>{knowledgeCoverage}%</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.8 }}>
              Incidencias recientes con solucion documentada para reaprovechamiento operativo.
            </Typography>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700 }}>Volumen activo</Typography>
            <Typography variant="h4" sx={{ mt: 0.7 }}>{open}</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.8 }}>
              Casos en progreso que requieren seguimiento diario de squad y liderazgo.
            </Typography>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700 }}>Resueltas y cerradas</Typography>
            <Typography variant="h4" sx={{ mt: 0.7, color: 'success.main' }}>{resolved}</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.8 }}>
              Casos finalizados listos para consulta como base histórica del equipo.
            </Typography>
          </CardContent>
        </Card>
      </Box>

      <Box
        component={motion.div}
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.12 }}
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

      <Card component={motion.div} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.45, delay: 0.16 }} sx={{ bgcolor: '#FCFCFD' }}>
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

      <Box
        component={motion.div}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.2 }}
        sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', lg: 'minmax(0, 1fr) minmax(0, 1fr)' } }}
      >
        <Card>
          <CardContent>
            <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 700 }}>
              Incidencias por Aplicacion
            </Typography>
            <Box sx={{ height: 250 }}>
              {chartsReady ? (
                <BarChart
                  data={appChartData}
                  margin={{ top: 10, right: 8, left: -10, bottom: 8 }}
                  style={{ width: '100%', height: '100%', minWidth: 280, minHeight: 220 }}
                  responsive
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5EAF2" />
                  <XAxis dataKey="app" tick={{ fontSize: 12, fill: '#475467' }} axisLine={false} tickLine={false} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: '#475467' }} axisLine={false} tickLine={false} />
                  <Tooltip formatter={(value) => [`${value}`, 'Incidencias']} />
                  <Bar dataKey="total" fill="#0018A8" radius={[7, 7, 0, 0]} />
                </BarChart>
              ) : (
                <LinearProgress sx={{ mt: 8 }} />
              )}
            </Box>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1.8 }}>Mix de estados críticos</Typography>
            <Box sx={{ height: 250, mb: 1.4 }}>
              {chartsReady ? (
                <BarChart
                  data={statusExecutiveData}
                  layout="vertical"
                  margin={{ top: 8, right: 10, left: 20, bottom: 8 }}
                  style={{ width: '100%', height: '100%', minWidth: 280, minHeight: 220 }}
                  responsive
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5EAF2" />
                  <XAxis type="number" allowDecimals={false} axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#475467' }} />
                  <YAxis type="category" dataKey="status" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#475467' }} width={110} />
                  <Tooltip formatter={(value) => [`${value}`, 'Casos']} />
                  <Bar dataKey="total" fill="#375A8C" radius={[0, 8, 8, 0]} />
                </BarChart>
              ) : (
                <LinearProgress sx={{ mt: 8 }} />
              )}
            </Box>
            <Typography component={Link} to="/incidencias" color="primary.main" sx={{ fontWeight: 700, textDecoration: 'none' }}>
              Ver libro maestro de incidencias
            </Typography>
          </CardContent>
        </Card>
      </Box>

      <Card component={motion.div} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, delay: 0.24 }}>
        <CardContent>
          <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
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
    </Stack>
  );
}

export default Dashboard;
