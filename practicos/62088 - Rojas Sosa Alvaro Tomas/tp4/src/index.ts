import express from 'express'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { rutasClientes } from './routes/clientes.routes.js'
import { rutasActividades } from './routes/actividades.routes.js'

const aqui = dirname(fileURLToPath(import.meta.url))
const PUERTO = Number(process.env.PORT ?? 3000)

const app = express()

app.use(express.json())
app.use(express.static(join(aqui, '..', 'public')))

app.use('/api/clientes', rutasClientes)
app.use('/api/actividades', rutasActividades)

app.get('/', (_req, res) => res.redirect('/MiniCRM.html'))

app.use((_req, res) => res.status(404).json({ error: 'Ruta no encontrada' }))

app.listen(PUERTO, () => {
  console.log(`MiniCRM escuchando en http://localhost:${PUERTO}/MiniCRM.html`)
})
