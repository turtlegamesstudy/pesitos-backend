/* =====================================================
   Pesitos · Resultado de la rueda promocional (10 segmentos)
   ===================================================== */
export const SEGS = [
  { m: 0, c: '#17171c', label: '0' },
  { m: 0.5, c: '#232329', label: '+½' },
  { m: 0, c: '#17171c', label: '0' },
  { m: 1, c: '#2e6b3f', label: '×1' },
  { m: 0.5, c: '#232329', label: '+½' },
  { m: 2, c: '#7e1f1f', label: '×2' },
  { m: 1, c: '#2e6b3f', label: '×1' },
  { m: 3, c: '#134a63', label: '×3' },
  { m: 5, c: '#8a5a00', label: '×5' },
  { m: 4, c: '#c99700', label: 'TORO ×4' },
]

export function resolveWheelOutcome(stake, rng) {
  const idx = rng.int(SEGS.length)
  const seg = SEGS[idx]
  const ganancia = +(stake * seg.m).toFixed(2)
  return { idx, mult: seg.m, label: seg.label, ganancia }
}
