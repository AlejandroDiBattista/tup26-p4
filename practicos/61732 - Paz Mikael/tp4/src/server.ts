import express from 'express'
import path from 'path'
import { fileURLToPath } from 'url'
import './db/index.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const puerto = process.env.PORT || 3000

app.use(express.json())
app.use(express.static(path.join(__dirname, '../public')))

app.get('/', (_req, res) => {
  res.redirect('/MiniCRM.html')
})

app.listen(puerto, () => {
  console.log(`MiniCRM iniciado en http://localhost:${puerto}`)
})
