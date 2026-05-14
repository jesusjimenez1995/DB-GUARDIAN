import { useEffect, useMemo, useState } from 'react';
<<<<<<< HEAD
import { createIncident, fetchPlaybook, fetchResolvedIncidentRecommendations, lookupPlaybooks } from '../api';
import ResolvedIncidentsPanel from './ResolvedIncidentsPanel';
=======
import { createIncident, fetchPlaybook, lookupPlaybooks } from '../api';
>>>>>>> 1cced019334f5861a6b7e6c3cafb1e59f10d0ba0

function IncidentForm({ onCreated, onPlaybookLoaded }) {
  const [form, setForm] = useState({
    appName: '',
    errorCode: '',
    titulo: '',
    descripcion: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [lookupLoading, setLookupLoading] = useState(false);
  const [lookupError, setLookupError] = useState('');
<<<<<<< HEAD
  const [resolvedMatches, setResolvedMatches] = useState([]);
  const [resolvedLoading, setResolvedLoading] = useState(false);
  const [resolvedError, setResolvedError] = useState('');
=======
>>>>>>> 1cced019334f5861a6b7e6c3cafb1e59f10d0ba0

  const lookupTerm = useMemo(() => {
    if (form.errorCode.trim()) return form.errorCode.trim();
    return form.titulo.trim();
  }, [form.errorCode, form.titulo]);

  useEffect(() => {
    let isActive = true;
<<<<<<< HEAD
    const hasResolvedQuery = [form.appName, form.errorCode, form.titulo, form.descripcion].some((value) => value.trim().length >= 2);

    if (!lookupTerm || lookupTerm.length < 2) {
      setSuggestions([]);
      setLookupError('');
    }

    if (!hasResolvedQuery) {
      setResolvedMatches([]);
      setResolvedError('');
=======
    if (!lookupTerm || lookupTerm.length < 2) {
      setSuggestions([]);
      setLookupError('');
>>>>>>> 1cced019334f5861a6b7e6c3cafb1e59f10d0ba0
      return undefined;
    }

    setLookupLoading(true);
<<<<<<< HEAD
    setResolvedLoading(true);
    const timeoutId = setTimeout(async () => {
      const playbookPromise = lookupTerm.length >= 2 ? lookupPlaybooks(lookupTerm) : Promise.resolve({ data: [] });
      const resolvedPromise = fetchResolvedIncidentRecommendations({
        appName: form.appName,
        errorCode: form.errorCode,
        titulo: form.titulo,
        descripcion: form.descripcion
      });

      const [playbookResult, resolvedResult] = await Promise.allSettled([playbookPromise, resolvedPromise]);

      if (!isActive) return;

      if (playbookResult.status === 'fulfilled') {
        setSuggestions(playbookResult.value.data || []);
        setLookupError('');
      } else {
        setLookupError(playbookResult.reason?.message || 'No fue posible buscar playbooks');
      }

      if (resolvedResult.status === 'fulfilled') {
        setResolvedMatches(resolvedResult.value.data || []);
        setResolvedError('');
      } else {
        setResolvedError(resolvedResult.reason?.message || 'No fue posible buscar incidencias resueltas similares');
      }

      setLookupLoading(false);
      setResolvedLoading(false);
=======
    const timeoutId = setTimeout(async () => {
      try {
        const result = await lookupPlaybooks(lookupTerm);
        if (isActive) {
          setSuggestions(result.data || []);
          setLookupError('');
        }
      } catch (error) {
        if (isActive) {
          setLookupError(error.message || 'No fue posible buscar playbooks');
        }
      } finally {
        if (isActive) {
          setLookupLoading(false);
        }
      }
>>>>>>> 1cced019334f5861a6b7e6c3cafb1e59f10d0ba0
    }, 400);

    return () => {
      isActive = false;
      clearTimeout(timeoutId);
      setLookupLoading(false);
<<<<<<< HEAD
      setResolvedLoading(false);
    };
  }, [form.appName, form.descripcion, form.errorCode, form.titulo, lookupTerm]);
=======
    };
  }, [lookupTerm]);
>>>>>>> 1cced019334f5861a6b7e6c3cafb1e59f10d0ba0

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectSuggestion = async (id) => {
    try {
      const playbook = await fetchPlaybook(id);
      onPlaybookLoaded(playbook.data);
    } catch (error) {
      setLookupError(error.message || 'No se pudo cargar el playbook');
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setLookupError('');
    try {
<<<<<<< HEAD
      const created = await createIncident(form);
      setForm({ appName: '', errorCode: '', titulo: '', descripcion: '' });
      setSuggestions([]);
      onCreated?.(created);
=======
      await createIncident(form);
      setForm({ appName: '', errorCode: '', titulo: '', descripcion: '' });
      setSuggestions([]);
      onCreated();
>>>>>>> 1cced019334f5861a6b7e6c3cafb1e59f10d0ba0
    } catch (error) {
      setLookupError(error.message || 'No se pudo crear la incidencia');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
<<<<<<< HEAD
    <section className="grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_390px]">
      <form onSubmit={handleSubmit} className="rounded-card border border-slate-200 bg-white p-6 shadow-card">
        <div className="border-b border-slate-200 pb-5">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-dbBlue">Registro de incidencia</p>
          <h2 className="mt-2 text-2xl font-semibold text-slate-900">Nueva incidencia crítica</h2>
          <p className="mt-1 text-sm leading-6 text-slate-500">
            Completa el formulario como un documento oficial: breve, preciso y trazable.
          </p>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <label className="text-sm font-semibold text-slate-700">
            Aplicacion
            <input
              className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-normal text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-dbBlue focus:bg-white focus:ring-2 focus:ring-dbBlue/10"
=======
    <section className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
      <form onSubmit={handleSubmit} className="rounded-card border border-slate-200 bg-white p-6 shadow-card">
        <div className="mb-5">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-dbBlue">Registro de Incidencia</p>
          <h2 className="mt-1 text-2xl font-semibold text-slateBody">Nueva Incidencia Critica</h2>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="text-sm font-semibold text-slate-600">
            Aplicacion
            <input
              className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-dbBlue"
>>>>>>> 1cced019334f5861a6b7e6c3cafb1e59f10d0ba0
              name="appName"
              value={form.appName}
              onChange={handleChange}
              required
<<<<<<< HEAD
              list="apps-list"
              placeholder="DPMTOOLS, Valeexchange..."
            />
            <datalist id="apps-list">
              <option value="DPMTOOLS" />
              <option value="Valeexchange" />
              <option value="ProcesosHistoricos" />
              <option value="RiskEngine" />
              <option value="PaymentsCore" />
            </datalist>
          </label>

          <label className="text-sm font-semibold text-slate-700">
            Codigo de Error
            <input
              className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-normal text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-dbBlue focus:bg-white focus:ring-2 focus:ring-dbBlue/10"
=======
            />
          </label>

          <label className="text-sm font-semibold text-slate-600">
            Codigo de Error
            <input
              className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-dbBlue"
>>>>>>> 1cced019334f5861a6b7e6c3cafb1e59f10d0ba0
              name="errorCode"
              value={form.errorCode}
              onChange={handleChange}
              required
<<<<<<< HEAD
              placeholder="ORA-00054, NPE-BATCH-001..."
=======
>>>>>>> 1cced019334f5861a6b7e6c3cafb1e59f10d0ba0
            />
          </label>
        </div>

<<<<<<< HEAD
        <label className="mt-4 block text-sm font-semibold text-slate-700">
          Titulo
          <input
            className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-normal text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-dbBlue focus:bg-white focus:ring-2 focus:ring-dbBlue/10"
=======
        <label className="mt-4 block text-sm font-semibold text-slate-600">
          Titulo
          <input
            className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-dbBlue"
>>>>>>> 1cced019334f5861a6b7e6c3cafb1e59f10d0ba0
            name="titulo"
            value={form.titulo}
            onChange={handleChange}
            required
<<<<<<< HEAD
            placeholder="Describe el problema con lenguaje operativo"
          />
        </label>

        <label className="mt-4 block text-sm font-semibold text-slate-700">
          Descripcion
          <textarea
            className="mt-1 min-h-36 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-normal text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-dbBlue focus:bg-white focus:ring-2 focus:ring-dbBlue/10"
            name="descripcion"
            value={form.descripcion}
            onChange={handleChange}
            placeholder="Impacto, síntomas, pasos de reproducción, evidencias y alcance..."
          />
        </label>

        {lookupError ? <p className="mt-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{lookupError}</p> : null}
=======
          />
        </label>

        <label className="mt-4 block text-sm font-semibold text-slate-600">
          Descripcion
          <textarea
            className="mt-1 min-h-32 w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-dbBlue"
            name="descripcion"
            value={form.descripcion}
            onChange={handleChange}
          />
        </label>

        {lookupError ? <p className="mt-3 text-sm text-red-600">{lookupError}</p> : null}
>>>>>>> 1cced019334f5861a6b7e6c3cafb1e59f10d0ba0

        <button
          type="submit"
          disabled={isSubmitting}
<<<<<<< HEAD
          className="mt-6 inline-flex items-center rounded-xl bg-dbBlue px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#00138e] disabled:cursor-not-allowed disabled:opacity-60"
=======
          className="mt-6 inline-flex items-center rounded-xl bg-dbBlue px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
>>>>>>> 1cced019334f5861a6b7e6c3cafb1e59f10d0ba0
        >
          {isSubmitting ? 'Guardando...' : 'Crear Incidencia'}
        </button>
      </form>

<<<<<<< HEAD
      <aside className="rounded-2xl border border-slate-200 bg-white shadow-[0_18px_50px_-34px_rgba(15,23,42,0.35)] lg:sticky lg:top-24 lg:h-[calc(100vh-7rem)]">
        <div className="flex h-full flex-col">
          <div className="border-b border-slate-200 px-5 py-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-dbBlue">Drawer de playbooks</p>
            <h3 className="mt-1 text-lg font-semibold text-slate-900">Sugerencias de resolución</h3>
            <p className="mt-1 text-sm leading-6 text-slate-500">
              Panel lateral no intrusivo, pensado para comparar hallazgos mientras capturas la incidencia.
            </p>
          </div>

          <div className="flex-1 space-y-4 overflow-y-auto px-4 py-4">
            <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-500">
              La búsqueda se activa automáticamente por código de error, título y descripción.
            </div>

            <div className="space-y-2">
              {lookupLoading ? <p className="text-sm text-slate-500">Buscando sugerencias de playbooks...</p> : null}

              {!lookupLoading && suggestions.length === 0 ? (
                <p className="text-sm text-slate-500">Sin resultados para el término actual.</p>
              ) : null}

              {suggestions.map((item) => (
                <button
                  type="button"
                  key={item.ID}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-3 text-left transition hover:-translate-y-0.5 hover:border-dbBlue hover:bg-slate-50 hover:shadow-sm"
                  onClick={() => handleSelectSuggestion(item.ID)}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-900">{item.ERROR_MATCH}</p>
                      <p className="mt-1 text-xs leading-5 text-slate-500">Referencia técnica sugerida para el playbook.</p>
                    </div>
                    <span className="shrink-0 rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-semibold text-dbBlue">
                      {item.SCORE}
                    </span>
                  </div>
                </button>
              ))}
            </div>

            <ResolvedIncidentsPanel
              title="Incidencias resueltas similares"
              subtitle="Casos históricos con solución documentada para usar como guía operativa."
              items={resolvedMatches}
              loading={resolvedLoading}
              error={resolvedError}
              emptyMessage="No se encontraron incidencias resueltas con suficiente similitud todavía."
            />
          </div>
=======
      <aside className="rounded-card border border-slate-200 bg-white p-5 shadow-card">
        <h3 className="text-lg font-semibold text-slateBody">Sugerencias de Playbooks</h3>
        <p className="mt-1 text-sm text-slate-500">Busqueda asincrona por similitud sobre codigo de error o titulo.</p>

        <div className="mt-4 space-y-2">
          {lookupLoading ? <p className="text-sm text-slate-500">Buscando sugerencias...</p> : null}

          {!lookupLoading && suggestions.length === 0 ? (
            <p className="text-sm text-slate-500">Sin resultados para el termino actual.</p>
          ) : null}

          {suggestions.map((item) => (
            <button
              type="button"
              key={item.ID}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-left transition hover:border-dbBlue hover:bg-blue-50"
              onClick={() => handleSelectSuggestion(item.ID)}
            >
              <p className="text-sm font-semibold text-slateBody">{item.ERROR_MATCH}</p>
              <p className="text-xs text-slate-500">Score: {item.SCORE}</p>
            </button>
          ))}
>>>>>>> 1cced019334f5861a6b7e6c3cafb1e59f10d0ba0
        </div>
      </aside>
    </section>
  );
}

export default IncidentForm;
