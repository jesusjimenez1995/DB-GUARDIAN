import { Clock3, FileText, Lightbulb } from 'lucide-react';

function formatDate(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
}

function ResolvedIncidentsPanel({ title, subtitle, items = [], loading = false, error = '', emptyMessage = 'No hay coincidencias resueltas suficientes todavía.' }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 px-5 py-4">
        <div className="flex items-start gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-2xl bg-blue-50 text-dbBlue">
            <Lightbulb className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-dbBlue">Conocimiento histórico</p>
            <h3 className="mt-1 text-lg font-semibold text-slate-900">{title}</h3>
            <p className="mt-1 text-sm leading-6 text-slate-500">{subtitle}</p>
          </div>
        </div>
      </div>

      <div className="space-y-3 px-5 py-4">
        {loading ? <p className="text-sm text-slate-500">Buscando incidencias resueltas similares...</p> : null}
        {!loading && error ? <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}
        {!loading && !error && items.length === 0 ? (
          <p className="text-sm text-slate-500">{emptyMessage}</p>
        ) : null}

        {items.map((item) => (
          <article key={item.ID} className="rounded-2xl border border-slate-200 bg-slate-50 p-4 transition hover:border-dbBlue hover:bg-white hover:shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-slate-900">{item.TITULO}</p>
                <p className="mt-1 text-xs uppercase tracking-[0.16em] text-slate-500">{item.APP_NAME} · {item.ERROR_CODE}</p>
              </div>
              <span className="shrink-0 rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-semibold text-dbBlue">
                {item.SCORE}%
              </span>
            </div>

            <div className="mt-3 flex flex-wrap gap-2 text-[11px] font-semibold text-slate-600">
              {item.REASONS?.map((reason) => (
                <span key={reason} className="rounded-full bg-white px-2.5 py-1 border border-slate-200">{reason}</span>
              ))}
            </div>

            <p className="mt-3 max-h-20 overflow-hidden text-sm leading-6 text-slate-600">
              {item.SOLUTION_EXCERPT || 'La solución histórica está disponible para consulta en el detalle del caso.'}
            </p>

            <div className="mt-3 flex items-center gap-3 text-xs text-slate-500">
              <span className="inline-flex items-center gap-1"><Clock3 className="h-3.5 w-3.5 text-dbBlue" /> {formatDate(item.FECHA_RESOLUCION)}</span>
              <span className="inline-flex items-center gap-1"><FileText className="h-3.5 w-3.5 text-dbBlue" /> {item.ESTADO}</span>
            </div>

            <div className="mt-3">
              <a
                href={`#/incidencias/${item.ID}`}
                className="inline-flex items-center rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-dbBlue transition hover:border-dbBlue"
              >
                Ver caso histórico #{item.ID}
              </a>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export default ResolvedIncidentsPanel;