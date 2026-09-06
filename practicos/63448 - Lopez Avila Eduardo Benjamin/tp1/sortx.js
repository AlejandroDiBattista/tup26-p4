#!/usr/bin/env node
import { readFile, writeFile } from "node:fs/promises";
const HELP = `
sortx — Ordena archivos de texto delimitados
USO:
    sortx <origen> <destino> [opciones]
ARGUMENTOS:
    origen              Archivo que se desea ordenar.
    destino             Archivo donde se guardará el resultado.
OPCIONES:
    -b, --by <criterio> Criterio de ordenamiento. Se puede repetir.
                        Formato: campo[:tipo[:orden]]
                        tipo: alpha (predeterminado) o num
                        orden: asc (predeterminado) o desc
    -d, --delimiter <c> Delimitador de un solo carácter.
                        Predeterminado: ","
                        Usá "\\t" para archivos separados por tabulaciones.
    -nh, --no-header    Indica que el archivo no tiene encabezado.
                        Los campos se identifican mediante índices desde cero.
    -h, --help          Muestra esta ayuda.

EJEMPLOS:
    sortx empleados.csv ordenados.csv -b apellido
    sortx empleados.csv salarios.csv -b salario:num:desc
    sortx empleados.csv resultado.csv -b departamento -b salario:num:desc
    sortx datos.csv resultado.csv -nh -b 2:num:desc
    sortx datos.tsv salida.tsv -d "\\t" -b nombre
`;

// Escribir aqui la solución al enunciado.
// {
//   inputFile: "empleados.csv",
//   outputFile: "ordenados.csv",
//   delimiter: ",",
//   noHeader: false,
//   sortFields: [ { name: "apellido", numeric: false, descending: false } ]
// }
// 1. parseArgs      → leer los argumentos y construir la configuración
// 2. readInput      → leer el archivo de origen
// 3. parseDelimited → convertir el texto en filas y columnas
// 4. sortRows       → ordenar las filas
// 5. serialize      → reconstruir el texto delimitado
// 6. writeOutput    → escribir el archivo de destino

function configuracion() {
	const argumentos = process.argv.slice(2);
	let config = {
		input: argumentos[0],
		output: argumentos[1],
		delimitador: ",",
		noHeader: false,
		criterios: [],
	};
	if (argumentos.includes("-h") || argumentos.includes("--help")) {
		console.log(HELP);
		process.exit(0);
	}
	if (argumentos.includes("-d") || argumentos.includes("--delimiter")) {
		config.delimitador =
			argumentos[argumentos.indexOf("-d") + 1] ||
			argumentos[argumentos.indexOf("--delimiter") + 1];
		if (config.delimitador.startsWith('-')){
			console.error("Error: La opción delimitador no recibe su valor.");
			process.exit(1);
		}
	}
	if (argumentos.includes("-nh") || argumentos.includes("--no-header")) {
		config.noHeader = true;
	}
	if (argumentos.includes("-b") || argumentos.includes("--by")) {
		const crit = [];
		const indices = [];
		argumentos.forEach((arg, index) => {
			if (arg === "-b" || arg === "--by") {
				indices.push(index);
			}
		});
		indices.forEach((index) => {
			const criterio = argumentos[index + 1];
			if (criterio && criterio.startsWith('-')) {
				console.error("Error: La opción --by o -b no recibe su valor.");
				process.exit(1);
			}
			if (criterio) {
				const partes = criterio.split(":");
				const nombre = partes[0];
				const tipo = partes[1] || "alpha";
				const orden = partes[2] || "asc";
				crit.push({
					name: nombre,
					numeric: tipo === "num",
					descending: orden === "desc",
				});
			}
		});
		config.criterios = crit;
	}
	if (!config.input || !config.output || config.input.startsWith('-') || config.output.startsWith('-')) {
		console.error("Error: falta el archivo de origen o destino."); 
		process.exit(1);
	}
	const opcionesValidas = ['-b', '--by', '-d', '--delimiter', '-nh', '--no-header', '-h', '--help'];
	if (argumentos.slice(2).some(a => a.startsWith('-') && !opcionesValidas.includes(a))) {
		console.error("Error: se indica una opción desconocida."); 
		process.exit(1);
	}
	if (config.criterios.length === 0) {
		console.error("Error: no se especifica ningún criterio --by."); 
		process.exit(1);
	}
	if (config.delimitador.replace('\\t', '\t').length !== 1) {
		console.error("Error: el delimitador no es un único carácter."); process.exit(1);
	}
	console.log(config);
	return config;
}

async function readInput(input) {
	try { return await readFile(input, "utf8"); }
	catch { console.error("Error: el archivo de origen no existe o no puede leerse."); process.exit(1); }
}

function parseDelimited(text, delimiter, noHeader) {
	let tabla = {header: [], filas: []};
	if (text.includes('"')) { 
		console.error("Error: la entrada contiene comillas dobles."); 
		process.exit(1); 
	}
	tabla.filas = text.split("\n").map((fila) => fila.split(delimiter));
	if (noHeader && tabla.filas.length > 0) {
		tabla.header = tabla.filas[0].map((_, index) => index.toString());
	} else {
		tabla.header = tabla.filas.shift();
	}
	if (tabla.filas.some(f => f.length !== tabla.header.length)) {
		console.error("Error: las filas tienen diferente cantidad de campos."); process.exit(1);
	}
	return tabla;
}

function columnasPorCriterio(header, criterios) {
	return criterios.map((criterio) => {
		const index = header.indexOf(criterio.name);
		if (index === -1) { 
			console.error("Error: el campo solicitado no existe."); 
			process.exit(1);
		}
		return { ...criterio, index };
	});
}

function sortRows(filas, criterios) {
	//criterios: [{ name: "apellido", numeric: false, descending: false }],
	return filas.sort((a, b) => {
		for (const criterio of criterios) {
			const valorA = a[criterio.index];
			const valorB = b[criterio.index];
			let comparacion;
			if (criterio.numeric) {
				comparacion = parseFloat(valorA) - parseFloat(valorB);
			} else {
				comparacion = valorA.localeCompare(valorB);
			}
			if (comparacion !== 0) {
				return criterio.descending ? -comparacion : comparacion;
			}
		}
		return 0;
	});
}

function serialize(header, filas, delimiter) {
	const textoHeader = header.join(delimiter);
	const textoFilas = filas.map((fila) => fila.join(delimiter)).join("\n");
	return [textoHeader, textoFilas].join("\n");
}

async function writeOutput(output, contenido) {
	try { await writeFile(output, contenido, "utf8"); }
	catch { console.error("Error: el archivo de destino no puede escribirse."); process.exit(1); }
}

async function sorteador() {
	const config = configuracion();
	const contenido = await readInput(config.input);
	const tabla = parseDelimited(contenido, config.delimitador, config.noHeader);
	const columnacriterios = columnasPorCriterio(tabla.header, config.criterios);
	const filasOrdenadas = sortRows(tabla.filas, columnacriterios);
	console.log("Filas ordenadas:", filasOrdenadas);
	const serializado = serialize(tabla.header, filasOrdenadas, config.delimitador);
	await writeOutput(config.output, serializado);
}

sorteador();


//Consultas a ia:
//1 Le pedi que analizara el workspace en preparacion para algun duda que tenga
//2 le pregunte como se lee la cli
//3 consulte como se utiliza link y como leer el archivo de entrada
//4 como arreglar el flujo de datos para evitar trabajar con variables globales
//5 como puedo manejar errores en una funcion asincrona
//6 como funciona la funcion some()

//Notas:
//Que pasa si un usuario pasa un criterio de columna numerico pero no junto al -nh
//Si una opcion esta al final y no recibe un valor, se agarra el siguiente en el array, que seria el array[0]
//No entiendo cual es al entrada que no debe tener comillas dobles, si es el archivo de entrada o el criterio de ordenamiento