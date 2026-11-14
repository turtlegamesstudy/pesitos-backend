/* =====================================================
   Pesitos · Admin Firebase (SDK admin — ignora reglas de cliente)
   ===================================================== */
import admin from 'firebase-admin'

let _app = null

export function adminApp() {
  if (_app) return _app
  const raw = String(process.env.FB_SERVICE_ACCOUNT_JSON || '').trim()
  const path = String(process.env.GOOGLE_APPLICATION_CREDENTIALS || '').trim()
  let credential = null
  if (raw) {
    try {
      const json = raw.startsWith('{') ? JSON.parse(raw) : JSON.parse(Buffer.from(raw, 'base64').toString('utf8'))
      credential = admin.credential.cert(json)
    } catch (e) {
      console.error('FB_SERVICE_ACCOUNT_JSON inválido · uso ruta/ADC', e.message)
    }
  }
  if (!credential && path) credential = admin.credential.cert(path)
  if (!credential) credential = admin.credential.applicationDefault()
  _app = admin.initializeApp({
    credential,
    projectId: process.env.FIREBASE_PROJECT_ID || 'inclave-913cd',
  })
  return _app
}

export function adminDb() {
  return admin.firestore(adminApp())
}

export function adminAuth() {
  return admin.auth(adminApp())
}
