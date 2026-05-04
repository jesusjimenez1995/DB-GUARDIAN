import { Card, CardContent, Typography } from '@mui/material';
import CountUp from 'react-countup';
import { motion } from 'framer-motion';

const COLOR_MAP = {
  blue: { bg: '#EAF0FF', fg: '#0018A8', border: '#C8D4F5' },
  amber: { bg: '#FFF4E5', fg: '#9A6700', border: '#F2D6A4' },
  orange: { bg: '#FFF6ED', fg: '#9A6700', border: '#F3DEC0' },
  green: { bg: '#EAF7F1', fg: '#0F6B4A', border: '#BFE4D3' },
  red: { bg: '#FDEDED', fg: '#B42318', border: '#F5CACA' },
  slate: { bg: '#F3F5F8', fg: '#344054', border: '#D7DDE5' }
};

function KpiCard({ label, value, color = 'blue', subtitle }) {
  const palette = COLOR_MAP[color] || COLOR_MAP.blue;
  const numericValue = Number(value || 0);

  return (
    <Card
      component={motion.div}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      sx={{ borderColor: palette.border, bgcolor: palette.bg }}
    >
      <CardContent>
        <Typography variant="overline" sx={{ color: palette.fg, opacity: 0.78, fontWeight: 700 }}>
          {label}
        </Typography>
        <Typography variant="h3" sx={{ mt: 0.5, color: palette.fg, lineHeight: 1.1 }}>
          <CountUp end={numericValue} duration={0.8} separator="." />
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
