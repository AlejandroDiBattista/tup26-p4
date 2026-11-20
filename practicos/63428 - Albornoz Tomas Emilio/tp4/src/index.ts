import { app } from './app'

const puerto = Number(process.env.PORT) || 3000

app.listen(puerto, () => {
  console.log(`MiniCRM andando en http://localhost:${puerto}`)
})
