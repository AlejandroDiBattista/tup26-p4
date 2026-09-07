#!/usr/bin/env node

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
                        Usá "\t" para archivos separados por tabulaciones.

    -nh, --no-header    Indica que el archivo no tiene encabezado.
                        Los campos se identifican mediante índices desde cero.

    -h, --help          Muestra esta ayuda.

EJEMPLOS:
    sortx empleados.csv ordenados.csv -b apellido
    sortx empleados.csv salarios.csv -b salario:num:desc
    sortx empleados.csv resultado.csv -b departamento -b salario:num:desc
    sortx datos.csv resultado.csv -nh -b 2:num:desc
    sortx datos.tsv salida.tsv -d "\t" -b nombre
`

// Escribir aqui la solución al enunciado.
// console.log(HELP);
import fs from "fs";

function parseArgs(args){
    if (args.includes('-h') || args.includes('--help')) {
        console.log(HELP);
        process.exit(0);
    }

    const positional = [];
    const sortFieldsRaw = [];
    let delimiter = ',';
    let noHeader = false;

    for (let i = 0; i < args.length; i++) {
        const arg = args[i];

        if (arg === '-b' || arg === '--by') {
            const valor = args [++i];

            if(!valor || valor.startsWith('-')) {
                throw new Error('Falta el valor de la opción -b.');
            }
            
            const partes = valor.split(':');

            if (partes.length > 3) {
                throw new Error(`Criterio invalido: ${valor}`);
            }
            
            const campo = partes[0];
            const tipo = partes[1] || "alpha";
            const orden = partes [2] || "asc";

            if (!campo) {
                throw new Error('Falta el nombre del campo en -b')
            }
            if (tipo !== 'alpha' && tipo !== 'num') {
                throw new Error ('el tipo debe ser num o alpha')
            }
            if (orden !== 'asc' && orden !== 'desc') {
                throw new Error ('orden deberia ser desc o asc')
            }

            sortFieldsRaw.push({ campo, tipo, orden });
        }   else if (arg ==='-d' || arg === '--delimiter') {
                let val = args[++i];

                if (!val || val.startsWith('-')) {
                    throw new Error('Falta el delimitador para -d');
                }

                if (val === '\\t'){
                    val = '\t'
                }

                if (val.length !== 1){
                    throw new Error('El delimitador tiene que ser un caracter unico');
                } 
                delimiter = val;

        }   else if (arg === '-nh' || arg === '--no-header') {
            noHeader = true;

        }   else if (!arg.startsWith('-')) {
            positional.push(arg);
        }   else {
                throw new Error(`Opcion invalida: ${arg}`)
        }
    }

    if (positional.length !== 2) {
        throw new Error('De requieren exactamente archivos de origen y destino');
    }

    if (sortFieldsRaw.length === 0) {
        throw new Error('Debes indicar al menos un -b');
    }

    const sortFields = [];
    for (let i = 0; i <sortFieldsRaw.length; i++) {
        const item = sortFieldsRaw[i];
        sortFields.push({
        name: item.campo,
        numeric: item.tipo === 'num',
        descending: item.orden === 'desc'
        });
    }

    return {
        inputFile: positional [0],
        outputFile: positional [1],
        delimiter: delimiter,
        sortFields: sortFields,
        noHeader: noHeader
    }; 

}

function readInput(filename) {
    if (!fs.existsSync(filename)) {
        throw new Error(`El archivo no existe: ${filename}`);
    }

    return fs.readFileSync(filename, 'utf-8');
}

function parseDelimited(text, delimiter, noHeader){
    if (text.includes('"')){
        throw new Error('tiene comillas dobles y no esta permitido');
    }
    const lines = text.split(/\r?\n/);
    const rows = [];
    let header = null;
    let totalColumnas = 0;

    for (let i = 0; i < lines.length; i++){
        const line = lines[i];

        if (line.trim() !== ''){
            const row = line.split(delimiter);

        if (totalColumnas === 0){
            totalColumnas = row.length;
        } else if (row.length !== totalColumnas){
            throw new Error('Las filas no tienen la misma cantidad de columnas');
        }
        if (!noHeader && header === null){
            header = row;
        } else{

            rows.push(row);
        }

        }
    }

    return {
        header: header,
        rows: rows,
    };
}

function sortRows(rows, header, sortFields){
    const criterios = [];
    
    for (let i = 0; i < sortFields.length; i++){
        const campo = sortFields[i];
        let colIndex = -1;

        if (header !== null){
            for (let j = 0; j < header.length; j++){
                if (header[j] === campo.name){
                    colIndex = j;
                    break;
                }
            }
            if (colIndex === -1){
                throw new Error('No existe la columna en el encabezado');
                }
            }else{
                if (!/^\d+$/.test(campo.name)){
                    throw new Error('El criterio debe ser un numero de columna');
                }
                colIndex = parseInt(campo.name, 10);

                if (isNaN(colIndex)){
                    throw new Error('Con -nh el criterio debe ser un numero de columna')
                }
                if(rows.length > 0 && (colIndex < 0 || colIndex >= rows[0].length)){
                    throw new Error('Indice de Columna esta fuera de rango');
                }
            }

            criterios.push({
                pos: colIndex,
                esNumero: campo.numeric,
                esDesc: campo.descending
            });
        }

        const filasOrdenadas = rows.slice();

        filasOrdenadas.sort((filaA, filaB) =>{
            for(let i = 0; i < criterios.length; i++){
                const crit = criterios[i];
                let valA = filaA[crit.pos];
                let valB = filaB[crit.pos];

                let resultado = 0;

                if (crit.esNumero){
                    const numA = parseFloat(valA);
                    const numB = parseFloat(valB);
                    
                    if(isNaN(numA) || isNaN(numB)){
                        throw new Error('Intento ordenar una columna numericamente con texto invalido');
                    }
                    resultado = numA - numB;
                }else{
                    resultado = valA.localeCompare(valB);
                }

                if (resultado !== 0){
                    if (crit.esDesc){
                        return -resultado;
                    }
                    return resultado;
                }
                
            }
            return 0;
        });
    return filasOrdenadas;
}

function serialize(header, rows, deLimiter){
    const lines = [];

    if (header !== null){
        lines.push(header.join(deLimiter));
    }

    for (let i = 0; i < rows.length; i++){
        lines.push(rows[i].join(deLimiter));
    }
    return lines.join('\n');
}

function writeOutput(outputPath, content){
    if (outputPath){
        fs.writeFileSync(outputPath, content, 'utf-8');
    } else {
        console.log(content);
    }
}

function main(){
    try{
        const options = parseArgs(process.argv.slice(2));
        const rawText = readInput(options.inputFile);
        const parsed = parseDelimited(rawText, options.delimiter, options.noHeader);
        const sortedRows = sortRows(parsed.rows, parsed.header, options.sortFields);
        const outputText = serialize(parsed.header, sortedRows, options.delimiter);
        writeOutput(options.outputFile, outputText);
    } catch (error){
        console.error('Error:', error.message);
        process.exit(1);
    }
}

main();