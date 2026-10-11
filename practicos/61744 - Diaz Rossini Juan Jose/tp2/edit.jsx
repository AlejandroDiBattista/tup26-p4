#!/usr/bin/env -S node --import tsx

import React, {useEffect, useMemo, useState} from 'react';
import {render, Box, Text, useApp, useInput} from 'ink';
import {TextInput} from '@inkjs/ui';
import {readFile, writeFile} from 'node:fs/promises';
import {basename} from 'node:path';

const COLORES = {fondo: '#161310', borde: '#726b61', titulo: '#ede7db', secundario: '#ada79e', acento: '#edbb64'};
const columnasTerminal = () => process.stdout.columns || 80;
const filasTerminal = () => process.stdout.rows || 24;

function leerCsv(contenido) {
	const lineas = contenido.replace(/^\uFEFF/, '').split(/\r?\n/).filter(linea => linea !== '');
	if (!lineas.length) throw new Error('El archivo está vacío.');
	const cabecera = lineas[0].split(',');
	const filas = lineas.slice(1).map(linea => linea.split(','));
	if (filas.some(registro => registro.length !== cabecera.length)) throw new Error('Las filas no tienen la misma cantidad de campos.');
	return {cabecera, filas};
}

function App() {
	const {exit} = useApp();
	const inicial = process.argv.slice(2)[0];
	const [archivo, setArchivo] = useState(null);
	const [cabecera, setCabecera] = useState([]);
	const [filas, setFilas] = useState([]);
	const [fila, setFila] = useState(0);
	const [columna, setColumna] = useState(0);
	const [modo, setModo] = useState(inicial ? 'cargando' : 'abrir');
	const [entrada, setEntrada] = useState(inicial || '');
	const [error, setError] = useState('');

	const abrir = async nombre => {
		try {
			const datos = leerCsv(await readFile(nombre, 'utf8'));
			setArchivo(nombre); setCabecera(datos.cabecera); setFilas(datos.filas);
			setFila(0); setColumna(0); setError(''); setModo('tabla');
		} catch (causa) { setError(`No se pudo abrir: ${causa.message}`); setModo('abrir'); }
	};
	useEffect(() => { if (inicial) abrir(inicial); }, []);

	const guardar = async nombre => {
		try {
			await writeFile(nombre, [cabecera, ...filas].map(registro => registro.join(',')).join('\n') + '\n', 'utf8');
			setArchivo(nombre); setError(''); setModo('tabla');
		} catch (causa) { setError(`No se pudo guardar: ${causa.message}`); setModo('guardar'); }
	};
	const ordenar = direccion => {
		setFilas(actual => [...actual].sort((a, b) => a[columna].localeCompare(b[columna], 'es', {numeric: true, sensitivity: 'base'}) * direccion));
		setFila(0);
	};

	useInput((tecla, key) => {
		if (modo !== 'tabla') return;
		if (key.escape) return exit();
		if (key.leftArrow) return setColumna(i => Math.max(0, i - 1));
		if (key.rightArrow) return setColumna(i => Math.min(cabecera.length - 1, i + 1));
		if (key.upArrow) return setFila(i => Math.max(0, i - 1));
		if (key.downArrow) return setFila(i => Math.min(filas.length - 1, i + 1));
		if (key.return && filas.length) { setEntrada(filas[fila][columna]); return setModo('editar'); }
		if (tecla.toLowerCase() === 'a') { setEntrada(''); return setModo('abrir'); }
		if (tecla.toLowerCase() === 'g') { setEntrada(archivo || ''); return setModo('guardar'); }
		if (tecla === '<') return ordenar(1);
		if (tecla === '>') return ordenar(-1);
	});
	useInput((tecla, key) => {
		if (modo !== 'tabla' && key.escape) {
			if (!archivo) return exit();
			setError(''); setModo('tabla');
		}
	});

	const confirmar = texto => {
		if (!texto.trim()) return setError('Debe indicar un valor.');
		if (modo === 'abrir') return abrir(texto.trim());
		if (modo === 'guardar') return guardar(texto.trim());
		setFilas(actual => actual.map((registro, numero) => numero === fila ? registro.map((celda, indice) => indice === columna ? texto : celda) : registro));
		setModo('tabla');
	};

	const ancho = columnasTerminal(), alto = filasTerminal();
	const anchos = useMemo(() => cabecera.map((nombre, indice) => {
		const mayor = Math.max(nombre.length, ...filas.map(registro => registro[indice].length));
		return Math.min(Math.max(10, mayor + 2), Math.max(10, Math.floor((ancho - 7) / cabecera.length)));
	}), [cabecera, filas, ancho]);
	const cantidadVisible = Math.max(1, alto - 9);
	const inicio = Math.max(0, Math.min(fila - Math.floor(cantidadVisible / 2), Math.max(0, filas.length - cantidadVisible)));
	const formulario = modo !== 'tabla' && modo !== 'cargando';
	const etiqueta = modo === 'abrir' ? 'Abrir' : modo === 'guardar' ? 'Guardar' : 'Editar';

	if (modo === 'cargando') return <Text color={COLORES.secundario}>Abriendo archivo…</Text>;
	return <Box width={ancho} height={alto} paddingX={1} flexDirection="column" borderStyle="round" borderColor={COLORES.borde} backgroundColor={COLORES.fondo}>
		<Box justifyContent="space-between"><Text bold color={COLORES.titulo}>{archivo ? basename(archivo) : 'Editor CSV'}</Text>{archivo && <Text color={COLORES.secundario}>{filas.length} filas · {cabecera.length} columnas</Text>}</Box>
		<Box marginTop={1}>{formulario ? <><Text color={COLORES.secundario}>{etiqueta} <Text bold color={COLORES.acento}>› </Text></Text><TextInput defaultValue={entrada} onChange={setEntrada} onSubmit={confirmar}/></> : <Text color={COLORES.secundario}>Valor <Text bold color={COLORES.acento}>› </Text><Text bold color={COLORES.titulo}>{filas[fila]?.[columna] ?? ''}</Text></Text>}</Box>
		{error && <Text color="#e67e67">{error}</Text>}
		{archivo && <Box marginTop={1} flexDirection="column"><Box><Box width={6}><Text bold color={COLORES.secundario}>#</Text></Box>{cabecera.map((nombre, i) => <Box key={i} width={anchos[i]}><Text bold color={i === columna ? COLORES.acento : COLORES.secundario}>{nombre.toUpperCase()}</Text></Box>)}</Box>
			{filas.slice(inicio, inicio + cantidadVisible).map((registro, indice) => { const numero = inicio + indice; return <Box key={numero}><Box width={6}><Text color={numero === fila ? COLORES.acento : COLORES.titulo}>{numero + 1}</Text></Box>{registro.map((celda, i) => <Box key={i} width={anchos[i]}><Text inverse={numero === fila && i === columna} color={numero === fila && i === columna ? '#555555' : COLORES.titulo} wrap="truncate">{celda}</Text></Box>)}</Box>; })}</Box>}
		<Box marginTop="auto" justifyContent="space-between"><Text color={COLORES.secundario}>{formulario ? <><Text bold color={COLORES.acento}>Enter</Text> confirmar · <Text bold color={COLORES.acento}>Esc</Text> cancelar</> : <><Text bold color={COLORES.acento}>A</Text> abrir · <Text bold color={COLORES.acento}>G</Text> guardar · <Text bold color={COLORES.acento}>Enter</Text> editar · <Text bold color={COLORES.acento}>&lt;</Text> ascendente · <Text bold color={COLORES.acento}>&gt;</Text> descendente · <Text bold color={COLORES.acento}>Esc</Text> salir</>}</Text>{archivo && <Text color={COLORES.secundario}>Fila {fila + 1} · Columna {columna + 1}</Text>}</Box>
	</Box>;
}

const app = render(<App />);
await app.waitUntilExit();
console.clear();
