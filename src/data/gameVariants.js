/* =====================================================================
   Pesitos · Config única por juego (empresa Pesitos)
   ---------------------------------------------------------------
   Cada slot tiene su propia mecánica, símbolos y pago: rodillos
   3 ó 5, volatilidad, comodín (WILD), escena libre (RESPIN) o TURBO.
   Las ruletas/mesas divert Eleven variantes de pagos y ritmo.
   Los pesos (w) se derivan de tier/wild en SlotEngine.
   ===================================================================== */

/* Pool común: cada entrada { icon, tier, pay } · tier: 'big' | 'prem' | '' */
export const SLOT_CFG = {
  g1: {
    reels: 3, vol: 'Alta',
    wild: { icon: 'Castle', pay: 12 },
    pool: [
      { icon: 'Castle', wild: true, pay: 12 },
      { icon: 'Crown', tier: 'prem', pay: 10 },
      { icon: 'Map', tier: 'big', pay: 9 },
      { icon: 'Sun', pay: 7 },
      { icon: 'Mountain', pay: 6 },
      { icon: 'Coins', pay: 6 },
    ],
    hint: 'El TEMPLO es comodín (completa tríos) · triple hasta ×12',
  },
  g2: {
    reels: 5, vol: 'Media',
    turbo: { p2: 0.2, p3: 0.08 },
    pool: [
      { icon: 'Coins', tier: 'big', pay: 8 },
      { icon: 'Bell', tier: 'prem', pay: 7 },
      { icon: 'Egg', pay: 6 },
      { icon: 'Cake', pay: 6 },
      { icon: 'Star', pay: 5 },
    ],
    hint: '5 rodillos · corridas ×8 · ×17 · ×36 · TURBO puede doblar',
  },
  g3: {
    reels: 3, vol: 'Media',
    wild: { icon: 'Bull', pay: 12 },
    pool: [
      { icon: 'Bull', wild: true, pay: 12 },
      { icon: 'Crown', tier: 'prem', pay: 10 },
      { icon: 'Cherry', pay: 7 },
      { icon: 'Mountain', pay: 6 },
      { icon: 'Skull', pay: 6 },
    ],
    hint: 'El TORO es comodín · embiste hasta ×12',
  },
  g4: {
    reels: 5, vol: 'Alta',
    scatter: { icon: 'Snail', respinMult: 2 },
    pool: [
      { icon: 'Banana', tier: 'big', pay: 9 },
      { icon: 'TreePine', tier: 'prem', pay: 7 },
      { icon: 'Bug', pay: 6 },
      { icon: 'Flower', pay: 6 },
      { icon: 'Rabbit', pay: 5 },
      { icon: 'Snail', scatter: true, pay: 0 },
    ],
    hint: '2+ caracoles abren la ESCENA LIBRE (respin) · premios ×2 en ese giro',
  },
  g5: {
    reels: 3, vol: 'Baja',
    turbo: { p2: 0.25, p3: 0 },
    pool: [
      { icon: 'Clover', tier: 'big', pay: 8 },
      { icon: 'Medal', tier: 'prem', pay: 7 },
      { icon: 'Leaf', pay: 6 },
      { icon: 'Flower', pay: 6 },
      { icon: 'Sun', pay: 5 },
    ],
    hint: 'Volatilidad baja · premios frecuentes · TURBO puede doblar',
  },
  g6: {
    reels: 5, vol: 'Media',
    turbo: { p2: 0.18, p3: 0 },
    pool: [
      { icon: 'Crown', tier: 'big', pay: 9 },
      { icon: 'Gem', tier: 'prem', pay: 8 },
      { icon: 'Bell', pay: 7 },
      { icon: 'Hourglass', pay: 6 },
      { icon: 'Key', pay: 6 },
    ],
    hint: '5 rodillos reales · Corona ×9 · ×19 · ×41 · TURBO disponible',
  },
  g7: {
    reels: 5, vol: 'Alta',
    wild: { icon: 'Shell', pay: 10 },
    pool: [
      { icon: 'Shell', wild: true, pay: 10 },
      { icon: 'Fish', tier: 'big', pay: 10 },
      { icon: 'Anchor', tier: 'prem', pay: 7 },
      { icon: 'Turtle', pay: 6 },
      { icon: 'Star', pay: 5 },
    ],
    hint: '5 rodillos · la CONCHA es comodín · corridas ×10 · ×22 · ×46',
  },
  g8: {
    reels: 5, vol: 'Media',
    scatter: { icon: 'Egg', respinMult: 2 },
    pool: [
      { icon: 'PartyPopper', tier: 'big', pay: 8 },
      { icon: 'Candy', tier: 'prem', pay: 7 },
      { icon: 'Cake', pay: 6 },
      { icon: 'Popcorn', pay: 6 },
      { icon: 'Cookie', pay: 5 },
      { icon: 'Egg', scatter: true, pay: 0 },
    ],
    hint: '2+ huevos rompen la piñata: RESPIN con premios ×2',
  },
  g9: {
    reels: 3, vol: 'Alta',
    pool: [
      { icon: 'Skull', tier: 'big', pay: 11 },
      { icon: 'Flame', tier: 'prem', pay: 8 },
      { icon: 'TreePine', pay: 7 },
      { icon: 'Moon', pay: 6 },
      { icon: 'Star', pay: 6 },
    ],
    hint: 'Tiki puro: sin comodines · fuego ×11 para valientes',
  },
  g10: {
    reels: 5, vol: 'Alta',
    turbo: { p2: 0.18, p3: 0.1 },
    pool: [
      { icon: 'Diamond', tier: 'big', pay: 11 },
      { icon: 'Gem', tier: 'prem', pay: 9 },
      { icon: 'Coins', pay: 7 },
      { icon: 'Atom', pay: 6 },
      { icon: 'Star', pay: 6 },
    ],
    hint: '5 rodillos · corridas ×11 · ×24 · ×50 · TURBO triplica la emoción',
  },
  g11: {
    reels: 3, vol: 'Media',
    turbo: { p2: 0.22, p3: 0 },
    pool: [
      { icon: 'Vibrate', tier: 'big', pay: 9 },
      { icon: 'Rose', tier: 'prem', pay: 7 },
      { icon: 'Zap', pay: 7 },
      { icon: 'Cherry', pay: 6 },
      { icon: 'Candy', pay: 5 },
    ],
    hint: 'Ritmo de salsa · TURDO puede doblar el premio',
  },
  g12: {
    reels: 3, vol: 'Alta',
    turbo: { p2: 0.18, p3: 0 },
    pool: [
      { icon: 'Map', tier: 'big', pay: 15 },
      { icon: 'Compass', tier: 'prem', pay: 9 },
      { icon: 'Sun', pay: 7 },
      { icon: 'Mountain', pay: 7 },
      { icon: 'Coins', pay: 6 },
    ],
    hint: 'El MAPA paga el gran premio ×15 · TURBO a la leyenda',
  },
  g13: {
    reels: 5, vol: 'Media',
    scatter: { icon: 'Egg', respinMult: 3 },
    pool: [
      { icon: 'Banknote', tier: 'big', pay: 8 },
      { icon: 'Coins', tier: 'prem', pay: 6 },
      { icon: 'Key', pay: 6 },
      { icon: 'Sun', pay: 5 },
      { icon: 'Snail', pay: 5 },
      { icon: 'Egg', scatter: true, pay: 0 },
    ],
    hint: '2+ billetes ocultos: TESORO LIBRE (respin · premios ×3)',
  },
  g14: {
    reels: 3, vol: 'Media',
    turbo: { p2: 0.2, p3: 0.1 },
    pool: [
      { icon: 'Zap', tier: 'big', pay: 10 },
      { icon: 'Diamond', tier: 'prem', pay: 8 },
      { icon: 'Cherry', pay: 6 },
      { icon: 'Star', pay: 6 },
      { icon: 'Bell', pay: 6 },
    ],
    hint: 'Neón clásico 777 · TURBO hasta ×3 el premio',
  },
}

/** Pago por corrida en 5 rodillos a partir del pago base del símbolo. */
export const RUN_MULT = { 3: 1, 4: 2.2, 5: 4.6 }

/* ===================== Ruletas (3 variantes) ===================== */
/* sectors: total de casillas · goldMult: pago de la dorada (1/n) */
export const ROULETTE_CFG = {
  g15: {
    segments: 15, goldMult: 15, durClassic: 4400, fmt: 'CLÁSICA',
    bets: 'color', // roja/negra/dorada
  },
  g20: {
    segments: 21, goldMult: 21, durClassic: 4600, fmt: 'GRAN SALÓN',
    bets: 'full', // color + par/impar
  },
  g24: {
    segments: 9, goldMult: 9, durClassic: 2100, fmt: 'EXPRESS',
    bets: 'color',
  },
}

/* ===================== Variantes de mesa ===================== */
export const TABLE_CFG = {
  g16: { blackjack: { live: false } }, // VIP: norma base
  g21: { blackjack: { live: true } },  // En vivo: se ofrece SEGURO con A visible
  g17: { baccarat: { live: false } },  // Cordobés: Jugador/Banca/Empate
  g22: { baccarat: { live: true } },   // En vivo: añade apuesta TORO (9 natural)
  g18: { craps: {} },                  // Pase o CAMPO
  g19: { poker: {} },                  // Doble o nada tras premio
}

export const slotCfgOf = (g) => SLOT_CFG[g.id] || null
export const rouletteCfgOf = (g) => ROULETTE_CFG[g.id] || ROULETTE_CFG.g15
