import { Chip } from '@mui/material';

const PRIORITY_COLORS = {
  ALTA: { bg: '#FEF3F2', color: '#B42318', border: '#FECDCA' },
  MEDIA: { bg: '#FFF5E8', color: '#B54708', border: '#FFD8A8' },
  BAJA: { bg: '#F2F4F7', color: '#344054', border: '#D0D5DD' }
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
