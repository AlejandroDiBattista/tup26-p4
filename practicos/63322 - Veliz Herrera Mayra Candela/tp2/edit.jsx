#!/usr/bin/env -S node --import tsx

import React, {useEffect, useReducer} from 'react'
import {render, Box, Text, useInput, useApp} from 'ink'
import {readFile, writeFile} from 'node:fs/promises'
import {basename} from 'node:path'

const ANCHO = process.stdout.columns || 80
const ALTO = process.stdout.rows || 24

const PALETA = {
  fondo: '#161310',
  marco: '#726b61',
  claro: '#ede7db',
  tenue: '#ada79e',
  marca: '#edbb64',
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

const estadoInicial = {
  modo: 'idle',
  ruta: '',
  columnas: [],
  registros: [],
  buffer: '',
  aviso: '',
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
    default:
      return estado
  }
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

    if (key.escape) {
      exit()
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

  const preview = estado.registros
    .slice(0, 4)
    .map((fila, i) => `${i + 1}. ${estado.columnas.map((c) => fila[c]).join(' | ')}`)
    .join('\n')

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
      <Text bold color={PALETA.claro}>
        {estado.ruta ? basename(estado.ruta) : '(ningun archivo)'}
      </Text>
      <Text color={PALETA.tenue}>
        {estado.registros.length} registros / {estado.columnas.length} campos
      </Text>

      {estado.aviso ? <Text color={PALETA.marca}>{estado.aviso}</Text> : null}

      {estado.modo === 'open' ? (
        <Text color={PALETA.marca}>Abrir &gt; {estado.buffer}</Text>
      ) : estado.modo === 'save' ? (
        <Text color={PALETA.marca}>Guardar &gt; {estado.buffer}</Text>
      ) : (
        <Text color={PALETA.tenue}>
          <Text bold color={PALETA.marca}>A</Text> abrir{'  '}
          <Text bold color={PALETA.marca}>G</Text> guardar{'  '}
          <Text bold color={PALETA.marca}>Esc</Text> salir
        </Text>
      )}

      <Box marginTop={1} flexDirection="column">
        <Text color={PALETA.tenue}>vista previa (sin grilla todavia)</Text>
        <Text color={PALETA.claro}>{preview || 'sin datos'}</Text>
      </Box>
    </Box>
  )
}

const app = render(<App />)
await app.waitUntilExit()
console.clear()