#!/usr/bin/env node

// const HELP = `

// sortx — Ordena archivos de texto delimitados

// USO:
//     sortx <origen> <destino> [opciones]

// ARGUMENTOS:
//     origen              Archivo que se desea ordenar.
//     destino             Archivo donde se guardará el resultado.

// OPCIONES:
//     -b, --by <criterio> Criterio de ordenamiento. Se puede repetir.
//                         Formato: campo[:tipo[:orden]]
//                         tipo: alpha (predeterminado) o num
//                         orden: asc (predeterminado) o desc

//     -d, --delimiter <c> Delimitador de un solo carácter.
//                         Predeterminado: ","
//                         Usá "\t" para archivos separados por tabulaciones.

//     -nh, --no-header    Indica que el archivo no tiene encabezado.
//                         Los campos se identifican mediante índices desde cero.

//     -h, --help          Muestra esta ayuda.

// EJEMPLOS:
//     sortx empleados.csv ordenados.csv -b apellido
//     sortx empleados.csv salarios.csv -b salario:num:desc
//     sortx empleados.csv resultado.csv -b departamento -b salario:num:desc
//     sortx datos.csv resultado.csv -nh -b 2:num:desc
//     sortx datos.tsv salida.tsv -d "\t" -b nombre
// `;

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
		criterios: [{ name: "apellido", numeric: false, descending: false }],
	};
	if (argumentos.includes("-d") || argumentos.includes("--delimiter")) {
		config.delimitador =
			argumentos[argumentos.indexOf("-d") + 1] ||
			argumentos[argumentos.indexOf("--delimiter") + 1];
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
	console.log(argumentos);
	console.log(config);
}

function traductor() {
	configuracion();
}
traductor();

//Consultas a ia:
//1 Le pedi que analizara el workspace en preparacion para algun duda que tenga
//2 le pregunte como se lee la cli
