class ArbolBinario {
    constructor(valor = undefined, izquierdo = undefined, derecho = undefined) {
        this.valor = valor
        this.izquierdo = izquierdo
        this.derecho = derecho
    }

    insertar(valor) {
        function insertarEn(nodo) {
            if (!nodo) return new ArbolBinario(valor)
            nodo.insertar(valor)
            return nodo
        }

        if (this.valor === undefined) {
            this.valor = valor
        } else if (valor < this.valor) {
            this.izquierdo = insertarEn(this.izquierdo)
        } else if (valor > this.valor) {
            this.derecho = insertarEn(this.derecho)
        }

        return this
    }

    recorrer(callback) {
        if (this.valor === undefined) return

        this.izquierdo?.recorrer(callback)
        callback(this.valor)
        this.derecho?.recorrer(callback)
    }
}

// Ejemplo de uso
const arbol = new ArbolBinario()
arbol.insertar(8)
arbol.insertar(3)
arbol.insertar(10)
arbol.insertar(1)
arbol.insertar(6)

arbol.recorrer(valor => console.log(valor)) // Imprime: 1, 3, 6, 8, 10
