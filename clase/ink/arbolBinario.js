// Árbol binario de búsqueda inmutable.
const vacio = null

function insertar(arbol, valor) {
    function insertarEn(nodo) {
        if (nodo === null) {
            return { valor, izquierdo: vacio, derecho: vacio }
        }

        if (valor < nodo.valor) {
            return {
                ...nodo,
                izquierdo: insertarEn(nodo.izquierdo),
            }
        }

        if (valor > nodo.valor) {
            return {
                ...nodo,
                derecho: insertarEn(nodo.derecho),
            }
        }

        return nodo // No se insertan valores duplicados.
    }

    return insertarEn(arbol)
}

function recorrer(arbol, callback) {
    if (arbol === null) return

    recorrer(arbol.izquierdo, callback)
    callback(arbol.valor)
    recorrer(arbol.derecho, callback)
}

export { vacio, insertar, recorrer }
