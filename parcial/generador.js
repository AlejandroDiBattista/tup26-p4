function GenerarExamen(semilla, cantidad, maximo = 400) {
    const MULTIPLICADOR = 48271;
    const MODULO        = 2147483647;
    const SALTAR        = Date.now() >= Date.parse("2026-10-01T00:00:00-03:00") ? 99 : 33;

    const numeros = Array.from({ length: maximo }, (_, index) => index + 1);
    
    
    let estado = semilla % MODULO;
    for(let i = 0; i < SALTAR; i += 1) {
        estado = (estado * MULTIPLICADOR) % MODULO;  
    }
    
    // Algoritmo de Fisher-Yates para mezclar el array
    for (let i = numeros.length - 1; i > 0; i -= 1) {
        estado = (estado * MULTIPLICADOR) % MODULO;  
        const j = estado % (i + 1);
        [numeros[i], numeros[j]] = [numeros[j], numeros[i]];
    }

    return numeros.slice(0, cantidad);
}


function calcularSumaDeControl(codigo) {
    let suma = 0;
    for (let i = 0; i < codigo.length; i++) {
        suma += codigo.charCodeAt(i) * (i + 1);
    }
    return String(suma % 97).padStart(2, "0");
}


function ConvertirBase(numero, origen = 10, destino = 32) {
    if (Array.isArray(numero)) { numero = numero.join(""); }
    if (typeof numero !== "string") { numero = String(numero); }

    const baseOrigen  = BigInt(origen);
    const baseDestino = BigInt(destino);

    let resultado = 0n;
    for (const caracter of numero.toLowerCase()) {
        const valor = BigInt(parseInt(caracter, origen));
        resultado = resultado * baseOrigen + valor;
    }

    let salida = "";
    while (resultado > 0n) {
        const resto = resultado % baseDestino;
        resultado /= baseDestino;
        salida = resto.toString(destino) + salida;
    }

    return salida || "0";
}


// function probarConversion(origen="1234443123134234123130012301234") {
//     let convertido = "";

//     console.clear();
//     console.log("Pruebas de conversión: ");
//     console.log(`Número original: \n${origen} (base 10)`);
//     convertido = ConvertirBase(origen, 10, 32);
//     console.log(`10 -> 32 == ${convertido} (base 32) ${convertido.length}`); // Ejemplo de uso

//     convertido = ConvertirBase(convertido, 32, 2);
//     console.log(`32 ->  2 == ${convertido} (base 2) ${convertido.length}`); // Ejemplo de uso

//     convertido = ConvertirBase(convertido, 2, 7);
//     console.log(` 2 ->  7 == ${convertido} (base 7) ${convertido.length}`); // Ejemplo de uso

//     convertido = ConvertirBase(convertido, 7, 10);
//     console.log(` 7 -> 10 == ${convertido} (base 10) ${convertido.length}`); // Ejemplo de uso

//     console.log(`\n¿Coincide con el original? ${origen === convertido ? "Sí" : "No"}`);
// }
