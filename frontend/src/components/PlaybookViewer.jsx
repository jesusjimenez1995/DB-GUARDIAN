import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';

function PlaybookViewer({ playbook }) {
  if (!playbook) {
    return (
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-dbBlue">Playbook viewer</p>
        <h3 className="mt-2 text-lg font-semibold text-slate-900">Selecciona una sugerencia</h3>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          El contenido histórico aparecerá aquí con una lectura limpia y sin bordes pesados.
        </p>
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3 border-b border-slate-200 pb-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-dbBlue">Playbook asociado</p>
          <h3 className="mt-2 text-lg font-semibold text-slate-900">{playbook.ERROR_MATCH}</h3>
        </div>
        <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">
          Procedimiento histórico
        </span>
      </div>

      <div className="prose prose-slate prose-sm mt-4 max-w-none prose-headings:font-semibold prose-headings:text-slate-900 prose-a:text-dbBlue prose-a:no-underline hover:prose-a:underline">
        <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw, rehypeSanitize]}>
          {playbook.PROCEDIMIENTO_CLOB || ''}
        </ReactMarkdown>
      </div>

      {playbook.LINKS_INTERNOS ? (
        <div className="mt-4 border-t border-slate-200 pt-4">
          <a
            href={playbook.LINKS_INTERNOS}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1.5 text-sm font-semibold text-dbBlue transition hover:bg-slate-200"
          >
            Ver documentación interna
          </a>
        </div>
      ) : null}
    </section>
  );
}

export default PlaybookViewer;
