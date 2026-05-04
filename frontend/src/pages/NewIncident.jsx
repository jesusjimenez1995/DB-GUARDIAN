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
  );
}

export default NewIncident;
