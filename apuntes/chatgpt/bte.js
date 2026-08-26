import { readFile } from 'node:fs/promises';
const l = console.log

// const contenido = "banana banana anana"
let contenido = await readFile("./010.introduccion-javascript.html")
let lista = [...Buffer.from(contenido, "utf-8")]


function crearTokenIniciales(){
    let vocabulario = {}
    for(let i = 0; i < 256; i++){
        vocabulario[i] = [i]
    }
    return vocabulario
}

function contarPares(lista){
    let contador = {}
    for(let i = 0; i < lista.length - 1; i++){
        let a = lista[i], b = lista[i+1]
        let key = `${a} ${b}`
        contador[key] = (contador[key] ?? 0) + 1
    }
    return contador
}

function buscarMaximo(pares){
    let maximo = 2, key = null 
    for(let k in pares){
        if( pares[k] <= maximo) continue;
        maximo = pares[k]
        key = k
    }
    if(!key) return null

    return key.split(" ").map(Number)
}

function fusionar(lista, [a, b], proximo){
    let salida = []
    for(let i = 0; i < lista.length;){
        let reemplazar = i < lista.length - 1 && a == lista[i] && b == lista[i+1]
        salida.push(reemplazar ? proximo : lista[i])
        i += reemplazar ? 2 : 1
    }

    return salida
}

function generarTokens(lista, maximo = 258){
    let vocabulario = crearTokenIniciales()

    let pares  = contarPares(lista)
    let par = buscarMaximo(pares)

    while(par){
        let proximo = Object.keys(vocabulario).length
        if(proximo > maximo) break
        vocabulario[proximo] = par
        lista = fusionar(lista, par, proximo)
        pares  = contarPares(lista)
        par = buscarMaximo(pares)
    }
    return vocabulario
}

function codificar(lista, vocabulario){
    for(let id = 256; id < Object.keys(vocabulario).length; id++){
        let par = vocabulario[id]
        lista = fusionar(lista, par, id)
    }

    return lista
}

function decodificar(lista, vocabulario){
    for(let id = Object.keys(vocabulario).length - 1; id >= 256; id--){
        let [a, b] = vocabulario[id]
        let salida = []

        for(let valor of lista){
            if(valor === id){
                salida.push(a, b)
            } else {
                salida.push(valor)
            }
        }

        lista = salida
    }

    return lista
}

let vocabulario = generarTokens(lista, 14000)
let codificado = codificar(lista, vocabulario)
l(`Informe:
    -        Inicialmente habia ${contenido.length} carateres
    -            Se codifico en ${codificado.length} tokens  (${(100*codificado.length/contenido.length | 0)}%)
    - Usando un vocabularios de ${Object.keys(vocabulario).length-255} 
    `)
let original = decodificar(codificado, vocabulario)
for(let k in Object.keys(vocabulario)){
    // l(k, Buffer.from(decodificar(vocabulario[k], vocabulario)).toString("utf-8"))
}
// l(Buffer.from(original).toString("utf-8"))



