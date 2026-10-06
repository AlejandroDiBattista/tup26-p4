const fs = require("node:fs");
const path = require("node:path");

const directorio = __dirname;
const archivoEntrada = path.join(directorio, "resultado-1parcial.md");
const archivoSalida = path.join(directorio, "resultado-1parcial-notas.txt");

const registros = fs.readFileSync(archivoEntrada, "utf8").split(/\r?\n/);
const mejoresPorLegajo = new Map();

registros
    .filter((linea) => linea.trim() !== "")
    .forEach((linea, indice) => {
        const [legajo, valorOriginal] = linea.split(".");
        if (!/^\d+$/.test(legajo) || !/^\d+$/.test(valorOriginal ?? "")) {
            throw new Error(`Formato inválido en la línea ${indice + 1}: ${linea}`);
        }

        const valor = Number(valorOriginal);
        const resto = valor % 20;
        const nota = resto === 0 ? 10 : resto / 2;
        const intentos = resto === 0
            ? valor / 20
            : Math.floor(valor / 20) + 1;

        const anterior = mejoresPorLegajo.get(legajo);
        if (!anterior || nota > anterior.nota || (nota === anterior.nota && intentos < anterior.intentos)) {
            mejoresPorLegajo.set(legajo, { legajo, nota, intentos });
        }
    });

const resultados = [...mejoresPorLegajo.values()]
    .sort((a, b) => b.nota - a.nota || a.intentos - b.intentos || Number(a.legajo) - Number(b.legajo))
    .map(({ legajo, nota, intentos }) => {
        const resultado = nota >= 8 ? "🟢" : nota >= 5 ? "🟡" : "🔴";
        return `- ${legajo.padEnd(9)}${nota.toFixed(1).padStart(4)}    ${resultado}      ${String(intentos).padStart(2)}`;
    });

const salida = ["## Leg      Nota    Res    Intento", ...resultados].join("\n");
fs.writeFileSync(archivoSalida, `${salida}\n`);
console.log(`Se generaron ${resultados.length} legajos en ${archivoSalida}`);