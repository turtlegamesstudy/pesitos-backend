/* =====================================================
   Pesitos · PayPal REST (server-side)
   El flujo completo vive en el servidor: creación de la orden,
   captura y verificación. El cliente sólo aprueba en su navegador.
   ===================================================== */

const MODE = String(process.env.PAYPAL_MODE || 'live').trim()
const BASE = MODE === 'live' ? 'https://api-m.paypal.com' : 'https://api-m.sandbox.paypal.com'
const CID = String(process.env.PAYPAL_CLIENT_ID || '').trim()
const SECRET = String(process.env.PAYPAL_SECRET || '').trim()
const RATE = Number(process.env.PAYPAL_RATE || 36.5) || 36.5 // C$ por 1 USD
export { RATE }
export const PAYPAL_READY = () => Boolean(CID && SECRET)

async function token() {
  const basic = Buffer.from(`${CID}:${SECRET}`).toString('base64')
  const res = await fetch(`${BASE}/v1/oauth2/token`, {
    method: 'POST',
    headers: { Authorization: `Basic ${basic}`, 'Content-Type': 'application/x-www-form-urlencoded' },
    body: 'grant_type=client_credentials',
  })
  const data = await res.json()
  if (!res.ok || !data.access_token) throw new Error('paypal_auth · ' + (data.error_description || data.error || res.status))
  return data.access_token
}

async function paypal(path, { method = 'GET', body, headers = {} } = {}) {
  const accessToken = await token()
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json', ...headers },
    body: body ? JSON.stringify(body) : undefined,
  })
  const data = await res.json().catch(() => ({}))
  return { ok: res.ok, status: res.status, data }
}

export async function createOrder({ usd, description }) {
  return paypal('/v2/checkout/orders', {
    method: 'POST',
    body: {
      intent: 'CAPTURE',
      purchase_units: [{ amount: { currency_code: 'USD', value: usd }, description: description || 'Pesitos · depósito' }],
      application_context: {
        return_url: process.env.PAYPAL_RETURN_URL || 'https://pesitos.web.app/',
        cancel_url: process.env.PAYPAL_RETURN_URL || 'https://pesitos.web.app/',
      },
    },
  })
}

export async function captureOrder(orderId) {
  return paypal(`/v2/checkout/orders/${encodeURIComponent(orderId)}/capture`, { method: 'POST' })
}

export async function getOrder(orderId) {
  return paypal(`/v2/checkout/orders/${encodeURIComponent(orderId)}`)
}
