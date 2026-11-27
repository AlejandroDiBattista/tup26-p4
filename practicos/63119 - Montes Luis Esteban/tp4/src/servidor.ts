import express from 'express'
import type {ErrorRequestHandler} from 'express'
import {rutas} from './rutas.js'
import {Fallo} from './clientes.js'
const app=express()
app.use(express.json())
app.use('/api/clientes',rutas)
app.use(express.static('public',{index:'MiniCRM.html'}))
const errores:ErrorRequestHandler=(error,p,r,siguiente)=>{
  const estado=error instanceof Fallo?error.estado:error.status===400?400:500
  r.status(estado).json({error:estado===500?'Error al guardar los datos':error.message})
}
app.use(errores)
const puerto=Number(process.env.PORT??3000)
app.listen(puerto,()=>console.log('MiniCRM en http://localhost:'+puerto))
