import { createTheme } from '@mui/material/styles';

const palette = {
  primary: {
    main: '#0018A8',
    light: '#2443B3',
    dark: '#00126E',
    contrastText: '#FFFFFF'
  },
  secondary: {
    main: '#375A8C',
    light: '#4E6FA0',
    dark: '#2A4A78',
    contrastText: '#FFFFFF'
  },
  background: {
    default: '#F5F7FA',
    paper: '#FFFFFF'
  },
  text: {
    primary: '#111827',
    secondary: '#4B5565'
  },
  warning: {
    main: '#9A6700'
  },
  success: {
    main: '#0F6B4A'
  },
  error: {
    main: '#B42318'
  }
};

const theme = createTheme({
  palette,
  shape: {
    borderRadius: 12
  },
  typography: {
    fontFamily: '"IBM Plex Sans", "Segoe UI", sans-serif',
    h1: { fontWeight: 700 },
    h2: { fontWeight: 700 },
    h3: { fontWeight: 700 },
    h4: { fontWeight: 700 },
    h5: { fontWeight: 700 },
    h6: { fontWeight: 700 }
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none'
        }
      }
    },
    MuiCard: {
      styleOverrides: {
        root: {
          border: '1px solid #D9DEE8',
          boxShadow: '0 1px 2px rgba(17, 24, 39, 0.05), 0 10px 22px rgba(17, 24, 39, 0.05)'
        }
      }
    },
    MuiButton: {
      defaultProps: {
        disableElevation: true,
        size: 'medium'
      },
      styleOverrides: {
        root: {
          borderRadius: 12,
          textTransform: 'none',
          fontWeight: 700,
          minHeight: 38,
          paddingInline: 16,
          '&:focus-visible': {
            outline: 'none',
            boxShadow: '0 0 0 3px rgba(0, 24, 168, 0.22)'
          }
        },
        containedPrimary: {
          '&:hover': {
            backgroundColor: '#00126E'
          }
        },
        containedSecondary: {
          '&:hover': {
            backgroundColor: '#2A4A78'
          }
        }
      }
    },
    MuiIconButton: {
      defaultProps: {
        size: 'small'
      }
    },
    MuiTextField: {
      defaultProps: {
        size: 'small'
      }
    },
    MuiFormControl: {
      defaultProps: {
        size: 'small'
      }
    }
  }
});

export default theme;