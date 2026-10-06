export function parseCsv(contenido) {
    const normalizado = contenido.replace(/^\uFEFF/, '').replace(/\r\n?/g, '\n');
    const lineas = normalizado.split('\n');
    if (lineas.at(-1) === '') lineas.pop();
    if (lineas.length === 0 || (lineas.length === 1 && lineas[0] === '')) throw new Error('el archivo está vacío');

    const cabecera = lineas[0].split(',');
    if (cabecera.some(campo => campo === '')) throw new Error('la cabecera contiene campos vacíos');

    const filas = lineas.slice(1).map((linea, indice) => {
        const campos = linea.split(',');
        if (campos.length !== cabecera.length) throw new Error(`la fila ${indice + 2} tiene ${campos.length} campos; se esperaban ${cabecera.length}`);
        return campos;
    });
    return {cabecera, filas};
}

export function serializeCsv(cabecera, filas) {
    return `${[cabecera, ...filas].map(fila => fila.join(',')).join('\n')}\n`;
}

export function sortRows(filas, columna, ascendente = true) {
    const signo = ascendente ? 1 : -1;
    return filas.map((fila, indice) => ({fila, indice})).sort((a, b) => {
        const izquierda = a.fila[columna] ?? '';
        const derecha = b.fila[columna] ?? '';
        const numeroIzquierda = Number(izquierda);
        const numeroDerecha = Number(derecha);
        const ambosNumeros = izquierda.trim() !== '' && derecha.trim() !== '' && Number.isFinite(numeroIzquierda) && Number.isFinite(numeroDerecha);
        const comparacion = ambosNumeros ? numeroIzquierda - numeroDerecha : izquierda.localeCompare(derecha, 'es', {sensitivity: 'base', numeric: true});
        return comparacion === 0 ? a.indice - b.indice : comparacion * signo;
    }).map(({fila}) => fila);
}

