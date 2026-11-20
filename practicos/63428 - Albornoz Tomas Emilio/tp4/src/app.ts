import express from 'express'
import type { NextFunction, Request, Response } from 'express'
import path from 'path'
import { clientesRouter } from './routers/clientes.router'
import { actividadesRouter } from './routers/actividades.router'
import { ErrorServicio } from './services/errores'

export const app = express()

app.use(express.json())
app.use(express.static(path.join(__dirname, '..', 'public')))

app.get('/', (req: Request, res: Response) => {
  res.redirect('/MiniCRM.html')
})

app.use('/api/clientes', clientesRouter)
app.use('/api/actividades', actividadesRouter)

app.use('/api', (req: Request, res: Response) => {
  res.status(404).json({ error: 'Ruta no encontrada' })
})

app.use((error: unknown, req: Request, res: Response, next: NextFunction) => {
  if (error instanceof ErrorServicio) {
    res.status(error.estado).json({ error: error.message })
  } else if (error instanceof SyntaxError) {
    res.status(400).json({ error: 'El JSON enviado no es válido' })
  } else {
    console.error(error)
    res.status(500).json({ error: 'Error interno del servidor' })
  }
})
