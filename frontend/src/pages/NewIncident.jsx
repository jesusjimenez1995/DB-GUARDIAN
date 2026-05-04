import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography
} from '@mui/material';
import { createIncident, fetchPlaybook, lookupPlaybooks } from '../api';
import PlaybookViewer from '../components/PlaybookViewer';
import { KNOWN_APPS } from '../constants';

const PRIORITIES = ['ALTA', 'MEDIA', 'BAJA'];

function NewIncident() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    appName: '',
    errorCode: '',
    titulo: '',
    descripcion: '',
    prioridad: 'MEDIA',
    asignadoA: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [lookupLoading, setLookupLoading] = useState(false);
  const [selectedPlaybook, setSelectedPlaybook] = useState(null);

  const lookupTerm = form.errorCode.trim() || form.titulo.trim();

  useEffect(() => {
    let active = true;

    if (!lookupTerm || lookupTerm.length < 2) {
      setSuggestions([]);
      return;
    }

    setLookupLoading(true);
    const timer = setTimeout(async () => {
      try {
        const res = await lookupPlaybooks(lookupTerm);
        if (active) setSuggestions(res.data || []);
      } catch {
        /* ignore lookup errors */
      } finally {
        if (active) setLookupLoading(false);
      }
    }, 400);

    return () => {
      active = false;
      clearTimeout(timer);
      setLookupLoading(false);
    };
  }, [lookupTerm]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectPlaybook = async (id) => {
    try {
      const res = await fetchPlaybook(id);
      setSelectedPlaybook(res.data);
    } catch { /* ignore */ }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const res = await createIncident({
        appName: form.appName,
        errorCode: form.errorCode,
        titulo: form.titulo,
        descripcion: form.descripcion,
        prioridad: form.prioridad,
        asignadoA: form.asignadoA || undefined
      });
      navigate(`/incidencias/${res.id}`);
    } catch (e) {
      setError(e.message || 'No se pudo crear la incidencia');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box>
      <Box sx={{ mb: 2.5 }}>
        <Typography variant="overline" color="primary.main" sx={{ letterSpacing: 1.4 }}>
          Registro
        </Typography>
        <Typography variant="h4">Nueva Incidencia Critica</Typography>
        <Typography sx={{ mt: 0.5 }} color="text.secondary">
          Registra la incidencia con el máximo detalle para facilitar la investigación y resolución.
        </Typography>
      </Box>

      <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', lg: 'minmax(0, 1.85fr) minmax(280px, 1fr)' } }}>
        <Card component="form" onSubmit={handleSubmit}>
          <CardContent sx={{ p: 3 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                list="apps-list"
                name="appName"
                  label="Aplicacion"
                value={form.appName}
                onChange={handleChange}
                required
                placeholder="DPMTOOLS, Valeexchange..."
                />
                <datalist id="apps-list">
                  {KNOWN_APPS.map((a) => <option key={a} value={a} />)}
                </datalist>
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                name="errorCode"
                  label="Codigo de Error"
                value={form.errorCode}
                onChange={handleChange}
                required
                placeholder="ORA-00054, NPE-BATCH-001..."
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Prioridad</InputLabel>
                  <Select
                    label="Prioridad"
                name="prioridad"
                value={form.prioridad}
                onChange={handleChange}
                  >
                    {PRIORITIES.map((p) => <MenuItem key={p} value={p}>{p}</MenuItem>)}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                name="asignadoA"
                  label="Asignado a"
                value={form.asignadoA}
                onChange={handleChange}
                placeholder="Nombre del responsable (opcional)"
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
              name="titulo"
                  label="Titulo"
              value={form.titulo}
              onChange={handleChange}
              required
              placeholder="Descripción breve del problema"
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  minRows={6}
              name="descripcion"
                  label="Descripcion detallada"
              value={form.descripcion}
              onChange={handleChange}
              placeholder="Describe el impacto, las condiciones en las que ocurre, qué se ha probado, logs relevantes..."
                />
              </Grid>
            </Grid>

            {error ? <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert> : null}

            <Stack direction="row" spacing={1.2} mt={2.4}>
              <Button
              type="submit"
              disabled={submitting}
                variant="contained"
                size="small"
                startIcon={submitting ? <CircularProgress color="inherit" size={14} /> : null}
            >
              {submitting ? 'Creando...' : 'Crear Incidencia'}
              </Button>
              <Button
              type="button"
              onClick={() => navigate('/incidencias')}
                variant="outlined"
                size="small"
            >
              Cancelar
              </Button>
            </Stack>
          </CardContent>
        </Card>

        <Stack spacing={2} sx={{ position: { lg: 'sticky' }, top: { lg: 92 }, alignSelf: 'start' }}>
          <Card>
            <CardContent>
              <Typography variant="subtitle2" fontWeight={700}>Sugerencias de Playbooks</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.6 }}>
              Búsqueda automática al escribir el código de error o el título.
              </Typography>
              <Stack spacing={1} mt={1.4}>
              {lookupLoading && (
                <Typography variant="caption" color="text.secondary">Buscando procedimientos similares...</Typography>
              )}
              {!lookupLoading && suggestions.length === 0 && (
                <Typography variant="caption" color="text.secondary">Sin sugerencias para el termino actual.</Typography>
              )}
              {suggestions.map((item) => (
                <Button
                  key={item.ID}
                  type="button"
                  onClick={() => handleSelectPlaybook(item.ID)}
                  variant="outlined"
                  size="small"
                  sx={{ justifyContent: 'space-between', textTransform: 'none', py: 0.9 }}
                >
                  <span>{item.ERROR_MATCH}</span>
                  <span>{item.SCORE}%</span>
                </Button>
              ))}
              </Stack>
            </CardContent>
          </Card>

          {selectedPlaybook && (
            <PlaybookViewer playbook={selectedPlaybook} />
          )}
        </Stack>
      </Box>
    </Box>
  );
}

export default NewIncident;
