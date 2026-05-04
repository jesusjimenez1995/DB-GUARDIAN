import { createTheme } from '@mui/material/styles';

const palette = {
  primary: {
    main: '#0018A8',
    light: '#2742C9',
    dark: '#001075',
    contrastText: '#FFFFFF'
  },
  secondary: {
    main: '#00A3B4',
    light: '#38BFCD',
    dark: '#00717D'
  },
  background: {
    default: '#F4F7FD',
    paper: '#FFFFFF'
  },
  text: {
    primary: '#101828',
    secondary: '#475467'
  },
  warning: {
    main: '#B54708'
  },
  success: {
    main: '#067647'
  },
  error: {
    main: '#B42318'
  }
};

const theme = createTheme({
  palette,
  shape: {
    borderRadius: 16
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
          border: '1px solid #EAECF0',
          boxShadow: '0 1px 2px rgba(16, 24, 40, 0.06), 0 8px 24px rgba(16, 24, 40, 0.06)'
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
          paddingInline: 16
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