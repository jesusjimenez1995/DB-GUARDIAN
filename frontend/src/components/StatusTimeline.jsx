import { Paper, Step, StepLabel, Stepper, Typography } from '@mui/material';
import { STATUS_FLOW } from '../constants';

function StatusTimeline({ currentStatus }) {
  const currentIdx = STATUS_FLOW.indexOf(currentStatus);

  return (
    <Paper sx={{ p: { xs: 2, md: 3 } }}>
      <Typography variant="overline" sx={{ color: 'text.secondary', letterSpacing: 1.2 }}>
        Flujo de Estado
      </Typography>
      <Stepper
        activeStep={currentIdx < 0 ? 0 : currentIdx}
        alternativeLabel
        sx={{
          mt: 1,
          '& .MuiStepIcon-root.Mui-active': { color: 'primary.main' },
          '& .MuiStepIcon-root.Mui-completed': { color: 'secondary.main' },
          '& .MuiStepConnector-line': { borderTopWidth: 2 }
        }}
      >
        {STATUS_FLOW.map((status) => (
          <Step key={status}>
            <StepLabel>{status}</StepLabel>
          </Step>
        ))}
      </Stepper>
    </Paper>
  );
}

export default StatusTimeline;
