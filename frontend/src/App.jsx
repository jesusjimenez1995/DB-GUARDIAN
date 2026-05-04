import { Suspense, lazy } from 'react';
import { LinearProgress } from '@mui/material';
import { Route, Routes } from 'react-router-dom';
import SidebarNav from './components/SidebarNav';

const Dashboard = lazy(() => import('./pages/Dashboard'));
const IncidentList = lazy(() => import('./pages/IncidentList'));
const NewIncident = lazy(() => import('./pages/NewIncident'));
const IncidentDetail = lazy(() => import('./pages/IncidentDetail'));

function RouteFallback() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-dbBlue">Cargando vista</p>
      <LinearProgress sx={{ mt: 1.25, borderRadius: 999 }} />
    </div>
  );
}

function App() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <SidebarNav />
      <div className="min-h-screen lg:pl-72">
        <div className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur lg:hidden">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-dbBlue">Deutsche Bank</p>
              <p className="text-sm font-semibold text-slate-900">DB-Guardian</p>
            </div>
            <div className="flex items-center gap-2">
              <a className="rounded-full border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700" href="#/incidencias">
                Incidencias
              </a>
              <a className="rounded-full bg-dbBlue px-3 py-1.5 text-xs font-semibold text-white" href="#/incidencias/nueva">
                Nueva
              </a>
            </div>
          </div>
        </div>
        <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <Suspense fallback={<RouteFallback />}>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/incidencias" element={<IncidentList />} />
              <Route path="/incidencias/nueva" element={<NewIncident />} />
              <Route path="/incidencias/:id" element={<IncidentDetail />} />
            </Routes>
          </Suspense>
        </main>
      </div>
    </div>
  );
}

export default App;

