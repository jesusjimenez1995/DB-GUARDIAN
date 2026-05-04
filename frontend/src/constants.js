export const STATUS_FLOW = [
  'NUEVA',
  'ASIGNADA',
  'EN INVESTIGACIÓN',
  'ESCALADA',
  'SOLUCIONADA',
  'CERRADA'
];

export const STATUS_COLORS = {
  NUEVA: { bg: '#F2F4F7', color: '#344054', border: '#D0D5DD' },
  ASIGNADA: { bg: '#EFF8FF', color: '#175CD3', border: '#B2DDFF' },
  'EN INVESTIGACIÓN': { bg: '#FFF9EB', color: '#B54708', border: '#FEDF89' },
  ESCALADA: { bg: '#FFF0EB', color: '#C4320A', border: '#F9B6A5' },
  SOLUCIONADA: { bg: '#ECFDF3', color: '#067647', border: '#ABEFC6' },
  CERRADA: { bg: '#EAECF0', color: '#1D2939', border: '#D0D5DD' },
  DEFAULT: { bg: '#F2F4F7', color: '#344054', border: '#D0D5DD' }
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
