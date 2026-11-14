/* =====================================================
   Pesitos · Resultado de la ruleta (variantes g15/g20/g24)
   ===================================================== */

function sectorsOf(n) {
  const gold = Math.floor(n / 2)
  return { gold, list: Array.from({ length: n }, (_, i) => (i === gold ? 'gold' : i % 2 === 0 ? 'red' : 'black')) }
}

const pickColor = (rng, list, color) => {
  const idxs = list.map((c, i) => (c === color ? i : -1)).filter((i) => i >= 0)
  return idxs[rng.int(idxs.length)]
}

/** bet ∈ red|black|par|impar|gold · cfg = { segments, goldMult, bets } */
export function resolveRouletteOutcome(cfg, bet, stake, rng) {
  const n = cfg.segments
  const { gold, list } = sectorsOf(n)
  let idx
  if (rng.float() < 1 / n) idx = gold
  else if (rng.float() < 0.5) idx = pickColor(rng, list, 'red')
  else idx = pickColor(rng, list, 'black')
  const landColor = list[idx]
  const full = cfg.bets === 'full'
  const parity = idx % 2 === 0

  let mult = 0
  if (landColor === 'gold') {
    mult = bet === 'gold' ? cfg.goldMult : 0
  } else if (bet === landColor) {
    mult = 2
  } else if (full && (bet === 'par' || bet === 'impar')) {
    mult = (bet === 'par') === parity ? 2 : 0
  }
  const ganancia = +(stake * mult).toFixed(2)
  return { idx, landColor, parity, mult, ganancia }
}
