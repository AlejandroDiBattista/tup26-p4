#!/usr/bin/env tsx
import React, { useState, useEffect } from 'react';
import { render, Box, Text, useInput, useApp } from 'ink';
import TextInput from 'ink-text-input';
import fs from 'fs';

function abrirArchivoCsv(ruta) {
  const contenido = fs.readFileSync(ruta, 'utf-8').trim();

  const lineas = contenido.split('\n').filter(linea => linea.trim() !== '');

  const encabezados = lineas[0].split(',');

  const filas = lineas.slice(1).map(linea => linea.split(','));
  return { encabezados, filas };
}

function guardarArchivoCsv(ruta, encabezados, filas) {
  const textoEncabezados = encabezados.join(',');

  // Agarro todas mis filas, pego sus celdas con comitas, y después separo cada renglón con un Enter (\n)
  const textoFilas = filas.map(fila => fila.join(',')).join('\n');

  // Pego los títulos arriba y los datos abajo
  const textoFinal = textoEncabezados + '\n' + textoFilas;

  // Por último, le digo a la compu que escriba y guarde el archivo con todo esto
  fs.writeFileSync(ruta, textoFinal, 'utf-8');
}

function recortarTexto(texto) {
  let palabra = String(texto || '');

  // Si la palabra pasa las 12 letras, la cortoy le meto tres puntitos
  if (palabra.length > 12) {
    return palabra.substring(0, 9) + '...';
  }

  // Si es cortita, le agrego espacios vacíos hasta llegar a 15 caracteres para que todas mis columnas midan igual
  return palabra.padEnd(15, ' ');
}


function App({ archivoInicial }) {
  // Esto lo saco de la librería para poder cerrar el programa cuando quiera apretando Escape
  const { exit } = useApp();


  // Acá guardo todas las cosas que van a ir cambiando mientras uso mi programa
  const [archivo, setArchivo] = useState(archivoInicial || '');
  const [encabezados, setEncabezados] = useState([]);
  const [filas, setFilas] = useState([]);

  // Este modo me dice qué estoy haciendo: si estoy 'viendo' la tabla, o intentando 'abrir', 'guardar' o 'editar' algo
  const [modo, setModo] = useState(archivoInicial ? 'viendo' : 'abrir');

  // Acá me anoto en qué fila y en qué columna estoy parado con el cursor
  const [filaActual, setFilaActual] = useState(0);
  const [colActual, setColActual] = useState(0);
  const [scroll, setScroll] = useState(0);

  // Textos que le muestro en verde al usuario o que él me escribe a mí
  const [textoIngresado, setTextoIngresado] = useState('');
  const [mensaje, setMensaje] = useState('');

  // Si de entrada me pasaron un archivo por la consola (ej: edit datos.csv), lo intento abrir apenas arranca esto
  useEffect(() => {
    if (archivoInicial) {
      try {
        const datos = abrirArchivoCsv(archivoInicial);
        setEncabezados(datos.encabezados);
        setFilas(datos.filas);
        setMensaje('Archivo cargado joya.');
      } catch (error) {
        setMensaje('Che, hubo un error al abrir: ' + error.message);
      }
    }
  }, [archivoInicial]);

  // --- Función para cuando el usuario aprieta "Enter" al escribir texto ---
  const confirmarTexto = (valor) => {
    if (modo === 'abrir') {
      // Intento abrir lo que me escribió
      try {
        const datos = abrirArchivoCsv(valor);
        setEncabezados(datos.encabezados);
        setFilas(datos.filas);
        setArchivo(valor);
        // Vuelvo el cursor al principio de la tabla
        setFilaActual(0);
        setColActual(0);
        setMensaje('¡Archivo abierto!');
      } catch (error) {
        setMensaje('Ups, no pude abrir ese archivo.');
      }
    } else if (modo === 'guardar') {
      // Llamo a mi funcioncita de arriba para guardar
      guardarArchivoCsv(valor, encabezados, filas);
      setArchivo(valor);
      setMensaje('¡Lo guardé!');
    } else if (modo === 'editar') {
      // Me hago una copia de las filas, le cambio el dato justo donde estoy parado y la guardo en memoria
      const nuevasFilas = [...filas];
      nuevasFilas[filaActual][colActual] = valor;
      setFilas(nuevasFilas);
      setMensaje('Celda actualizada.');
    }

    // Siempre que termino un proceso, vuelvo a poner el programa en modo "viendo" la tabla
    setModo('viendo');
  };


  // --- Controles del teclado (Acá leo qué tecla me están tocando) ---
  useInput((tecla, evento) => {
    // Si estoy en un modo de escribir texto (input), solo quiero que ande la tecla Escape para cancelar
    if (modo !== 'viendo') {
      if (evento.escape) {
        setModo('viendo');
        setMensaje('Acción cancelada.');
      }
      return;
    }

    // Si estoy viendo la tabla y me tocan Escape, cierro el programa de una
    if (evento.escape) {
      exit();
    }

    // Lógica de las flechitas para moverme por las celdas
    if (evento.up && filaActual > 0) {
      setFilaActual(filaActual - 1);
      // Si me voy muy para arriba visualmente, muevo el scroll
      if (filaActual - 1 < scroll) setScroll(filaActual - 1);
    }
    if (evento.down && filaActual < filas.length - 1) {
      setFilaActual(filaActual + 1);
      // Si me paso de la fila 10 para abajo, bajo el scroll para acompañar
      if (filaActual + 1 >= scroll + 10) setScroll(filaActual + 1 - 9);
    }
    if (evento.left && colActual > 0) {
      setColActual(colActual - 1);
    }
    if (evento.right && colActual < encabezados.length - 1) {
      setColActual(colActual + 1);
    }

    // Letritas de comandos rápidos
    if (tecla === 'a' || tecla === 'A') {
      setTextoIngresado('');
      setModo('abrir');
      setMensaje('Decime el nombre del archivo a abrir:');
    }
    if (tecla === 'g' || tecla === 'G') {
      setTextoIngresado(archivo);
      setModo('guardar');
      setMensaje('¿Con qué nombre lo guardo?');
    }
    if (evento.return && filas.length > 0) {
      // Al tocar Enter, copio lo que tiene la celda y me pongo en modo edición
      setTextoIngresado(filas[filaActual][colActual]);
      setModo('editar');
      setMensaje('Editando esta celda:');
    }

    // Letras de mayor y menor para ordenar mi tablita
    if (tecla === '<' || tecla === '>') {
      const filasCopia = [...filas];
      filasCopia.sort((a, b) => {
        // Comparo los textos de la columna actual para ver quién va antes en el abecedario
        if (tecla === '<') {
           return String(a[colActual]).localeCompare(String(b[colActual]));
        } else {
           return String(b[colActual]).localeCompare(String(a[colActual]));
        }
      });
      setFilas(filasCopia);
      setMensaje('¡Listo, ordené la tabla!');
    }
  });


  // --- Lo que se va a dibujar en la terminal de colores ---
  return (
    <Box flexDirection="column" padding={1}>

      {/* Este es el marquito de arriba con la info del archivo */}
      <Box borderStyle="round" borderColor="cyan" paddingX={1} flexDirection="column">
        <Text bold>Mi Editor CSV - TP2</Text>
        <Text color="gray">Archivo: <Text color="cyan">{archivo}</Text> | Filas: {filas.length} | Columnas: {encabezados.length}</Text>
      </Box>

      {/* Acá dibujo la tabla entera, pero solo si tengo datos cargados y estoy en modo "viendo" */}
      {encabezados.length > 0 && modo === 'viendo' && (
        <Box flexDirection="column" marginY={1}>
          
          {/* Dibujo primero la fila con todos mis títulos en fondo azul */}
          <Box>
            <Text bold backgroundColor="blue" color="white">{' # '.padEnd(5, ' ')}</Text>
            {encabezados.map((titulo, i) => (
              <Text key={i} bold backgroundColor="blue" color="white">
                {recortarTexto(titulo)}
              </Text>
            ))}
          </Box>

          {/* Dibujo mis filas de a 10 a la vez para que no explote la pantalla hacia abajo */}
          {filas.slice(scroll, scroll + 10).map((fila, indice) => {
            const numeroReal = indice + scroll;
            
            return (
              <Box key={numeroReal}>
                {/* Dibujo el número de fila al costadito izquierdo */}
                <Text color="gray">{String(numeroReal + 1).padEnd(5, ' ')}</Text>

                {/* Y adentro dibujo todas mis celditas con los datos */}
                {fila.map((celda, indiceColumna) => {
                  // Me fijo si mi cursor está parado exactamente acá para pintarlo de blanco
                  const estoyParadoAca = (filaActual === numeroReal) && (colActual === indiceColumna);
                  
                  return (
                    <Text key={indiceColumna} backgroundColor={estoyParadoAca ? 'white' : undefined} color={estoyParadoAca ? 'black' : undefined}>
                      {recortarTexto(celda)}
                    </Text>
                  );
                })}
              </Box>
            );
          })}
        </Box>
      )}

      {/* Si estoy en modo escribir, saco la tabla un segundo y dibujo mi cajita de Input */}
      {modo !== 'viendo' && (
        <Box paddingY={1} flexDirection="column">
          <Text color="yellow">{mensaje}</Text>
          <Box>
            <Text color="green">{'> '} </Text>
            <TextInput value={textoIngresado} onChange={setTextoIngresado} onSubmit={confirmarTexto} />
          </Box>
        </Box>
      )}

      {/* Por último, la barra de ayuda de abajo de todo */}
      {modo === 'viendo' && (
        <Box flexDirection="column" marginTop={1}>
          <Text color="green">{mensaje}</Text>
          <Text color="gray">Moverse: Flechitas | A: Abrir | G: Guardar | Enter: Editar | {'<'}/{'>'}: Ordenar | Esc: Salir</Text>
        </Box>
      )}

    </Box>
  );
}

// Me fijo si el profe me pasó un archivo por la consola para arrancarlo directamente
const nombreArchivo = process.argv[2] || null;

// Y arranco toda mi aplicación mandándole ese archivo
render(<App archivoInicial={nombreArchivo} />);