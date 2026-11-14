/* =====================================================
   Pesitos · Resolución de juegos del lado servidor
   Misma función que el cliente anima: con la MISMA semilla
   ambos obtienen exactamente el mismo tablero.
   ===================================================== */
import { createRng, newRoundSeed } from '../../shared/prng.mjs'
import { resolveSlotOutcome } from '../../shared/slotOutcome.mjs'
import { resolveRouletteOutcome } from '../../shared/rouletteOutcome.mjs'
import { resolveWheelOutcome } from '../../shared/wheelOutcome.mjs'
import { SLOT_CFG, ROULETTE_CFG } from '../../src/data/gameVariants.js'

export function listGames() {
  return {
    slot: Object.keys(SLOT_CFG),
    roulette: Object.keys(ROULETTE_CFG),
    wheel: ['g23'],
  }
}

export function gameKind(gameId) {
  if (SLOT_CFG[gameId]) return 'slot'
  if (ROULETTE_CFG[gameId]) return 'roulette'
  if (gameId === 'g23' || gameId === 'wheel') return 'wheel' // Rueda del Toro
  return null
}

/** Resuelve una ronda y devuelve TODO lo necesario para animarla y cobrarla. */
export function resolveGame({ gameId, stake, bet }) {
  const kind = gameKind(gameId)
  if (!kind) return null
  const seed = newRoundSeed()
  const rng = createRng(seed)
  if (kind === 'slot') {
    const cfg = SLOT_CFG[gameId]
    const out = resolveSlotOutcome(cfg, rng)
    const ganancia = +(stake * out.mult).toFixed(2)
    return { kind, seed, gameId, stake, ganancia, mult: out.mult, cells: out.cells, hits: out.hits, label: out.label, symIco: out.symIco, respinPendiente: out.respinPendiente, respinMult: out.respinMult }
  }
  if (kind === 'roulette') {
    const cfg = ROULETTE_CFG[gameId]
    const bb = String(bet || 'red')
    const out = resolveRouletteOutcome(cfg, bb, stake, rng)
    return { kind, seed, gameId, stake, bet: bb, idx: out.idx, landColor: out.landColor, parity: out.parity, mult: out.mult, ganancia: out.ganancia }
  }
  // wheel
  const out = resolveWheelOutcome(stake, rng)
  return { kind, seed, gameId, stake, ganancia: out.ganancia, mult: out.mult, idx: out.idx, label: out.label }
}
