import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  Alert,
  Box,
  Breadcrumbs,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  InputLabel,
  LinearProgress,
  Link as MuiLink,
  MenuItem,
  Select,
  Stack,
  Typography
} from '@mui/material';
import LaunchOutlinedIcon from '@mui/icons-material/LaunchOutlined';
import DOMPurify from 'dompurify';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeSanitize from 'rehype-sanitize';
<<<<<<< HEAD
import { advanceIncidentStatus, fetchIncident, fetchIncidentRecommendations, fetchUsers, updateIncident } from '../api';
import PriorityBadge from '../components/PriorityBadge';
import RichSolutionEditor from '../components/RichSolutionEditor';
import ResolvedIncidentsPanel from '../components/ResolvedIncidentsPanel';
=======
import { advanceIncidentStatus, fetchIncident, fetchUsers, updateIncident } from '../api';
import PriorityBadge from '../components/PriorityBadge';
import RichSolutionEditor from '../components/RichSolutionEditor';
>>>>>>> 1cced019334f5861a6b7e6c3cafb1e59f10d0ba0
import StatusBadge from '../components/StatusBadge';
import StatusTimeline from '../components/StatusTimeline';
import { getNextStatus } from '../constants';

function fmt(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleString('es-ES', {
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
  });
}

function hasHtmlTags(value) {
  return /<\/?[a-z][\s\S]*>/i.test(value || '');
}

function IncidentDetail() {
  const { id } = useParams();
  const [incident, setIncident] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editSolution, setEditSolution] = useState(false);
  const [solucionDraft, setSolucionDraft] = useState('');
  const [saving, setSaving] = useState(false);
  const [advancing, setAdvancing] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [selectedAssignee, setSelectedAssignee] = useState('');
<<<<<<< HEAD
  const [similarIncidents, setSimilarIncidents] = useState([]);
  const [similarLoading, setSimilarLoading] = useState(false);
  const [similarError, setSimilarError] = useState('');
=======
>>>>>>> 1cced019334f5861a6b7e6c3cafb1e59f10d0ba0

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetchIncident(id);
      setIncident(res.data);
      setSolucionDraft(res.data.SOLUCION || '');
<<<<<<< HEAD

      setSimilarLoading(true);
      setSimilarError('');
      try {
        const similarRes = await fetchIncidentRecommendations(id);
        setSimilarIncidents(similarRes.data || []);
      } catch (similarErr) {
        setSimilarError(similarErr.message || 'No se pudieron cargar incidencias similares');
      } finally {
        setSimilarLoading(false);
      }
=======
>>>>>>> 1cced019334f5861a6b7e6c3cafb1e59f10d0ba0
    } catch (e) {
      setError(e.message || 'No se pudo cargar la incidencia');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [id]);

  const handleAdvance = async () => {
    const next = getNextStatus(incident.ESTADO);
    if (!next) return;

    if (next === 'ASIGNADA') {
      setSelectedAssignee(String(incident.ASIGNADO_A || '').toLowerCase());
      setAssignDialogOpen(true);
      if (users.length === 0) {
        setUsersLoading(true);
        try {
          const response = await fetchUsers();
          setUsers(response.data || []);
        } catch {
          setError('No se pudo cargar la lista de usuarios asignables');
        } finally {
          setUsersLoading(false);
        }
      }
      return;
    }

    setAdvancing(true);
    setError('');
    try {
      await advanceIncidentStatus(incident.ID, next);
      setSuccessMsg(`Estado actualizado a ${next}`);
      setTimeout(() => setSuccessMsg(''), 3000);
      await load();
    } catch (e) {
      setError(e.message || 'No se pudo actualizar el estado');
    } finally {
      setAdvancing(false);
    }
  };

  const handleConfirmAssign = async () => {
    if (!selectedAssignee) {
      setError('Debes seleccionar un correo para asignar la incidencia');
      return;
    }

    setAdvancing(true);
    setError('');
    try {
      await advanceIncidentStatus(incident.ID, 'ASIGNADA', selectedAssignee);
      setAssignDialogOpen(false);
      setSuccessMsg(`Incidencia asignada a ${selectedAssignee}`);
      setTimeout(() => setSuccessMsg(''), 3000);
      await load();
    } catch (e) {
      setError(e.message || 'No se pudo asignar la incidencia');
    } finally {
      setAdvancing(false);
    }
  };

  const handleSaveSolution = async () => {
    setSaving(true);
    setError('');
    try {
      await updateIncident(incident.ID, { solucion: solucionDraft });
      setEditSolution(false);
      setSuccessMsg('Solucion guardada correctamente');
      setTimeout(() => setSuccessMsg(''), 3000);
      await load();
    } catch (e) {
      setError(e.message || 'No se pudo guardar la solucion');
    } finally {
      setSaving(false);
    }
  };

  const nextStatus = incident ? getNextStatus(incident.ESTADO) : null;

  const sanitizedHtml = useMemo(() => {
    if (!incident?.SOLUCION || !hasHtmlTags(incident.SOLUCION)) return '';
    return DOMPurify.sanitize(incident.SOLUCION, {
      ADD_ATTR: ['target', 'rel', 'download'],
      ALLOWED_URI_REGEXP:
        /^(?:(?:(?:https?|mailto|tel):)|data:(?:application|image|text)\/[a-z0-9.+-]+;base64,[a-z0-9+/=]+|[^a-z]|[a-z+.-]+(?:[^a-z+.-:]|$))/i
    });
  }, [incident?.SOLUCION]);

  if (loading) {
    return <LinearProgress sx={{ mt: 2 }} />;
  }

  if (!incident) {
    return <Alert severity="error">{error || 'Incidencia no encontrada.'}</Alert>;
  }

  return (
    <Stack spacing={2} sx={{ maxWidth: 980, mx: 'auto' }}>
      <Breadcrumbs>
        <MuiLink component={Link} underline="hover" color="inherit" to="/incidencias">
          Incidencias
        </MuiLink>
        <Typography color="text.primary">#{incident.ID}</Typography>
      </Breadcrumbs>

      {successMsg ? <Alert severity="success">{successMsg}</Alert> : null}
      {error ? <Alert severity="error">{error}</Alert> : null}

      <Card>
        <CardContent sx={{ p: { xs: 2, md: 2.4 } }}>
<<<<<<< HEAD
          <Stack direction={{ xs: 'column', md: 'row' }} sx={{ justifyContent: 'space-between' }} gap={1.6}>
            <Box>
              <Stack direction="row" spacing={1} sx={{ alignItems: 'center', flexWrap: 'wrap', mb: 1 }}>
=======
          <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" gap={1.6}>
            <Box>
              <Stack direction="row" spacing={1} alignItems="center" mb={1} flexWrap="wrap">
>>>>>>> 1cced019334f5861a6b7e6c3cafb1e59f10d0ba0
                <StatusBadge status={incident.ESTADO} />
                <PriorityBadge priority={incident.PRIORIDAD} />
                <Typography variant="caption" sx={{ px: 1.1, py: 0.4, bgcolor: '#F2F4F7', borderRadius: 999 }}>
                  {incident.APP_NAME}
                </Typography>
              </Stack>
              <Typography variant="h5">{incident.TITULO}</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.8 }}>
                Codigo: <b>{incident.ERROR_CODE}</b> | Registrado: {fmt(incident.FECHA_ALTA)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Responsable: {incident.ASIGNADO_A || 'No asignado'}
                {incident.FECHA_RESOLUCION ? ` | Resuelto: ${fmt(incident.FECHA_RESOLUCION)}` : ''}
              </Typography>
            </Box>

            {nextStatus ? (
              <Button
                variant="contained"
                size="medium"
                onClick={handleAdvance}
                disabled={advancing}
                endIcon={advancing ? <CircularProgress color="inherit" size={14} /> : <LaunchOutlinedIcon />}
                sx={{ alignSelf: { xs: 'flex-start', md: 'center' }, px: 1.8, whiteSpace: 'nowrap' }}
              >
                {advancing ? 'Actualizando...' : `Avanzar a ${nextStatus}`}
              </Button>
            ) : null}
          </Stack>
        </CardContent>
      </Card>

      <StatusTimeline currentStatus={incident.ESTADO} />

      <Card>
        <CardContent>
          <Typography variant="subtitle1" fontWeight={700}>Descripcion del Problema</Typography>
          <Typography color="text.secondary" sx={{ mt: 1 }}>{incident.DESCRIPCION || 'Sin descripcion adicional.'}</Typography>
        </CardContent>
      </Card>

<<<<<<< HEAD
      <ResolvedIncidentsPanel
        title="Incidencias resueltas similares"
        subtitle="Casos cerrados o solucionados con documentación útil para guiar la resolución actual."
        items={similarIncidents}
        loading={similarLoading}
        error={similarError}
        emptyMessage="Todavía no existen coincidencias resueltas para esta incidencia."
      />

=======
>>>>>>> 1cced019334f5861a6b7e6c3cafb1e59f10d0ba0
      <Card>
        <CardContent>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: '1fr auto' },
              gap: 1.5,
              alignItems: 'start',
              mb: 1.5
            }}
          >
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="subtitle1" fontWeight={700}>Resolucion y Base de Conocimiento</Typography>
              <Typography variant="body2" color="text.secondary">
<<<<<<< HEAD
                Documenta la solución final con criterio operativo para que el caso quede reutilizable por cualquier equipo de soporte.
=======
                Editor enriquecido con estilos, enlaces y adjuntos para documentar la solucion final del caso.
>>>>>>> 1cced019334f5861a6b7e6c3cafb1e59f10d0ba0
              </Typography>
            </Box>

            {!editSolution ? (
              <Box sx={{ display: 'flex', justifyContent: { xs: 'flex-start', md: 'flex-end' } }}>
                <Button variant="outlined" size="medium" onClick={() => setEditSolution(true)}>
                {incident.SOLUCION ? 'Editar solucion' : 'Agregar solucion'}
                </Button>
              </Box>
            ) : null}
          </Box>

          {editSolution ? (
            <Stack spacing={1.5}>
              <RichSolutionEditor value={solucionDraft} onChange={setSolucionDraft} />
              <Stack direction="row" spacing={1}>
                <Button
                  variant="contained"
                  size="medium"
                  onClick={handleSaveSolution}
                  disabled={saving}
                  endIcon={saving ? <CircularProgress color="inherit" size={14} /> : null}
                >
                  {saving ? 'Guardando...' : 'Guardar solucion'}
                </Button>
                <Button
                  variant="outlined"
                  size="medium"
                  onClick={() => {
                    setEditSolution(false);
                    setSolucionDraft(incident.SOLUCION || '');
                  }}
                >
                  Cancelar
                </Button>
              </Stack>
            </Stack>
          ) : incident.SOLUCION ? (
            hasHtmlTags(incident.SOLUCION) ? (
              <Box className="solution-html" sx={{ border: '1px solid #EAECF0', borderRadius: 2, p: 2.2 }}
                dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
              />
            ) : (
              <Box sx={{ border: '1px solid #EAECF0', borderRadius: 2, p: 2.2 }}>
                <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeSanitize]}>
                  {incident.SOLUCION}
                </ReactMarkdown>
              </Box>
            )
          ) : (
            <Alert severity="info">Aun no hay solucion documentada para esta incidencia.</Alert>
          )}
        </CardContent>
      </Card>

      {incident.HISTORIAL?.length ? (
        <Card>
          <CardContent>
            <Typography variant="subtitle1" fontWeight={700}>Historial de Estados</Typography>
            <Stack spacing={0.6} mt={1.2}>
              {[...incident.HISTORIAL].reverse().map((entry, idx) => (
                <Box key={`${entry.ESTADO}-${entry.FECHA}-${idx}`}>
<<<<<<< HEAD
                  <Stack direction="row" spacing={1} sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
=======
                  <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
>>>>>>> 1cced019334f5861a6b7e6c3cafb1e59f10d0ba0
                    <StatusBadge status={entry.ESTADO} />
                    <Typography variant="caption" color="text.secondary">{fmt(entry.FECHA)}</Typography>
                    {entry.USUARIO ? <Typography variant="caption" color="text.secondary">{entry.USUARIO}</Typography> : null}
                  </Stack>
                  {entry.COMENTARIO ? (
                    <Typography variant="body2" color="text.secondary" sx={{ ml: 0.2, mt: 0.6 }}>
                      {entry.COMENTARIO}
                    </Typography>
                  ) : null}
                  {idx < incident.HISTORIAL.length - 1 ? <Divider sx={{ mt: 1.2 }} /> : null}
                </Box>
              ))}
            </Stack>
          </CardContent>
        </Card>
      ) : null}

      <Dialog open={assignDialogOpen} onClose={() => setAssignDialogOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle>Asignar Incidencia</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Para mover la incidencia a ASIGNADA debes elegir un responsable de la lista.
          </Typography>
          <FormControl fullWidth>
            <InputLabel>Correo del responsable</InputLabel>
            <Select
              label="Correo del responsable"
              value={selectedAssignee}
              onChange={(e) => setSelectedAssignee(e.target.value)}
              disabled={usersLoading || advancing}
            >
              {users.map((email) => (
                <MenuItem key={email} value={email}>{email}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button variant="outlined" onClick={() => setAssignDialogOpen(false)}>
            Cancelar
          </Button>
          <Button
            variant="contained"
            onClick={handleConfirmAssign}
            disabled={!selectedAssignee || usersLoading || advancing}
            endIcon={advancing ? <CircularProgress color="inherit" size={14} /> : null}
          >
            Confirmar Asignacion
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}

export default IncidentDetail;
