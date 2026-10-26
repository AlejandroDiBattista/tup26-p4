import express, { type ErrorRequestHandler } from 'express'
import { fileURLToPath } from 'node:url'
import { router } from './routers/clientes.js'
import { ErrorNegocio } from './servicio/errores.js'
import { sembrar } from './seed.js'

const app = express()
app.use(express.json())
app.use('/api/clientes', router)
app.use(express.static(fileURLToPath(new URL('../public', import.meta.url))))
app.get('/', (_req, res) => res.redirect('/MiniCRM.html'))

app.use('/api', (_req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' })
})

const manejarErrores: ErrorRequestHandler = (error, _req, res, _next) => {
  if (error instanceof ErrorNegocio) {
    res.status(error.estado).json({ error: error.message })
  } else if (error instanceof SyntaxError) {
    res.status(400).json({ error: 'JSON inválido' })
  } else {
    console.error(error)
    res.status(500).json({ error: 'Error interno del servidor' })
  }
}
app.use(manejarErrores)

await sembrar()
const puerto = Number(process.env.PORT ?? 3000)
app.listen(puerto, () => console.log(`MiniCRM en http://localhost:${puerto}`))
