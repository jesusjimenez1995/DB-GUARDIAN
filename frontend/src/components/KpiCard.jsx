import { Card, CardContent, Typography } from '@mui/material';

const COLOR_MAP = {
  blue: { bg: '#EEF4FF', fg: '#0018A8', border: '#C5D1FF' },
  amber: { bg: '#FFF5E8', fg: '#B54708', border: '#FFD8A8' },
  orange: { bg: '#FFF0EB', fg: '#C4320A', border: '#FFC1AE' },
  green: { bg: '#ECFDF3', fg: '#067647', border: '#A6F4C5' },
  red: { bg: '#FEF3F2', fg: '#B42318', border: '#FECDCA' },
  slate: { bg: '#F2F4F7', fg: '#344054', border: '#D0D5DD' }
};

function KpiCard({ label, value, color = 'blue', subtitle }) {
  const palette = COLOR_MAP[color] || COLOR_MAP.blue;

  return (
    <Card sx={{ borderColor: palette.border, bgcolor: palette.bg }}>
      <CardContent>
        <Typography variant="overline" sx={{ color: palette.fg, opacity: 0.78, fontWeight: 700 }}>
          {label}
        </Typography>
        <Typography variant="h3" sx={{ mt: 0.5, color: palette.fg, lineHeight: 1.1 }}>
          {value}
        </Typography>
        {subtitle ? (
          <Typography variant="caption" sx={{ color: palette.fg, opacity: 0.8 }}>
            {subtitle}
          </Typography>
        ) : null}
      </CardContent>
    </Card>
  );
}

export default KpiCard;
