import { Chip } from '@mui/material';
import { STATUS_COLORS } from '../constants';

function StatusBadge({ status }) {
  const palette = STATUS_COLORS[status] || STATUS_COLORS.DEFAULT;

  return (
    <Chip
      size="small"
      label={status}
      sx={{
        bgcolor: palette.bg,
        color: palette.color,
        border: `1px solid ${palette.border}`,
        fontWeight: 700,
        height: 24
      }}
    />
  );
}

export default StatusBadge;
