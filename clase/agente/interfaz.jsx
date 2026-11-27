// Interfaz de terminal compartida por el asistente y el agente, hecha con Ink.
// Cada programa le pasa una función:
//
//   iniciar({ titulo, detalle, alEnviar })
//
// Cuando la persona aprieta Enter, la interfaz llama a alEnviar(pedido, ui).
// Con "ui" el programa muestra lo que va pasando:
//
//   ui.texto('…')                       una respuesta del modelo
//   ui.herramienta(nombre, entrada)     una herramienta que se ejecuta
//   await ui.permitir(nombre, entrada)  pregunta "¿Permitir? s / n" y devuelve true o false
//   ui.parcial('…')                     texto que todavía está llegando
//   ui.tokens(cantidad)                 suma tokens al contador de la cabecera

import React, { useState, useRef, useEffect } from 'react'
import { render, Box, Text, useInput, useWindowSize, useBoxMetrics } from 'ink'
import TextInput from 'ink-text-input'
import Spinner from 'ink-spinner'
import { MarkdownText } from '@assistant-ui/react-ink-markdown'

// Una línea de la conversación. El "tipo" decide cómo se dibuja.
function Linea({ tipo, texto }) {
  if (tipo === 'usuario')     return <Box marginTop={1}><Text bold color="cyan">› {texto}</Text></Box>
  if (tipo === 'herramienta') return <Text color="magenta">  → {texto}</Text>
  if (tipo === 'error')       return <Text color="red">  {texto}</Text>
  return <Box marginTop={1}><MarkdownText text={texto} /></Box>
}

// La zona de la conversación. Ocupa todo el alto que dejan libre el título y la caja de
// entrada. Si el contenido no entra, muestra el final; con ↑ y ↓ se vuelve atrás.
function Conversacion({ cantidad, children }) {
  const ventana   = useRef(null)   // la parte visible
  const contenido = useRef(null) // todo el contenido, que puede ser más alto
  const alto      = useBoxMetrics(ventana).height
  const sobra     = Math.max(0, useBoxMetrics(contenido).height - alto) // filas que no entran
  const [subido, setSubido] = useState(0)                            // filas que la persona subió

  useEffect(() => setSubido(0), [cantidad]) // cuando llega algo nuevo, volvemos al final

  useInput((_, tecla) => {
    if (tecla.upArrow)   setSubido(s => Math.min(sobra, s + 3))
    if (tecla.downArrow) setSubido(s => Math.max(0, s - 3))
  })

  return (
    <Box ref={ventana} flexGrow={1} flexBasis={0} overflow="hidden" contentOffsetY={Math.max(0, sobra - subido)} flexDirection="column">
      <Box ref={contenido} flexDirection="column" flexShrink={0}>{children}</Box>
    </Box>
  )
}

// La caja que pide permiso. Si la herramienta escribe un archivo, muestra su contenido.
function Permiso({ nombre, entrada }) {
  const renglones = entrada.contenido ? entrada.contenido.split('\n') : []
  return (
    <Box flexDirection="column" borderStyle="round" borderColor="yellow" paddingX={1}>
      <Text bold color="yellow">{nombre} · {entrada.ruta}</Text>
      {renglones.length >  0 && <Text>{renglones.slice(0, 12).join('\n')}</Text>}
      {renglones.length > 12 && <Text color="gray">… ({renglones.length - 12} líneas más)</Text>}
      <Text color="yellow">¿Permitir? <Text bold>s</Text> / <Text bold>n</Text></Text>
    </Box>
  )
}

// Los argumentos de una herramienta en una línea: todos menos "contenido", que es largo.
const resumir = entrada => Object.entries(entrada)
  .filter(([clave]) => clave !== 'contenido')
  .map(([, valor]) => String(valor).replace(/\s+/g, ' ').slice(0, 60))
  .join(' · ')

function App({ titulo, detalle, alEnviar }) {
  // ── Estado: todo lo que la pantalla necesita saber ──
  const [lineas, setLineas] = useState([])      // la conversación: una lista de { tipo, texto }
  const [entrada, setEntrada] = useState('')    // lo que la persona está escribiendo
  const [ocupado, setOcupado] = useState(false) // true mientras el agente trabaja
  const [avance, setAvance] = useState(null)   // texto parcial o aviso de herramienta
  const [pedidos, setPedidos] = useState([])   // permisos pendientes: { nombre, entrada, responder }
  const pedido = pedidos[0]
  const [tokens, setTokens] = useState(0)       // tokens usados desde que se abrió el programa
  const { rows } = useWindowSize()              // el alto de la terminal

  const agregar = (tipo, texto) => setLineas(ls => [...ls, { id: ls.length, tipo, texto: String(texto) }])

  // ── Lo que recibe cada programa para mostrar la conversación ──
  const ui = {
    texto:       (t) => { setAvance(null); agregar('texto', t) },
    herramienta: (nombre, entrada) => setAvance({ tipo: 'herramienta', texto: `${nombre} ${resumir(entrada)}` }),
    parcial:     (texto) => setAvance(texto ? { tipo: 'texto', texto } : null),
    tokens:      (cantidad) => setTokens(total => total + cantidad),
    // Devuelve una promesa que queda esperando hasta que la persona aprieta "s" o "n".
    permitir:    (nombre, entrada) => new Promise(responder => {
      setAvance(null)
      setPedidos(pendientes => [...pendientes, { nombre, entrada, responder }])
    })
  }

  // ── Enter: le pasamos el pedido al paso y esperamos a que termine ──
  async function enviar(texto) {
    if (!texto.trim() || ocupado) return
    setEntrada('')
    agregar('usuario', texto)
    setOcupado(true)
    try {
      await alEnviar(texto, ui)
    } catch (e) {
      agregar('error', e.message)
    } finally {
      setAvance(null)
      setPedidos([])
      setOcupado(false)
    }
  }

  // ── Teclas "s" y "n": solo se escuchan mientras hay un permiso pendiente ──
  useInput(tecla => {
    if (tecla !== 's' && tecla !== 'n') return
    setAvance(null)
    setPedidos(pendientes => pendientes.slice(1))
    pedido.responder(tecla === 's') // resuelve la promesa de ui.permitir
  }, { isActive: Boolean(pedido) })

  // ── Pantalla: ocupa toda la terminal, y la caja de entrada queda siempre abajo ──
  return (
    <Box flexDirection="column" height={rows}>
      {/* 1. La cabecera, fija arriba: el título a la izquierda y los tokens a la derecha. */}
      <Box borderStyle="round" borderColor="cyan" paddingX={1} flexShrink={0} justifyContent="space-between">
        <Box flexShrink={1}><Text bold color="cyan" wrap="truncate">{titulo} · {detalle}</Text></Box>
        <Box flexShrink={0} marginLeft={2}><Text color="gray">{tokens.toLocaleString('es-AR')} tokens</Text></Box>
      </Box>

      {/* 2. La conversación: se estira para ocupar el espacio libre. */}
      <Conversacion cantidad={lineas.length}>
        {lineas.map(l => <Linea key={l.id} {...l} />)}
        {!pedido && avance && <Linea {...avance} />}
        {ocupado && !avance && !pedido && <Text color="gray"><Spinner type="dots" /> pensando…</Text>}
      </Conversacion>

      {/* 3. Abajo: el permiso y la caja para escribir. */}
      <Box flexDirection="column" flexShrink={0}>
        {pedido && <Permiso {...pedido} />}
        <Box borderStyle="round" borderColor={ocupado ? 'gray' : 'cyan'} paddingX={1}>
          <Text color="cyan">› </Text>
          <TextInput value={entrada} onChange={setEntrada} onSubmit={enviar} focus={!ocupado} />
        </Box>
      </Box>
    </Box>
  )
}

export function iniciar(opciones) {
  // alternateScreen: la app usa una pantalla propia, como vim. Al salir, la terminal queda como estaba.
  render(<App {...opciones} />, { alternateScreen: true })
}
