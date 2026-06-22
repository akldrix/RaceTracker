export const formatTime = (seconds) => {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
};

export const getWheelsWord = (count) => {
  if (count === 1) return 'штраф';
  if (count >= 2 && count <= 4) return 'штрафа';
  return 'штрафов';
};

export const getQueueWord = (count) => {
  if (count === 1) return 'АКТИВНЫЙ';
  if (count >= 2 && count <= 4) return 'АКТИВНЫХ';
  return 'АКТИВНЫХ';
};