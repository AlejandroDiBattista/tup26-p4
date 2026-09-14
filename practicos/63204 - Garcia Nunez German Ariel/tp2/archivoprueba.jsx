#!/usr/bin/env tsx
import React, { useState, useEffect } from 'react';
import { render, Box, Text, useInput, useApp } from 'ink';
import TextInput from 'ink-text-input';
import fs from 'fs';

// =====================================================================
// BLOQUE 1: FUNCIONES DE ARCHIVOS (No tocan la pantalla, solo leen/escriben)
// =====================================================================

function abrirArchivoCsv(ruta) {
  // 1. Lee el texto, lo corta por renglones y luego por comas
  const contenido = fs.readFileSync(ruta, 'utf-8').trim();
  const lineas = contenido.split('\n').filter(linea => linea.trim() !== '');
  
  const encabezados = lineas[0].split(',');
  const filas = lineas.slice(1).map(linea => linea.split(','));
  
  return { encabezados, filas };
}

function guardarArchivoCsv(ruta, encabezados, filas) {
  // 2. Une los datos con comas y saltos de línea para guardar
  const textoEncabezados = encabezados.join(',');
  const textoFilas = filas.map(fila => fila.join(',')).join('\n');
  const textoFinal = textoEncabezados + '\n' + textoFilas;
  
  fs.writeFileSync(ruta, textoFinal, 'utf-8');
}

function recortarTexto(texto) {
  // 3. Esta funcioncita recorta textos largos para que la tabla no se deforme
  let palabra = String(texto || '');
  if (palabra.length > 12) return palabra.substring(0, 9) + '...';
  return palabra.padEnd(15, ' ');
}


// =====================================================================
// BLOQUE 2: EL COMPONENTE PRINCIPAL (La Aplicación)
// =====================================================================

function App({ archivoInicial }) {
  const { exit } = useApp();

  // --- A. LA MEMORIA (Estados) ---
  const [archivo, setArchivo] = useState(archivoInicial || '');
  const [encabezados, setEncabezados] = useState([]);
  const [filas, setFilas] = useState([]);
  
  // 'viendo', 'abrir', 'guardar', o 'editar'
  const [modo, setModo] = useState(archivoInicial ? 'viendo' : 'abrir'); 
  
  // Coordenadas
  const [filaActual, setFilaActual] = useState(0);
  const [colActual, setColActual] = useState(0);
  const [scroll, setScroll] = useState(0);
  
  // Textos y mensajes en pantalla
  const [textoIngresado, setTextoIngresado] = useState('');
  const [mensaje, setMensaje] = useState('');


  // --- B. CARGA INICIAL ---
  // Si le pasamos un archivo al comando (ej: edit empleados.csv), lo abre
  useEffect(() => {
    if (archivoInicial) {
      try {
        const datos = abrirArchivoCsv(archivoInicial);
        setEncabezados(datos.encabezados);
        setFilas(datos.filas);
        setMensaje('Archivo cargado.');
      } catch (error) {
        setMensaje('Error al abrir: ' + error.message);
      }
    }
  }, [archivoInicial]);


  // --- C. CONTROLES DEL TECLADO ---
  useInput((tecla, evento) => {
    // Si estamos escribiendo un texto, cancelamos con Escape
    if (modo !== 'viendo') {
      if (evento.escape) {
        setModo('viendo');
        setMensaje('Cancelado.');
      }
      return; 
    }

    // Si apretamos Escape viendo la tabla, salimos del programa
    if (evento.escape) exit();

    // Navegar con flechitas
    if (evento.up && filaActual > 0) {
      setFilaActual(filaActual - 1);
      if (filaActual - 1 < scroll) setScroll(filaActual - 1);
    }
    if (evento.down && filaActual < filas.length - 1) {
      setFilaActual(filaActual + 1);
      // Solo mostramos 10 filas, por eso restamos 9 para scrollear
      if (filaActual + 1 >= scroll + 10) setScroll(filaActual + 1 - 9);
    }
    if (evento.left && colActual > 0) setColActual(colActual - 1);
    if (evento.right && colActual < encabezados.length - 1) setColActual(colActual + 1);

    // Comandos de letras
    if (tecla === 'a' || tecla === 'A') {
      setTextoIngresado('');
      setModo('abrir');
      setMensaje('Nombre del archivo a abrir:');
    }
    if (tecla === 'g' || tecla === 'G') {
      setTextoIngresado(archivo);
      setModo('guardar');
      setMensaje('Guardar archivo como:');
    }
    if (evento.return && filas.length > 0) {
      setTextoIngresado(filas[filaActual][colActual]);
      setModo('editar');
      setMensaje('Editando celda:');
    }

    // Ordenar con < o >
    if (tecla === '<' || tecla === '>') {
      const filasCopia = [...filas];
      filasCopia.sort((a, b) => {
        const valorA = a[colActual];
        const valorB = b[colActual];
        // Compara los textos para ordenarlos alfabéticamente
        return tecla === '<' 
          ? String(valorA).localeCompare(String(valorB)) 
          : String(valorB).localeCompare(String(valorA));
      });
      setFilas(filasCopia);
      setMensaje('Tabla ordenada.');
    }
  });


  // --- D. FUNCIÓN PARA CONFIRMAR TEXTOS (El "Enter" en los inputs) ---
  const confirmarTexto = (valor) => {
    if (modo === 'abrir') {
      try {
        const datos = abrirArchivoCsv(valor);
        setEncabezados(datos.encabezados);
        setFilas(datos.filas);
        setArchivo(valor);
        setFilaActual(0);
        setColActual(0);
        setMensaje('Archivo abierto.');
      } catch (e) {
        setMensaje('Error al abrir.');
      }
    } else if (modo === 'guardar') {
      guardarArchivoCsv(valor, encabezados, filas);
      setArchivo(valor);
      setMensaje('Archivo guardado.');
    } else if (modo === 'editar') {
      const nuevasFilas = [...filas];
      nuevasFilas[filaActual][colActual] = valor;
      setFilas(nuevasFilas);
      setMensaje('Celda guardada.');
    }
    setModo('viendo'); // Volvemos a la tabla después de dar Enter
  };


  // =====================================================================
  // BLOQUE 3: DIBUJO DE LA PANTALLA (HTML/JSX)
  // =====================================================================
  
  return (
    <Box flexDirection="column" padding={1}>
      
      {/* CABECERA CON DATOS */}
      <Box borderStyle="round" borderColor="cyan" paddingX={1} flexDirection="column">
        <Text bold>Editor CSV - TP2</Text>
        <Text color="gray">
          Archivo: <Text color="cyan">{archivo}</Text> | Filas: {filas.length} | Columnas: {encabezados.length}
        </Text>
      </Box>

      {/* LA TABLA (Solo se dibuja si hay datos y estamos en modo viendo) */}
      {encabezados.length > 0 && modo === 'viendo' && (
        <Box flexDirection="column" marginY={1}>
          
          {/* Fila de títulos */}
          <Box>
            <Text bold backgroundColor="blue" color="white">{' # '.padEnd(5, ' ')}</Text>
            {encabezados.map((titulo, indice) => (
              <Text key={`tit-${indice}`} bold backgroundColor="blue" color="white">
                {recortarTexto(titulo)}
              </Text>
            ))}
          </Box>
          
          {/* Filas de datos (solo mostramos 10 a la vez por el scroll) */}
          {filas.slice(scroll, scroll + 10).map((fila, indiceRenglon) => {
            const numeroFilaReal = indiceRenglon + scroll;
            
            return (
              <Box key={`fila-${numeroFilaReal}`}>
                <Text color="gray">{String(numeroFilaReal + 1).padEnd(5, ' ')}</Text>
                
                {fila.map((celda, indiceColumna) => {
                  const seleccionado = filaActual === numeroFilaReal && colActual === indiceColumna;
                  return (
                    <Text 
                      key={`cel-${indiceColumna}`} 
                      backgroundColor={seleccionado ? 'white' : undefined} 
                      color={seleccionado ? 'black' : undefined}
                    >
                      {recortarTexto(celda)}
                    </Text>
                  );
                })}
              </Box>
            );
          })}
        </Box>
      )}

      {/* ZONA DE ESCRITURA (Inputs para editar, guardar o abrir) */}
      {modo !== 'viendo' && (
        <Box paddingY={1} flexDirection="column">
          <Text color="yellow">{mensaje}</Text>
          <Box>
            <Text color="green">{'> '} </Text>
            <TextInput value={textoIngresado} onChange={setTextoIngresado} onSubmit={confirmarTexto} />
          </Box>
          <Text color="gray">Presiona Enter para confirmar o Esc para cancelar.</Text>
        </Box>
      )}

      {/* MENÚ INFERIOR (Instrucciones) */}
      {modo === 'viendo' && (
        <Box flexDirection="column" marginTop={1}>
          <Text color="green">{mensaje}</Text>
          <Text color="gray">Flechas: Mover | A: Abrir | G: Guardar | Enter: Editar | {'<'}/{'>'}: Ordenar | Esc: Salir</Text>
        </Box>
      )}
    </Box>
  );
}

// =====================================================================
// PUNTO DE ARRANQUE (Lo que ejecuta Node.js al final)
// =====================================================================
const nombreArchivo = process.argv[2] || null;
render(<App archivoInicial={nombreArchivo} />);