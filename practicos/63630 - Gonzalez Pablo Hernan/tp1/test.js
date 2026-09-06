#!/usr/bin/env node

import {spawnSync} from 'node:child_process';
import {existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join, resolve} from 'node:path';

// Este archivo se ejecuta desde la carpeta del práctico del alumno.
const programa = resolve(process.cwd(), 'sortx.js');
const TIEMPO_MAXIMO_MS = 5000;

const empleados =
`nombre,apellido,edad,salario,departamento
Carla,Castro,42,120000,Gerencia
Federico,Fernández,38,95000,Gerencia
Bruno,Benítez,28,72000,Diseño
Elena,Escobar,25,65000,Diseño
Ana,Álvarez,35,85000,Ingeniería
Diego,Díaz,31,88000,Ingeniería`;

const casos = [
    {
        nombre: 'Muestra la ayuda',
        argumentos: () => ['--help'],
        verificar: ({codigo, salida}) => {
            exigir(codigo === 0, `código de salida ${codigo}`);
            exigir(salida.includes('sortx'), 'la ayuda no menciona sortx');
        },
    },
    {
        nombre: 'Ordena alfabéticamente manteniendo el encabezado',
        entrada: empleados,
        argumentos: ({entrada, salida}) => [entrada, salida, '-b', 'apellido'],
        esperado:
`nombre,apellido,edad,salario,departamento
Ana,Álvarez,35,85000,Ingeniería
Bruno,Benítez,28,72000,Diseño
Carla,Castro,42,120000,Gerencia
Diego,Díaz,31,88000,Ingeniería
Elena,Escobar,25,65000,Diseño
Federico,Fernández,38,95000,Gerencia`,
    },
    {
        nombre: 'Ordena numéricamente en forma descendente',
        entrada: empleados,
        argumentos: ({entrada, salida}) => [entrada, salida, '--by', 'salario:num:desc'],
        esperado:
`nombre,apellido,edad,salario,departamento
Carla,Castro,42,120000,Gerencia
Federico,Fernández,38,95000,Gerencia
Diego,Díaz,31,88000,Ingeniería
Ana,Álvarez,35,85000,Ingeniería
Bruno,Benítez,28,72000,Diseño
Elena,Escobar,25,65000,Diseño`,
    },
    {
        nombre: 'Aplica varios criterios en el orden indicado',
        entrada: empleados,
        argumentos: ({entrada, salida}) => [
            entrada,
            salida,
            '-b',
            'departamento',
            '-b',
            'salario:num:desc',
        ],
        esperado:
`nombre,apellido,edad,salario,departamento
Bruno,Benítez,28,72000,Diseño
Elena,Escobar,25,65000,Diseño
Carla,Castro,42,120000,Gerencia
Federico,Fernández,38,95000,Gerencia
Diego,Díaz,31,88000,Ingeniería
Ana,Álvarez,35,85000,Ingeniería`,
    },
    {
        nombre: 'Ordena sin encabezado usando índices',
        entrada:
`Ana,35,85000
Luis,20,100000
Beto,30,90000`,
        argumentos: ({entrada, salida}) => [entrada, salida, '-nh', '-b', '1:num:desc'],
        esperado:
`Ana,35,85000
Beto,30,90000
Luis,20,100000`,
    },
    {
        nombre: 'Conserva un delimitador de tabulación',
        entrada:
`nombre\tsalario
Ana\t85000
Luis\t120000`,
        argumentos: ({entrada, salida}) => [entrada, salida, '-d', '\\t', '-b', 'salario:num:desc'],
        esperado:
`nombre\tsalario
Luis\t120000
Ana\t85000`,
    },
];

function exigir(condicion, motivo) {
    if (!condicion) {
        throw new Error(motivo);
    }
}

function ejecutarProceso(argumentos) {
    const proceso = spawnSync(process.execPath, [programa, ...argumentos], {
        encoding: 'utf8',
        timeout: TIEMPO_MAXIMO_MS,
        maxBuffer: 1024 * 1024,
    });

    if (proceso.error?.code === 'ETIMEDOUT') {
        throw new Error('superó el tiempo máximo de ejecución');
    }

    if (proceso.error !== undefined) {
        throw new Error('no pudo iniciarse');
    }

    if (proceso.signal !== null) {
        throw new Error(`se interrumpió por ${proceso.signal}`);
    }

    if (proceso.status === null) {
        throw new Error('superó el tiempo máximo de ejecución');
    }

    return {
        codigo: proceso.status,
        salida: `${proceso.stdout ?? ''}${proceso.stderr ?? ''}`,
    };
}

function verificarSintaxis() {
    const proceso = spawnSync(process.execPath, ['--check', programa], {
        encoding: 'utf8',
        timeout: TIEMPO_MAXIMO_MS,
        maxBuffer: 1024 * 1024,
    });

    if (proceso.error !== undefined) {
        throw new Error('no pudo comprobarse la sintaxis');
    }

    if (proceso.status !== 0) {
        throw new Error('no se pudo ejecutar');
    }
}

function ejecutarCaso(caso) {
    const carpetaTemporal = mkdtempSync(join(tmpdir(), 'sortx-test-'));
    const entrada = join(carpetaTemporal, 'entrada.txt');
    const salida = join(carpetaTemporal, 'salida.txt');

    try {
        if (caso.entrada !== undefined) {
            writeFileSync(entrada, caso.entrada, 'utf8');
        }

        const resultado = ejecutarProceso(caso.argumentos({entrada, salida}));

        if (caso.esperado !== undefined) {
            if (resultado.codigo !== 0) {
                throw new Error('no se pudo ejecutar');
            }
            exigir(existsSync(salida), 'no creó el archivo de salida');

            const contenido = readFileSync(salida, 'utf8');
            exigir(contenido === caso.esperado, 'el resultado no coincide con el esperado');
        }

        caso.verificar?.(resultado);
    } finally {
        rmSync(carpetaTemporal, {recursive: true, force: true});
    }
}

function mostrarEncabezado() {
    console.log('== Diagnóstico de TP1 — sortx ==');
    console.log(`\nArchivo evaluado: ${programa}\n`);
}

function terminarSinEjecucion(motivo) {
    mostrarEncabezado();
    console.log(`ERROR: ${motivo}`);
    console.log('');
    console.log('\n🔴 DIAGNÓSTICO: sortx.js no se ejecuta correctamente.\n');
    return 2;
}

function main() {
    if (!existsSync(programa)) {
        return terminarSinEjecucion('no se encontró sortx.js en la carpeta actual.');
    }

    let contenido;
    try {
        contenido = readFileSync(programa, 'utf8');
    } catch {
        return terminarSinEjecucion('no se pudo leer sortx.js.');
    }

    const cantidadLineas = contenido.trimEnd() === ''
        ? 0
        : contenido.trimEnd().split(/\r?\n/).length;

    if (cantidadLineas < 50) {
        mostrarEncabezado();
        console.log(`PENDIENTE: sortx.js tiene ${cantidadLineas} líneas; se requieren al menos 50 para revisar el desarrollo.`);
        console.log('');
        console.log('DIAGNÓSTICO: desarrollo insuficiente como para ser presentado.');
        return 1;
    }

    let motivoAyuda = '';

    try {
        const resultadoAyuda = ejecutarProceso(['--help']);
        exigir(resultadoAyuda.codigo === 0, `--help terminó con código ${resultadoAyuda.codigo}`);
    } catch (error) {
        motivoAyuda = error.message;
    }

    if (motivoAyuda !== '') {
        return terminarSinEjecucion(`falló la ejecución inicial (--help: ${motivoAyuda}).`);
    }

    try {
        verificarSintaxis();
    } catch (error) {
        return terminarSinEjecucion(error.message);
    }

    let aprobados = 0;
    const resultados = [];
    for (const caso of casos) {
        try {
            ejecutarCaso(caso);
            aprobados += 1;
            resultados.push(`🟢 ${caso.nombre}`);
        } catch (error) {
            if (error.message === 'no se pudo ejecutar') {
                return terminarSinEjecucion('no se pudo ejecutar');
            }
            resultados.push(`🔴 ${caso.nombre} (${error.message})`);
        }
    }

    mostrarEncabezado();
    console.log(`Pruebas ejecutadas: ${casos.length}`);
    console.log('');
    for (const resultado of resultados) {
        console.log(resultado);
    }

    console.log(`\nResultado: ${aprobados}/${casos.length} pruebas superadas.\n`);

    if (aprobados === casos.length) {
        console.log('\nDIAGNÓSTICO: 🟢 Tiene suficientes pruebas aprobadas como para ser presentado.\n');
        return 0;
    }

    console.log('\nDIAGNÓSTICO: 🟡 Se ejecuta, pero todavía no paso todas las pruebas para ser presentado.\n');
    return 1;
}

process.exitCode = main();
