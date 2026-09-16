#!/usr/bin/env -S node --import tsx

import React, {useEffect, useReducer} from 'react'
import {render, Box, Text, useInput, useApp} from 'ink'
import {readFile, writeFile} from 'node:fs/promises'
import {basename} from 'node:path'

const ANCHO = process.stdout.columns || 80
const ALTO = process.stdout.rows || 24
const PAGE = 11

const PALETA = {
  fondo: '#161310',
  marco: '#726b61',
  claro: '#ede7db',
  tenue: '#ada79e',
  marca: '#edbb64',
  foco: '#ece6dc',
}

function parseRecords(raw) {
  const trimmed = String(raw ?? '').replace(/\r\n/g, '\n').replace(/\r/g, '\n').trim()
  if (trimmed.length === 0) {
    return {columnas: [], registros: []}
  }

  const lineas = trimmed.split('\n').filter((linea) => linea.trim().length > 0)
  const columnas = lineas[0].split(',').map((campo) => campo.trim())
  const registros = lineas.slice(1).reduce((acc, linea) => {
    const valores = linea.split(',').map((campo) => campo.trim())
    const fila = columnas.reduce((obj, nombre, idx) => {
      obj[nombre] = valores[idx] ?? ''
      return obj
    }, {})
    acc.push(fila)
    return acc
  }, [])

  return {columnas, registros}
}

function toCsv(columnas, registros) {
  const cabeza = columnas.join(',')
  const cuerpo = registros.map((fila) => columnas.map((nombre) => fila[nombre] ?? '').join(','))
  return [cabeza, ...cuerpo].join('\n') + '\n'
}

function anchoCampo(nombre) {
  const n = String(nombre || '').length
  return Math.max(10, Math.min(18, n + 8))
}

function campoDe(estado) {
  return estado.columnas[estado.cursor.col]
}

function ordenarRegistros(registros, columna, dir) {
  const copia = registros.slice()
  copia.sort((a, b) => {
    const izq = String(a[columna] ?? '')
    const der = String(b[columna] ?? '')
    const cmp = izq.localeCompare(der, 'es', {numeric: true, sensitivity: 'base'})
    return dir === 'desc' ? -cmp : cmp
  })
  return copia
}

const estadoInicial = {
  modo: 'idle',
  ruta: '',
  columnas: [],
  registros: [],
  buffer: '',
  aviso: '',
  cursor: {fila: 0, col: 0},
}

function moverCursor(cursor, dir, maxFila, maxCol) {
  const next = {...cursor}
  if (dir === 'up') next.fila = Math.max(0, cursor.fila - 1)
  if (dir === 'down') next.fila = Math.min(maxFila, cursor.fila + 1)
  if (dir === 'left') next.col = Math.max(0, cursor.col - 1)
  if (dir === 'right') next.col = Math.min(maxCol, cursor.col + 1)
  return next
}

function reducir(estado, accion) {
  switch (accion.type) {
    case 'LOADED':
      return {
        ...estado,
        modo: 'idle',
        ruta: accion.ruta,
        columnas: accion.columnas,
        registros: accion.registros,
        buffer: '',
        aviso: '',
        cursor: {fila: 0, col: 0},
      }
    case 'SAVED':
      return {
        ...estado,
        modo: 'idle',
        ruta: accion.ruta,
        buffer: '',
        aviso: '',
      }
    case 'FAILED':
      return {
        ...estado,
        modo: 'idle',
        buffer: '',
        aviso: accion.mensaje,
      }
    case 'PROMPT':
      return {
        ...estado,
        modo: accion.modo,
        buffer: accion.buffer ?? '',
        aviso: '',
      }
    case 'TYPE':
      return {...estado, buffer: estado.buffer + accion.char}
    case 'BACKSPACE':
      return {...estado, buffer: estado.buffer.slice(0, -1)}
    case 'CANCEL':
      return {...estado, modo: 'idle', buffer: '', aviso: ''}
    case 'MOVE': {
      const maxFila = Math.max(0, estado.registros.length - 1)
      const maxCol = Math.max(0, estado.columnas.length - 1)
      return {
        ...estado,
        cursor: moverCursor(estado.cursor, accion.dir, maxFila, maxCol),
      }
    }
    case 'START_EDIT': {
      if (estado.registros.length === 0) {
        return estado
      }
      const col = campoDe(estado)
      const valor = estado.registros[estado.cursor.fila]?.[col] ?? ''
      return {...estado, modo: 'edit', buffer: valor, aviso: ''}
    }
    case 'COMMIT_EDIT': {
      const col = campoDe(estado)
      const registros = estado.registros.map((fila, i) => {
        if (i !== estado.cursor.fila) {
          return fila
        }
        return {...fila, [col]: estado.buffer}
      })
      return {...estado, registros, modo: 'idle', buffer: ''}
    }
    case 'SORT': {
      const col = campoDe(estado)
      if (!col) {
        return estado
      }
      return {
        ...estado,
        registros: ordenarRegistros(estado.registros, col, accion.dir),
      }
    }
    default:
      return estado
  }
}

function BarraSuperior({ruta, registros, columnas}) {
  return (
    <Box flexDirection="column">
      <Text bold color={PALETA.claro}>
        {ruta ? basename(ruta) : '(ningun archivo)'}
      </Text>
      <Text color={PALETA.tenue}>
        {registros.length} registros / {columnas.length} campos
      </Text>
    </Box>
  )
}

function Grilla({columnas, registros, cursor, desde, modo, buffer}) {
  const visibles = registros.slice(desde, desde + PAGE)

  return (
    <Box flexDirection="column" marginTop={1}>
      <Box>
        <Box width={4}>
          <Text bold color={PALETA.tenue}>#</Text>
        </Box>
        {columnas.map((nombre, idx) => {
          const activa = idx === cursor.col
          return (
            <Box key={nombre} width={anchoCampo(nombre)}>
              <Text
                bold
                inverse={activa}
                color={activa ? PALETA.marca : PALETA.tenue}
              >
                {nombre.toUpperCase()}
              </Text>
            </Box>
          )
        })}
      </Box>

      {visibles.map((fila, offset) => {
        const real = desde + offset
        const filaActiva = real === cursor.fila
        return (
          <Box key={real}>
            <Box width={4}>
              <Text inverse={filaActiva} color={filaActiva ? PALETA.marca : PALETA.tenue}>
                {real + 1}
              </Text>
            </Box>
            {columnas.map((nombre, idx) => {
              const celdaActiva = filaActiva && idx === cursor.col
              const texto = celdaActiva && modo === 'edit' ? buffer : (fila[nombre] ?? '')
              return (
                <Box key={nombre} width={anchoCampo(nombre)}>
                  <Text
                    color={celdaActiva ? PALETA.fondo : PALETA.claro}
                    backgroundColor={celdaActiva ? PALETA.foco : undefined}
                    wrap="truncate"
                  >
                    {texto}
                  </Text>
                </Box>
              )
            })}
          </Box>
        )
      })}
    </Box>
  )
}

function BarraInferior({modo, cursor}) {
  let atajos = (
    <Text color={PALETA.tenue}>
      <Text bold color={PALETA.marca}>A</Text> abrir{' · '}
      <Text bold color={PALETA.marca}>G</Text> guardar{' · '}
      <Text bold color={PALETA.marca}>Enter</Text> editar{' · '}
      <Text bold color={PALETA.marca}>&lt;</Text> asc{' · '}
      <Text bold color={PALETA.marca}>&gt;</Text> desc{' · '}
      <Text bold color={PALETA.marca}>Esc</Text> salir
    </Text>
  )

  if (modo === 'open' || modo === 'save') {
    atajos = (
      <Text color={PALETA.tenue}>
        <Text bold color={PALETA.marca}>Enter</Text> {modo === 'open' ? 'abrir' : 'guardar'}{' · '}
        <Text bold color={PALETA.marca}>Esc</Text> cancelar
      </Text>
    )
  } else if (modo === 'edit') {
    atajos = (
      <Text color={PALETA.tenue}>
        <Text bold color={PALETA.marca}>Enter</Text> confirmar{' · '}
        <Text bold color={PALETA.marca}>Esc</Text> cancelar
      </Text>
    )
  }

  return (
    <Box marginTop={1} justifyContent="space-between">
      {atajos}
      <Text color={PALETA.tenue}>
        Fila {cursor.fila + 1} / Columna {cursor.col + 1}
      </Text>
    </Box>
  )
}

function App() {
  const {exit} = useApp()
  const [estado, dispatch] = useReducer(reducir, estadoInicial)

  async function cargar(ruta) {
    try {
      const raw = await readFile(ruta, 'utf8')
      const datos = parseRecords(raw)
      dispatch({type: 'LOADED', ruta, columnas: datos.columnas, registros: datos.registros})
    } catch {
      dispatch({type: 'FAILED', mensaje: 'No se pudo abrir el archivo'})
    }
  }

  async function persistir(ruta) {
    if (!ruta.trim()) {
      dispatch({type: 'FAILED', mensaje: 'Falta el nombre del archivo'})
      return
    }
    try {
      await writeFile(ruta, toCsv(estado.columnas, estado.registros), 'utf8')
      dispatch({type: 'SAVED', ruta})
    } catch {
      dispatch({type: 'FAILED', mensaje: 'No se pudo guardar el archivo'})
    }
  }

  useEffect(() => {
    const arg = process.argv[2]
    if (arg) {
      void cargar(arg)
    }
  }, [])

  useInput((input, key) => {
    if (estado.modo === 'open' || estado.modo === 'save') {
      if (key.escape) {
        dispatch({type: 'CANCEL'})
        return
      }
      if (key.return) {
        const destino = estado.buffer.trim()
        if (estado.modo === 'open') {
          void cargar(destino)
        } else {
          void persistir(destino)
        }
        return
      }
      if (key.backspace || key.delete) {
        dispatch({type: 'BACKSPACE'})
        return
      }
      if (input && input.length === 1 && !key.ctrl && !key.meta) {
        dispatch({type: 'TYPE', char: input})
      }
      return
    }

    if (estado.modo === 'edit') {
      if (key.escape) {
        dispatch({type: 'CANCEL'})
        return
      }
      if (key.return) {
        dispatch({type: 'COMMIT_EDIT'})
        return
      }
      if (key.backspace || key.delete) {
        dispatch({type: 'BACKSPACE'})
        return
      }
      if (input && input.length === 1 && !key.ctrl && !key.meta) {
        dispatch({type: 'TYPE', char: input})
      }
      return
    }

    if (key.escape) {
      exit()
      return
    }

    if (key.upArrow) {
      dispatch({type: 'MOVE', dir: 'up'})
      return
    }
    if (key.downArrow) {
      dispatch({type: 'MOVE', dir: 'down'})
      return
    }
    if (key.leftArrow) {
      dispatch({type: 'MOVE', dir: 'left'})
      return
    }
    if (key.rightArrow) {
      dispatch({type: 'MOVE', dir: 'right'})
      return
    }

    if (key.return) {
      dispatch({type: 'START_EDIT'})
      return
    }

    if (input === '<') {
      dispatch({type: 'SORT', dir: 'asc'})
      return
    }
    if (input === '>') {
      dispatch({type: 'SORT', dir: 'desc'})
      return
    }

    if (input === 'a' || input === 'A') {
      dispatch({type: 'PROMPT', modo: 'open', buffer: ''})
      return
    }

    if (input === 'g' || input === 'G') {
      dispatch({type: 'PROMPT', modo: 'save', buffer: estado.ruta || ''})
    }
  })

  const pagina = Math.floor(estado.cursor.fila / PAGE)
  const desde = pagina * PAGE
  const nombreCol = estado.columnas[estado.cursor.col]
  const valorTabla = nombreCol ? (estado.registros[estado.cursor.fila]?.[nombreCol] ?? '') : ''
  const valorActual = estado.modo === 'edit' ? estado.buffer : valorTabla

  return (
    <Box
      width={ANCHO}
      height={ALTO}
      flexDirection="column"
      borderStyle="single"
      borderColor={PALETA.marco}
      backgroundColor={PALETA.fondo}
      paddingX={1}
      paddingY={1}
    >
      <BarraSuperior ruta={estado.ruta} registros={estado.registros} columnas={estado.columnas} />

      {estado.aviso ? <Text color={PALETA.marca}>{estado.aviso}</Text> : null}

      {estado.modo === 'open' ? (
        <Text color={PALETA.marca}>Abrir &gt; {estado.buffer}</Text>
      ) : estado.modo === 'save' ? (
        <Text color={PALETA.marca}>Guardar &gt; {estado.buffer}</Text>
      ) : (
        <Text>
          <Text color={PALETA.tenue}>Valor &gt; </Text>
          <Text bold color={PALETA.claro}>{valorActual}</Text>
        </Text>
      )}

      <Grilla
        columnas={estado.columnas}
        registros={estado.registros}
        cursor={estado.cursor}
        desde={desde}
        modo={estado.modo}
        buffer={estado.buffer}
      />

      <BarraInferior modo={estado.modo} cursor={estado.cursor} />
    </Box>
  )
}

const app = render(<App />)
await app.waitUntilExit()
console.clear()