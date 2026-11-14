/* =====================================================
   Pesitos · Backend propio — entrada HTTP
   ===================================================== */
import { createApp } from './src/app.mjs'

const port = Number(process.env.PORT || 3001)
const app = createApp()

app.listen(port, '0.0.0.0', () => {
  console.log(`pesitos-backend escuchando en :${port}`)
})
