#!/usr/bin/env node

import {spawnSync} from 'node:child_process';
import { existsSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import {tmpdir} from 'node:os';
import {dirname, join} from 'node:path';
import {fileURLToPath} from 'node:url';

const carpetaTp = dirname(fileURLToPath(import.meta.url));
const legajoSolicitado = process.argv[2];
const carpetaPracticos = join(carpetaTp, '..', 'practicos');

function buscarAlumno(legajo) {
    const carpeta = readdirSync(carpetaPracticos, {withFileTypes: true})
        .find(entrada => entrada.isDirectory() && entrada.name.startsWith(`${legajo} - `));

    return carpeta === undefined
        ? undefined
        : {
            legajo,
            nombre: carpeta.name,
            programa: join(carpetaPracticos, carpeta.name, 'tp1', 'sortx.js'),
        };
}

function buscarTodosLosAlumnos() {
    return readdirSync(carpetaPracticos, {withFileTypes: true})
        .filter(entrada => entrada.isDirectory() && /^\d+\s+-\s+/.test(entrada.name))
        .map(entrada => {
            const legajo = entrada.name.match(/^(\d+)/)[1];
            return {
                legajo,
                nombre: entrada.name,
                programa: join(carpetaPracticos, entrada.name, 'tp1', 'sortx.js'),
            };
        })
        .sort((a, b) => Number(a.legajo) - Number(b.legajo));
}

function programaNoPresentado(rutaPrograma) {
    const contenido = readFileSync(rutaPrograma, 'utf8').trimEnd();
    const cantidadLineas = contenido === '' ? 0 : contenido.split(/\r?\n/).length;
    return cantidadLineas < 50;
}

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

const coloresEstado = {
    pendiente: '⚫️',
    error: '🔴',
    falla: '🟡',
    presentado: '🟢',
};

function exigir(condicion, mensaje) {
    if (!condicion) {
        throw new Error(mensaje);
    }
}

function ejecutar(caso, programa) {
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

function clasificarPrograma(programa) {
    if (!existsSync(programa) || programaNoPresentado(programa)) {
        return 'pendiente';
    }

    const pruebaEjecucion = spawnSync(process.execPath, [programa, '--help'], {
        encoding: 'utf8',
    });

    if (pruebaEjecucion.error !== undefined || pruebaEjecucion.status !== 0) {
        return 'error';
    }

    let aprobados = 0;
    for (const caso of casos) {
        try {
            ejecutar(caso, programa);
            aprobados += 1;
        } catch {
            // El caso fallido se refleja en el estado general "falla".
        }
    }

    return aprobados === casos.length ? 'presentado' : 'falla';
}

const alumnos = legajoSolicitado === undefined
    ? buscarTodosLosAlumnos()
    : [buscarAlumno(legajoSolicitado)].filter(Boolean);

if (alumnos.length === 0) {
    console.error(`No se encontró un práctico para el legajo ${legajoSolicitado}`);
    process.exit(1);
}

console.log('# Resultados TP1\n');
for (const alumno of alumnos) {
    const estado = clasificarPrograma(alumno.programa);
    console.log(`- ${alumno.legajo}: ${coloresEstado[estado]} ${estado}`);
}
