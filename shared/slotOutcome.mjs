/* =====================================================
   Pesitos · Resultado de slots (3 y 5 rodillos)
   Fuente ÚNICA de verdad: el servidor la ejecuta para cobrar,
   el cliente la ejecuta para animar. Misma semilla → mismo resultado.
   Replica la lógica original del motor (SlotEngine) con rng inyectado.
   ===================================================== */
import { RUN_MULT } from '../src/data/gameVariants.js'

export const weightOf = (e) =>
  e.scatter ? 0.9 : e.wild ? 1.5 : e.tier === 'prem' ? 2.1 : e.tier === 'big' ? 3.4 : 3

export function poolFor(cfg) {
  return cfg.pool.map((e) => ({ ...e, w: weightOf(e) }))
}

const poolType = (list) => list.map((p) => ({ v: p, w: p.w }))
const pickW = (rng, items) => rng.pickWeighted(items)
const pickTwo = (rng, n) => {
  const poolArr = [...Array(n).keys()]
  const i = rng.int(n)
  let j = rng.int(n - 1)
  if (j >= i) j += 1
  return [i, j]
}

/** Devuelve { cells, mult, hits, label, symIco, respinPendiente, respinMult } */
export function resolveSlotOutcome(cfg, rng) {
  const isFive = cfg.reels === 5
  const pool = poolFor(cfg)
  let mult = 0
  let symIco = null
  let hits = []
  let label = null
  let cells = null
  let respinPendiente = false
  let respinMult = 0

  if (!isFive) {
    /* ===== 3 RODILLOS ===== */
    const wList = poolType(pool)
    const noWild = pool.filter((p) => !p.wild)
    const pairBoost = noWild.map((p) => ({ v: p, w: p.tier ? p.w * 0.55 : p.w + 1.6 }))
    const r = rng.float()
    if (r < 0.055) {
      const s = pickW(rng, wList)
      cells = [s, s, s]
      mult = s.pay
      symIco = s.icon
      hits = [0, 1, 2]
      label = s.wild ? 'TRIPLE DEL TORO' : 'TRIPLE'
    } else if (r < 0.063 && (cfg.wild || pool.some((p) => p.wild))) {
      const x = pickW(rng, pairBoost)
      const wild = pool.find((p) => p.wild)
      cells = [x, x, wild]
      mult = x.pay
      symIco = x.icon
      hits = [0, 1, 2]
      label = 'COMODÍN COMPLETA'
    } else if (r < 0.38) {
      const s = pickW(rng, pairBoost)
      const others = noWild.filter((p) => p.icon !== s.icon).map((p) => ({ v: p, w: p.w }))
      cells = [s, s, pickW(rng, others)]
      mult = 1.6
      symIco = s.icon
      label = 'PAR ×1.6'
      hits = [0, 1]
    } else {
      const a = pickW(rng, wList)
      let b = pickW(rng, wList)
      let c = pickW(rng, wList)
      while (b.icon === a.icon) b = pickW(rng, wList)
      while (c.icon === a.icon || c.icon === b.icon) c = pickW(rng, wList)
      cells = [a, b, c]
    }
    if (mult > 0 && cfg.turbo) {
      if (rng.float() < cfg.turbo.p2) {
        mult *= 2
        label = 'TURBO ×2 · ' + label
      } else if (cfg.turbo.p3 && mult >= 6 && rng.float() < cfg.turbo.p3) {
        mult *= 3
        label = 'TURBO ×3 · ' + label
      }
    }
  } else {
    /* ===== 5 RODILLOS ===== */
    const line = pool.filter((p) => !p.scatter)
    const big = line[0]
    const wPool = poolType(line)
    const pickOther = (icon) => pickW(rng, line.filter((p) => p.icon !== icon && !p.wild).map((p) => ({ v: p, w: p.w })))
    const rr = rng.float()
    if (rr < 0.06) {
      cells = [big, big, big, big, big]
      mult = +(big.pay * RUN_MULT[5]).toFixed(1)
      symIco = big.icon
      hits = [0, 1, 2, 3, 4]
      label = 'QUINTILLA'
    } else if (rr < 0.17) {
      cells = [big, big, big, big, pickOther(big.icon)]
      mult = +(big.pay * RUN_MULT[4]).toFixed(1)
      symIco = big.icon
      hits = [0, 1, 2, 3]
      label = 'CUARTETA'
    } else if (rr < 0.43) {
      cells = [big, big, big, pickOther(big.icon), pickOther(big.icon)]
      mult = big.pay
      symIco = big.icon
      hits = [0, 1, 2]
      label = 'TRÍO'
    } else if (rr < 0.51 && cfg.scatter) {
      const sc = pool.find((p) => p.scatter)
      const [i1, i2] = pickTwo(rng, 5)
      cells = [0, 1, 2, 3, 4].map((i) => (i === i1 || i === i2 ? sc : pickW(rng, wPool)))
      hits = [i1, i2]
      respinPendiente = true
      respinMult = cfg.scatter.respinMult
      mult = 0
      label = 'ESCENA LIBRE'
    } else {
      cells = [big, big, pickOther(big.icon), pickW(rng, wPool), pickW(rng, wPool)]
    }
    if (!respinPendiente && mult > 0 && cfg.turbo) {
      if (cfg.turbo.p3 && rng.float() < cfg.turbo.p3) {
        mult *= 3
        label = 'TURBO ×3 · ' + label
      } else if (rng.float() < cfg.turbo.p2) {
        mult *= 2
        label = 'TURBO ×2 · ' + label
      }
    }
  }

  /* ===== Escena libre con respin (5 rodillos) ===== */
  if (respinPendiente) {
    const rw = rng.float()
    const line = pool.filter((p) => !p.scatter)
    const big = line[0]
    const wPool = poolType(line)
    const pickOther = (icon) => pickW(rng, line.filter((p) => p.icon !== icon && !p.wild).map((p) => ({ v: p, w: p.w })))
    let rcells
    if (rw < 0.13) {
      rcells = [big, big, big, pickOther(big.icon), pickW(rng, wPool)]
      mult = +(big.pay * cfg.scatter.respinMult).toFixed(1)
      symIco = big.icon
      hits = [0, 1, 2]
      label = 'RESPIN · TRÍO DEL TORO'
    } else if (rw < 0.34) {
      const s = pickW(rng, line.slice(1).map((p) => ({ v: p, w: p.w * (p.tier ? 1.4 : 1) })))
      rcells = [s, s, s, pickOther(s.icon), pickW(rng, wPool)]
      mult = +(s.pay * cfg.scatter.respinMult).toFixed(1)
      symIco = s.icon
      hits = [0, 1, 2]
      label = 'RESPIN · TRÍO'
    } else {
      rcells = [big, pickOther(big.icon), pickW(rng, wPool), pickW(rng, wPool), pickW(rng, wPool)]
      mult = 0
      label = 'RESPIN SIN SORTEO'
    }
    cells = rcells
  }

  return { cells, mult, hits, label, symIco, respinPendiente, respinMult }
}
