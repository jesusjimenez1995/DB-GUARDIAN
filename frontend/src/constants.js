export const STATUS_FLOW = [
  'NUEVA',
  'ASIGNADA',
  'EN INVESTIGACIÓN',
  'ESCALADA',
  'SOLUCIONADA',
  'CERRADA'
];

export const STATUS_COLORS = {
<<<<<<< HEAD
  NUEVA: { bg: '#F3F5F8', color: '#344054', border: '#D7DDE5' },
  ASIGNADA: { bg: '#EAF0FF', color: '#1F3F9C', border: '#C8D4F5' },
  'EN INVESTIGACIÓN': { bg: '#EEF2F7', color: '#334155', border: '#D5DEEA' },
  ESCALADA: { bg: '#FFF4E5', color: '#9A6700', border: '#F2D6A4' },
  SOLUCIONADA: { bg: '#EAF7F1', color: '#0F6B4A', border: '#BFE4D3' },
  CERRADA: { bg: '#ECEFF3', color: '#344054', border: '#D1D8E2' },
  DEFAULT: { bg: '#F3F5F8', color: '#344054', border: '#D7DDE5' }
=======
  NUEVA: { bg: '#F2F4F7', color: '#344054', border: '#D0D5DD' },
  ASIGNADA: { bg: '#EFF8FF', color: '#175CD3', border: '#B2DDFF' },
  'EN INVESTIGACIÓN': { bg: '#FFF9EB', color: '#B54708', border: '#FEDF89' },
  ESCALADA: { bg: '#FFF0EB', color: '#C4320A', border: '#F9B6A5' },
  SOLUCIONADA: { bg: '#ECFDF3', color: '#067647', border: '#ABEFC6' },
  CERRADA: { bg: '#EAECF0', color: '#1D2939', border: '#D0D5DD' },
  DEFAULT: { bg: '#F2F4F7', color: '#344054', border: '#D0D5DD' }
>>>>>>> 1cced019334f5861a6b7e6c3cafb1e59f10d0ba0
};

export const KNOWN_APPS = [
  'DPMTOOLS',
  'Valeexchange',
  'ProcesosHistoricos',
  'RiskEngine',
  'PaymentsCore'
];

export function getNextStatus(currentStatus) {
  const idx = STATUS_FLOW.indexOf(currentStatus);
  if (idx < 0 || idx >= STATUS_FLOW.length - 1) return null;
  return STATUS_FLOW[idx + 1];
}
