import { NavLink } from 'react-router-dom';
import {
  FileText,
  Home,
  PlusCircle,
  ShieldCheck
} from 'lucide-react';

const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', icon: Home, badge: null },
  { to: '/incidencias', label: 'Incidencias', icon: FileText, badge: null },
  { to: '/incidencias/nueva', label: 'Nueva', icon: PlusCircle, badge: null }
];

const STATUS_INDICATORS = [
  { label: 'Sistema', status: 'Operativo', color: '#0F6B4A' },
  { label: 'APIs', status: 'Disponibles', color: '#2443B3' },
  { label: 'Datos', status: 'Sincronizados', color: '#375A8C' }
];

function SidebarNav() {
  return (
    <aside className="fixed inset-y-0 left-0 z-50 hidden w-80 flex-col border-r border-white/10 bg-gradient-to-b from-dbBlue to-dbBlueDark px-6 py-6 text-white shadow-[0_22px_48px_-28px_rgba(0,18,110,0.72)] lg:flex">
      <div className="space-y-1">
        <div className="flex items-center gap-3">
          <div className="grid h-12 w-12 place-items-center rounded-2xl border border-white/25 bg-white/10">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-white/60">Deutsche Bank</p>
            <h1 className="text-xl font-black tracking-tight leading-tight">DB-Guardian</h1>
          </div>
        </div>
        <div className="ml-15 border-b border-white/10 pb-4 pt-2">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/55">Operaciones criticas</p>
        </div>
      </div>

      <div className="mt-6 space-y-2">
        {STATUS_INDICATORS.map((ind) => (
          <div
            key={ind.label}
            className="rounded-xl border border-white/15 bg-white/[0.06] px-3.5 py-3"
          >
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-[0.15em] text-white/60">{ind.label}</p>
              <div className="flex items-center gap-2">
                <div
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: ind.color }}
                />
                <span className="text-[11px] font-bold text-white/80">{ind.status}</span>
              </div>
            </div>
            <div className="mt-2 h-1 w-full rounded-full bg-white/5">
              <div
                className="h-full rounded-full transition-all"
                style={{
                  backgroundColor: ind.color,
                  width: '94%'
                }}
              />
            </div>
          </div>
        ))}
      </div>

      <nav className="mt-8 space-y-2">
        <p className="px-3 text-xs font-bold uppercase tracking-[0.18em] text-white/45">Navegacion</p>
        {NAV_ITEMS.map(({ to, label, icon: Icon, badge }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `group relative flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-colors duration-200 overflow-hidden ${
                isActive
                  ? 'bg-white/16 text-white border border-white/30'
                  : 'text-white/80 hover:text-white hover:bg-white/10 border border-transparent'
              }`
            }
          >
            <div className="relative">
              <Icon className="h-5 w-5" />
              {badge && (
                <span className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-red-500 text-[10px] font-bold text-white flex items-center justify-center shadow-lg">
                  {badge}
                </span>
              )}
            </div>
            <span className="flex-1">{label}</span>
            <div className="h-1.5 w-1.5 rounded-full bg-white/30 group-hover:bg-white/60 transition-all" />
          </NavLink>
        ))}
      </nav>

      <div className="mt-8 rounded-xl border border-amber-200/35 bg-amber-50/10 px-4 py-3.5">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 h-2 w-2 rounded-full bg-amber-300" />
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.15em] text-amber-100">1 caso escalado</p>
            <p className="mt-1.5 text-[12px] leading-5 text-amber-50/90">
              Perdida de conectividad Oracle en calculo de VaR. Requiere atencion inmediata del equipo DBA.
            </p>
          </div>
        </div>
      </div>

      <div className="mt-auto space-y-3 border-t border-white/10 pt-4">
        <div className="grid grid-cols-3 gap-2">
          <div className="rounded-lg bg-white/[0.06] px-2.5 py-2 text-center backdrop-blur">
            <p className="text-xl font-black text-white">13</p>
            <p className="text-[10px] font-semibold uppercase text-white/60 mt-0.5">Registradas</p>
          </div>
          <div className="rounded-lg bg-white/[0.06] px-2.5 py-2 text-center backdrop-blur">
            <p className="text-xl font-black text-sky-200">8</p>
            <p className="text-[10px] font-semibold uppercase text-white/60 mt-0.5">Resueltas</p>
          </div>
          <div className="rounded-lg bg-white/[0.06] px-2.5 py-2 text-center backdrop-blur">
            <p className="text-xl font-black text-amber-200">5</p>
            <p className="text-[10px] font-semibold uppercase text-white/60 mt-0.5">Activas</p>
          </div>
        </div>
      </div>
    </aside>
  );
}

export default SidebarNav;