import { Chip } from '@mui/material';

const PRIORITY_COLORS = {
  ALTA: { bg: '#FDEDED', color: '#B42318', border: '#F5CACA' },
  MEDIA: { bg: '#FFF4E5', color: '#9A6700', border: '#F2D6A4' },
  BAJA: { bg: '#F3F5F8', color: '#344054', border: '#D7DDE5' }
};

function PriorityBadge({ priority }) {
  if (!priority) return null;
  const palette = PRIORITY_COLORS[priority] || PRIORITY_COLORS.MEDIA;

  return (
    <Chip
      size="small"
      label={priority}
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

export default PriorityBadge;
