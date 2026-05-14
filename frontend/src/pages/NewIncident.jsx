<<<<<<< HEAD
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { AlertCircle, BookOpenText, CircleCheckBig, Sparkles } from 'lucide-react';
import IncidentForm from '../components/IncidentForm';
import PlaybookViewer from '../components/PlaybookViewer';

function NewIncident() {
  const navigate = useNavigate();
  const [selectedPlaybook, setSelectedPlaybook] = useState(null);

  return (
    <div className="space-y-5">
      <header className="rounded-2xl border border-slate-200 bg-white px-6 py-5 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-dbBlue">Registro</p>
        <h1 className="mt-2 text-2xl font-semibold text-slate-900">Nueva incidencia crítica</h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
          Captura la incidencia con estándar bancario: precisión técnica, trazabilidad y contexto suficiente para acelerar la resolución.
        </p>
      </header>

      <IncidentForm
        onCreated={(created) => {
          const incidentId = created?.id || created?.ID;
          if (incidentId) {
            navigate(`/incidencias/${incidentId}`);
            return;
          }
          navigate('/incidencias');
        }}
        onPlaybookLoaded={setSelectedPlaybook}
      />

      {selectedPlaybook ? (
        <section className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_420px]">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-2xl bg-blue-50 text-dbBlue">
                <BookOpenText className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-dbBlue">Sugerencia cargada</p>
                <h2 className="mt-1 text-lg font-semibold text-slate-900">Procedimiento listo para consulta</h2>
                <p className="mt-1 text-sm leading-6 text-slate-500">
                  La referencia seleccionada se muestra aquí como apoyo contextual, sin romper el flujo de captura.
                </p>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-slate-500">
              <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 font-medium text-slate-700"><Sparkles className="h-3.5 w-3.5 text-dbBlue" /> Validación rápida</span>
              <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 font-medium text-slate-700"><CircleCheckBig className="h-3.5 w-3.5 text-emerald-600" /> Práctica operativa</span>
              <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 font-medium text-slate-700"><AlertCircle className="h-3.5 w-3.5 text-amber-600" /> Revisión recomendada</span>
            </div>
          </div>
          <PlaybookViewer playbook={selectedPlaybook} />
        </section>
      ) : null}
    </div>
=======
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
>>>>>>> 1cced019334f5861a6b7e6c3cafb1e59f10d0ba0
  );
}

export default NewIncident;
