import { Route, Routes } from 'react-router-dom';
import { Box, Container } from '@mui/material';
import Header from './components/Header';
import Dashboard from './pages/Dashboard';
import IncidentDetail from './pages/IncidentDetail';
import IncidentList from './pages/IncidentList';
import NewIncident from './pages/NewIncident';

function App() {
  return (
    <Box sx={{ minHeight: '100vh', position: 'relative', pb: 6 }}>
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          background:
            'radial-gradient(circle at 5% 22%, rgba(0,24,168,0.09), transparent 28%), radial-gradient(circle at 95% 78%, rgba(0,163,180,0.1), transparent 32%)'
        }}
      />
      <Header />
      <Container maxWidth="lg" sx={{ position: 'relative', pt: { xs: 2.5, md: 4 }, px: { xs: 1.5, sm: 2.5 } }}>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/incidencias" element={<IncidentList />} />
          <Route path="/incidencias/nueva" element={<NewIncident />} />
          <Route path="/incidencias/:id" element={<IncidentDetail />} />
        </Routes>
      </Container>
    </Box>
  );
}

export default App;

