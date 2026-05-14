import { AppBar, Box, Button, Container, Stack, Typography } from '@mui/material';
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined';
import AddOutlinedIcon from '@mui/icons-material/AddOutlined';
import { NavLink, useLocation } from 'react-router-dom';

const NAV = [
  { to: '/', label: 'Dashboard' },
  { to: '/incidencias', label: 'Incidencias' }
];

function Header() {
  const location = useLocation();
  const isActive = (to) => (to === '/' ? location.pathname === '/' : location.pathname.startsWith(to));

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        background:
          'linear-gradient(105deg, rgba(0,16,117,0.97) 0%, rgba(0,24,168,0.95) 56%, rgba(0,118,145,0.92) 100%)',
        borderBottom: '1px solid rgba(255,255,255,0.15)',
        backdropFilter: 'blur(6px)'
      }}
    >
      <Container maxWidth="lg" sx={{ px: { xs: 1.5, sm: 2.5 } }}>
        <Box sx={{ py: { xs: 1, md: 1.15 } }}>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr auto', md: 'auto 1fr auto' },
              alignItems: 'center',
              gap: { xs: 1, md: 1.5 }
            }}
          >
            <Stack direction="row" alignItems="center" spacing={1.2} sx={{ minWidth: 0 }}>
<<<<<<< HEAD
              <Box
                sx={{
                  width: { xs: 34, md: 38 },
                  height: { xs: 34, md: 38 },
                  borderRadius: 2,
                  bgcolor: 'rgba(255,255,255,0.14)',
                  display: 'grid',
                  placeItems: 'center',
                  border: '1px solid rgba(255,255,255,0.25)'
                }}
              >
                <ShieldOutlinedIcon sx={{ color: 'white', fontSize: { xs: 18, md: 20 } }} />
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.75)', letterSpacing: 1.2, lineHeight: 1.1 }}>
                  DEUTSCHE BANK
                </Typography>
                <Typography sx={{ lineHeight: 1.1, color: 'white', fontWeight: 700, fontSize: { xs: '1rem', md: '1.08rem' } }}>
                  DB-Guardian
                </Typography>
              </Box>
=======
            <Box
              sx={{
                width: { xs: 34, md: 38 },
                height: { xs: 34, md: 38 },
                borderRadius: 2,
                bgcolor: 'rgba(255,255,255,0.14)',
                display: 'grid',
                placeItems: 'center',
                border: '1px solid rgba(255,255,255,0.25)'
              }}
            >
              <ShieldOutlinedIcon sx={{ color: 'white', fontSize: { xs: 18, md: 20 } }} />
            </Box>
            <Box>
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.75)', letterSpacing: 1.2, lineHeight: 1.1 }}>
                DEUTSCHE BANK
              </Typography>
              <Typography sx={{ lineHeight: 1.1, color: 'white', fontWeight: 700, fontSize: { xs: '1rem', md: '1.08rem' } }}>
                DB-Guardian
              </Typography>
            </Box>
>>>>>>> 1cced019334f5861a6b7e6c3cafb1e59f10d0ba0
            </Stack>

            <Box
              sx={{
                display: 'flex',
                justifyContent: { xs: 'flex-start', md: 'center' },
                gridColumn: { xs: '1 / -1', md: 'auto' },
                order: { xs: 3, md: 2 }
              }}
            >
              <Box
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 0.6,
                  p: 0.45,
                  borderRadius: 999,
                  bgcolor: 'rgba(255,255,255,0.08)',
                  border: '1px solid rgba(255,255,255,0.14)'
                }}
              >
                {NAV.map(({ to, label }) => {
                  const active = isActive(to);
                  return (
                    <Button
                      key={to}
                      component={NavLink}
                      to={to}
                      color="inherit"
                      size="small"
                      sx={{
                        px: 1.4,
                        py: 0.55,
                        minWidth: 0,
                        color: 'white',
                        opacity: active ? 1 : 0.84,
                        whiteSpace: 'nowrap',
                        borderRadius: 999,
                        bgcolor: active ? 'rgba(255,255,255,0.16)' : 'transparent',
                        boxShadow: active ? 'inset 0 0 0 1px rgba(255,255,255,0.18)' : 'none',
                        '&:hover': {
                          bgcolor: active ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.1)'
                        }
                      }}
                    >
                      {label}
                    </Button>
                  );
                })}
              </Box>
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', order: { xs: 2, md: 3 } }}>
<<<<<<< HEAD
              <Button
                component={NavLink}
                to="/incidencias/nueva"
                variant="contained"
                color="secondary"
                size="medium"
                startIcon={<AddOutlinedIcon />}
                sx={{
                  color: 'white',
                  px: { xs: 1.5, sm: 1.9 },
                  minWidth: 0,
                  borderRadius: 999,
                  '& .MuiButton-startIcon': { mr: { xs: 0.35, sm: 0.7 } }
                }}
              >
                <Box component="span">Nueva Incidencia</Box>
              </Button>
=======
            <Button
              component={NavLink}
              to="/incidencias/nueva"
              variant="contained"
              color="secondary"
              size="medium"
              startIcon={<AddOutlinedIcon />}
              sx={{
                color: 'white',
                px: { xs: 1.5, sm: 1.9 },
                minWidth: 0,
                borderRadius: 999,
                '& .MuiButton-startIcon': { mr: { xs: 0.35, sm: 0.7 } }
              }}
            >
              <Box component="span">
                Nueva Incidencia
              </Box>
            </Button>
>>>>>>> 1cced019334f5861a6b7e6c3cafb1e59f10d0ba0
            </Box>
          </Box>
        </Box>
      </Container>
    </AppBar>
  );
}

export default Header;
