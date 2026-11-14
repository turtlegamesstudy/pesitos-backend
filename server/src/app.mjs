/* =====================================================
   Pesitos · Backend propio (Render / cualquier Node ≥ 20)
   Escrow de saldo, cobros PayPal server-side, settlement
   de juegos. Ignora las reglas de Firestore (usa Admin SDK).
   ===================================================== */
import express from 'express'
import cors from 'cors'
import { FieldValue } from 'firebase-admin/firestore'
import { adminAuth, adminDb } from './admin.mjs'
import { C, inTx, writeRowTx, lastRowSaldo } from './wallet.mjs'
import { resolveGame, gameKind, listGames } from './games.mjs'
import { PAYPAL_READY, createOrder, captureOrder, RATE } from './paypal.mjs'

const PAYPAL_FEE = (a) => +(((a * 4.4) / 100 + 0.3).toFixed(2))
const ALLOWED = String(process.env.CORS_ORIGIN || 'https://pesitos.web.app').split(',').map((s) => s.trim()).filter(Boolean)

/** Verifica el ID token de Firebase del jugador. */
function auth(req, res, next) {
  const h = String(req.headers.authorization || '')
  const m = h.match(/^Bearer\s+(.+)$/i)
  if (!m) return res.status(401).json({ error: 'no_auth' })
  adminAuth().verifyIdToken(m[1])
    .then((d) => { req.uid = d.uid; req.email = d.email || null; next() })
    .catch(() => res.status(401).json({ error: 'bad_token' }))
}

export function createApp() {
  const app = express()
  app.disable('x-powered-by')
  app.use(cors({ origin: ALLOWED, methods: ['GET', 'POST'], allowedHeaders: ['Content-Type', 'Authorization'] }))
  app.use(express.json({ limit: '64kb' }))

  /* ---------- Salud / catálogo ---------- */
  app.get('/health', (_req, res) => {
    res.json({ ok: true, service: 'pesitos-backend', paypal: PAYPAL_READY(), games: listGames() })
  })
  app.get('/', (_req, res) => res.json({ ok: true, service: 'pesitos-backend' }))

  /* ---------- Saldo del jugador ---------- */
  app.post('/api/wallet/balance', auth, async (req, res) => {
    try {
      const saldo = await lastRowSaldo(adminDb(), req.uid)
      res.json({ ok: true, saldo })
    } catch (e) {
      console.error('balance', e)
      res.status(500).json({ error: 'balance' })
    }
  })

  /* ---------- Ronda de juego (settlement server-side) ---------- */
  app.post('/api/game/round', auth, async (req, res) => {
    const stake = Number(req.body?.stake)
    const bet = req.body?.bet ? String(req.body.bet) : undefined
    const gameId = String(req.body?.gameId || '')
    if (!Number.isFinite(stake) || stake <= 0 || stake > 800000) return res.status(400).json({ error: 'monto_invalido' })
    if (!gameKind(gameId)) return res.status(400).json({ error: 'juego_no_disponible' })
    try {
      const out = await inTx({
        uid: req.uid,
        work: async (tx, saldo) => {
          if (saldo < stake) {
            const err = new Error('saldo_insuficiente')
            err.code = 'saldo_insuficiente'
            throw err
          }
          const resolved = resolveGame({ gameId, stake, bet })
          const ganancia = Number(resolved.ganancia)
          // Débito de apuesta
          writeRowTx(tx, {
            uid: req.uid, tipo: 'apuesta', metodo: 'wallet', monto: -stake,
            estado: 'Completado', ref: 'BET-' + Date.now().toString(36).toUpperCase(),
            fair: { hash: resolved.seed, clientSeed: 'servidor', nonce: Date.now().toString(36) },
            meta: { juego: gameId, bet: bet ?? null, estado: 'Jugando' },
            saldoAntes: saldo,
          })
          let saldoPost = saldo - stake
          if (ganancia > 0) {
            // Premio (misma transacción)
            const premio = writeRowTx(tx, {
              uid: req.uid, tipo: 'premio', metodo: 'wallet', monto: ganancia,
              estado: 'Completado', ref: 'WIN-' + Date.now().toString(36).toUpperCase(),
              fair: { hash: resolved.seed, clientSeed: 'servidor', nonce: Date.now().toString(36) + 'w' },
              meta: { juego: gameId, bet: bet ?? null, betTxId: null },
              saldoAntes: saldoPost,
            })
            saldoPost = premio.saldo
          }
          return { ...resolved, saldo: +saldoPost.toFixed(2) }
        },
      })
      return res.json({ ok: true, ...out })
    } catch (e) {
      if (e.code === 'saldo_insuficiente' || e.message === 'saldo_insuficiente') {
        return res.status(409).json({ error: 'saldo_insuficiente' })
      }
      console.error('game/round', e)
      return res.status(500).json({ error: 'round' })
    }
  })

  /* ---------- PayPal · crear orden ---------- */
  app.post('/api/deposit/paypal/create-order', auth, async (req, res) => {
    if (!PAYPAL_READY()) return res.status(503).json({ error: 'paypal_no_configurado' })
    const amountC = Number(req.body?.amountC$)
    if (!Number.isFinite(amountC) || amountC < 100 || amountC > 100000) {
      return res.status(400).json({ error: 'monto_invalido_paypal' })
    }
    try {
      const usd = +(amountC / RATE).toFixed(2)
      const fee = PAYPAL_FEE(amountC)
      const r = await createOrder({ usd, description: 'Pesitos · depósito C$ ' + amountC })
      if (!r.ok || !r.data?.id) {
        console.error('paypal create', r.status, r.data)
        return res.status(502).json({ error: 'paypal_create' })
      }
      const db = adminDb()
      await db.collection(C.paypal_orders).doc(String(r.data.id)).set({
        uid: req.uid, orderId: r.data.id, amountC$: amountC, usd, fee,
        neto: +(amountC - fee).toFixed(2), rate: RATE,
        estado: 'Creado', created: FieldValue.serverTimestamp(),
      })
      return res.json({ ok: true, orderId: r.data.id, usd, rate: RATE, amountC$: amountC })
    } catch (e) {
      console.error('create-order', e)
      return res.status(500).json({ error: 'create_order' })
    }
  })

  /* ---------- PayPal · capturar orden y acreditar ---------- */
  app.post('/api/deposit/paypal/capture', auth, async (req, res) => {
    if (!PAYPAL_READY()) return res.status(503).json({ error: 'paypal_no_configurado' })
    const orderId = String(req.body?.orderId || '').trim()
    if (!orderId) return res.status(400).json({ error: 'orderId_requerido' })
    try {
      const db = adminDb()
      const ref = db.collection(C.paypal_orders).doc(orderId)
      const snap = await ref.get()
      if (!snap.exists) return res.status(404).json({ error: 'orden_no_encontrada' })
      const rec = snap.data()
      if (rec.uid !== req.uid) return res.status(403).json({ error: 'orden_ajena' })
      if (rec.estado !== 'Creado') return res.status(409).json({ error: 'orden_ya_procesada' })

      const cap = await captureOrder(orderId)
      const capData = cap.data || {}
      const capture = capData?.purchase_units?.[0]?.payments?.captures?.[0]
      const status = String(capData.status || capture?.status || '')
      const amountUSD = String(capture?.amount?.value || '')
      if (status !== 'COMPLETED' || amountUSD !== String(rec.usd)) {
        console.error('capture mismatch', { status, amountUSD, expected: rec.usd })
        return res.status(502).json({ error: 'captura_no_confirmada' })
      }
      const captureId = String(capture?.id || orderId)

      // Acreditar en transacción atómica: libro + intención + orden
      const out = await inTx({
        uid: req.uid,
        work: async (tx, saldo) => {
          const bruto = Number(rec.amountC$)
          const fee = Number(rec.fee || PAYPAL_FEE(bruto))
          const neto = +(bruto - fee).toFixed(2)
          const refDeposito = 'PP-' + Date.now().toString(36).toUpperCase()
          writeRowTx(tx, {
            uid: req.uid, tipo: 'deposito', metodo: 'paypal', monto: neto,
            estado: 'Completado', ref: refDeposito,
            meta: { bruto, fee, provider: 'PayPal', orderId, captureId, gateway: 'PayPal', usd: rec.usd, rate: rec.rate, authCode: captureId, rrn: captureId, operador: 'paypal@auto' },
            saldoAntes: saldo,
          })
          tx.set(db.collection(C.deposit_intents).doc(refDeposito), {
            uid: req.uid, name: null, email: null,
            method: 'paypal', amount: bruto, fee, neto,
            ref: refDeposito, destino: 'PayPal · servidor',
            estado: 'Confirmado',
            gateway: 'PayPal', orderId, captureId, usd: rec.usd, rate: rec.rate,
            created: FieldValue.serverTimestamp(),
          })
          tx.set(db.collection(C.paypal_orders).doc(orderId), { estado: 'Capturado', captureId, capturedAt: FieldValue.serverTimestamp() }, { merge: true })
          return { saldo: saldo + neto, neto }
        },
      })
      return res.json({ ok: true, ...out, fee: rec.fee, bruto: rec.amountC$ })
    } catch (e) {
      console.error('capture', e)
      return res.status(500).json({ error: 'capture' })
    }
  })

  /* ---------- 404 ---------- */
  app.use((_req, res) => res.status(404).json({ error: 'not_found' }))

  return app
}
