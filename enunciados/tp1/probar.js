#!/usr/bin/env node

import {spawnSync} from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync, existsSync, writeFileSync, } from 'node:fs';
import {tmpdir} from 'node:os';
import {dirname, join} from 'node:path';
import {fileURLToPath} from 'node:url';

const carpetaTp = dirname(fileURLToPath(import.meta.url));
const programa = process.argv[2] ?? join(carpetaTp, 'sortx.js');

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
        nombre: 'muestra la ayuda',
        argumentos: () => ['--help'],
        verificar: ({codigo, salida}) => {
            exigir(codigo === 0, `se esperaba código 0 y se obtuvo ${codigo}`);
            exigir(salida.includes('sortx'), 'la ayuda no menciona sortx');
        },
    },
    {
        nombre: 'ordena alfabéticamente manteniendo el encabezado',
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
        nombre: 'ordena numéricamente en forma descendente',
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
        nombre: 'aplica varios criterios en el orden indicado',
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
        nombre: 'ordena sin encabezado usando índices',
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
        nombre: 'conserva un delimitador de tabulación',
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

function exigir(condicion, mensaje) {
    if (!condicion) {
        throw new Error(mensaje);
    }
}

function ejecutar(caso) {
    const carpetaTemporal = mkdtempSync(join(tmpdir(), 'sortx-test-'));
    const entrada = join(carpetaTemporal, 'entrada.txt');
    const salida  = join(carpetaTemporal, 'salida.txt');

    try {
        if (caso.entrada !== undefined) {
            writeFileSync(entrada, caso.entrada, 'utf8');
        }

        const argumentos = caso.argumentos({entrada, salida});
        const proceso = spawnSync(process.execPath, [programa, ...argumentos], {
            encoding: 'utf8',
        });

        const resultado = {
            codigo: proceso.status ?? 1,
            salida: `${proceso.stdout ?? ''}${proceso.stderr ?? ''}`,
        };

        if (caso.esperado !== undefined) {
            exigir(resultado.codigo === 0, `se esperaba código 0 y se obtuvo ${resultado.codigo}\n${resultado.salida}`);
            const contenido = existsSync(salida) ? readFileSync(salida, 'utf8') : '<no se creó el archivo>';
            exigir(
                contenido === caso.esperado,
                `el contenido de salida no coincide con el esperado\nEsperado:\n${caso.esperado}\nObtenido:\n${contenido}`,
            );
        }

        caso.verificar?.(resultado);
    } finally {
        rmSync(carpetaTemporal, {recursive: true, force: true});
    }
}

let aprobados = 0;
for (const caso of casos) {
    try {
        ejecutar(caso);
        aprobados += 1;
        console.log(`OK  ${caso.nombre}`);
    } catch (error) {
        console.error(`FAIL ${caso.nombre}\n     ${error.message}`);
    }
}

console.log(`\nResultado: ${aprobados}/${casos.length} casos aprobados`);
process.exitCode = aprobados === casos.length ? 0 : 1;
