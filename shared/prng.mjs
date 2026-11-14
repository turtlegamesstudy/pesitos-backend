/* =====================================================
   Pesitos · PRNG compartido (cliente y servidor)
   Determinista: la misma semilla produce la misma secuencia.
   El servidor elige la semilla (ninguna parte la conoce de antemano
   hasta que el servidor la revela en el resultado de la ronda).
   ===================================================== */

export function hash32(str) {
  let h = 2166136261 >>> 0
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

export function mulberry32(seed) {
  let a = seed >>> 0
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** Crea un RNG determinista a partir de cualquier cadena. */
export function createRng(seedStr) {
  const m = mulberry32(hash32(String(seedStr)))
  const rng = {
    next: () => m(),
    float: () => m(),
    int: (n) => Math.floor(m() * n),
    pick: (arr) => arr[Math.floor(m() * arr.length)],
    pickWeighted: (items) => {
      const total = items.reduce((a, i) => a + i.w, 0)
      let r = m() * total
      for (const it of items) {
        r -= it.w
        if (r <= 0) return it.v
      }
      return items[items.length - 1].v
    },
    shuffle: (arr) => {
      const a = arr.slice()
      for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(m() * (i + 1))
        const tmp = a[i]; a[i] = a[j]; a[j] = tmp
      }
      return a
    },
  }
  return rng
}

/** Semilla única e irrepetible por ronda (la genera el servidor). */
export const newRoundSeed = () => {
  const bytes = new Uint8Array(16)
  globalThis.crypto.getRandomValues(bytes) // Node >= 19 y todos los navegadores
  return [...bytes].map((b) => b.toString(16).padStart(2, '0')).join('')
}
