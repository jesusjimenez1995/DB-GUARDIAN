import { useEffect, useMemo, useState } from 'react';
import { createIncident, fetchPlaybook, lookupPlaybooks } from '../api';

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

  const lookupTerm = useMemo(() => {
    if (form.errorCode.trim()) return form.errorCode.trim();
    return form.titulo.trim();
  }, [form.errorCode, form.titulo]);

  useEffect(() => {
    let isActive = true;
    if (!lookupTerm || lookupTerm.length < 2) {
      setSuggestions([]);
      setLookupError('');
      return undefined;
    }

    setLookupLoading(true);
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
    }, 400);

    return () => {
      isActive = false;
      clearTimeout(timeoutId);
      setLookupLoading(false);
    };
  }, [lookupTerm]);

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
      await createIncident(form);
      setForm({ appName: '', errorCode: '', titulo: '', descripcion: '' });
      setSuggestions([]);
      onCreated();
    } catch (error) {
      setLookupError(error.message || 'No se pudo crear la incidencia');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
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
              name="appName"
              value={form.appName}
              onChange={handleChange}
              required
            />
          </label>

          <label className="text-sm font-semibold text-slate-600">
            Codigo de Error
            <input
              className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-dbBlue"
              name="errorCode"
              value={form.errorCode}
              onChange={handleChange}
              required
            />
          </label>
        </div>

        <label className="mt-4 block text-sm font-semibold text-slate-600">
          Titulo
          <input
            className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-dbBlue"
            name="titulo"
            value={form.titulo}
            onChange={handleChange}
            required
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

        <button
          type="submit"
          disabled={isSubmitting}
          className="mt-6 inline-flex items-center rounded-xl bg-dbBlue px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
        >
          {isSubmitting ? 'Guardando...' : 'Crear Incidencia'}
        </button>
      </form>

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
        </div>
      </aside>
    </section>
  );
}

export default IncidentForm;
