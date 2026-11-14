/* =====================================================
   Pesitos · Ledger del lado servidor (autoridad única)
   Toda transacción es una TRANSACCIÓN Firestore atómica.
   El cliente ya no puede escribir sus propias filas.
   ===================================================== */
import { FieldValue } from 'firebase-admin/firestore'
import { adminDb } from './admin.mjs'

export const C = { ledger: 'ledger', users: 'users', deposit_intents: 'deposit_intents', withdrawals: 'withdrawals', paypal_orders: 'paypal_orders' }

const tsNow = () => Date.now()

export function buildRow({ uid, tipo, metodo = 'wallet', monto, estado = 'Completado', saldoAntes, saldoDespues, ref = '', fair = null, meta = {} }) {
  const row = {
    id: 'tx-' + Date.now() + '-' + Math.random().toString(36).slice(2, 7),
    uid,
    ts: tsNow(),
    fecha: new Date().toLocaleString('es-NI', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }),
    tipo, // deposito | retiro | apuesta | premio | reembolso | bono | suscripcion
    metodo,
    monto: +Number(monto).toFixed(2),
    estado,
    saldoAntes: +Number(saldoAntes || 0).toFixed(2),
    saldoDespues: +Number(saldoDespues || 0).toFixed(2),
    ref: ref || '',
    fair: fair || null,
    meta: meta || {},
    mode: 'firebase',
  }
  row.receipt = tipo + '|' + row.monto + '|' + row.saldoAntes + '→' + row.saldoDespues + '|' + (fair?.hash || ref || '')
  return row
}

/** Último saldo conocido (fuente de verdad = el libro). */
export async function lastRowSaldo(db, uid) {
  const snap = await db.collection(C.ledger).where('uid', '==', uid).orderBy('ts', 'desc').limit(1).get()
  if (snap.empty) return 0
  return Number(snap.docs[0].data().saldoDespues || 0)
}

/** Ejecuta `work(tx, saldoActual)` dentro de una transacción Firestore. */
export async function inTx({ uid, work }) {
  const db = adminDb()
  return db.runTransaction(async (tx) => {
    const last = await tx.get(db.collection(C.ledger).where('uid', '==', uid).orderBy('ts', 'desc').limit(1))
    const saldo = last.empty ? 0 : Number(last.docs[0].data().saldoDespues || 0)
    return work(tx, saldo)
  })
}

/** Escribe una fila del ledger dentro de una transacción abierta. Devuelve { saldo, rowId, row }. */
export function writeRowTx(tx, { uid, tipo, metodo, monto, estado, ref, fair, meta, saldoAntes }) {
  const saldoDespues = +(Number(saldoAntes) + Number(monto)).toFixed(2)
  if (saldoDespues < 0) throw new Error('saldo_insuficiente')
  const row = buildRow({ uid, tipo, metodo, monto, estado, saldoAntes, saldoDespues, ref, fair, meta })
  const db = adminDb()
  tx.set(db.collection(C.ledger).doc(row.id), { ...row, serverTs: FieldValue.serverTimestamp() })
  return { saldo: saldoDespues, rowId: row.id, row }
}
