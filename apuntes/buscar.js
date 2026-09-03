// Estructura de datos para almacenar y buscar elementos ordenados
// - Conflicto entre eficiencia de búsqueda y eficiencia de inserción
// - Dependencia del tamaño de los datos

class ListaBasica{
    constructor(){
        this.elementos = [];
    }

    agregar(elemento){
        // Insertar al final de la lista
        // O(1) 
        this.elementos.push(elemento);
    }

    buscar(elemento){
        // Búsqueda lineal para encontrar el índice del elemento en la lista
        // O(n) en el peor de los casos
        for(let i = 0; i < this.elementos.length; i++){
            if(this.elementos[i] === elemento){
                return i;
            }
        }
        return -1;
    }

    recorrer(){
        // Ordenar la lista antes de devolverla
        // O(n log(n)) debido a la ordenación
        return this.elementos.toSorted((a, b) => a - b);
    }
}

class ListaOrdenada {
    constructor(){
        this.elementos = [];
    }

    agregar(elemento){
        // Insertar el elemento en la posición correcta para mantener la lista ordenada
        // O(n) en el peor de los casos debido a la necesidad de desplazar elementos
        let index = this.buscar(elemento);
        if(index < 0){
            this.elementos.splice(~index, 0, elemento);
        }
    }

    buscar(elemento){
        // Busqueda binaria para encontrar el índice del elemento en la lista ordenada
        // O(log(n)) en lugar de O(n) como en la lista básica
        let izq = 0;
        let der = this.elementos.length - 1;
        while(izq <= der){
            let medio = Math.floor((izq + der) / 2);
            if(this.elementos[medio] === elemento){
                return medio;
            } else if(this.elementos[medio] < elemento){
                izq = medio + 1;
            } else {
                der = medio - 1;
            }
        }
        return ~der; // Devuelve el complemento a uno del índice donde debería insertarse el elemento
    }

    recorrer(){
        // La lista ya está ordenada, no es necesario ordenar de nuevo
        // O(n) para devolver la lista ordenada
        return this.elementos; // La lista ya está ordenada, no es necesario ordenar de nuevo
    }
}

class ArbolBinario{
    constructor(){
        this.raiz = null;
    }   
    agregar(elemento){
        // Función recursiva para agregar un nodo al árbol binario
        // O(log(n)) en promedio, O(n) en el peor de los casos (árbol desbalanceado)

        function agregarValor(nodo, valor){
            if(nodo === null) return {valor}; 
            if(valor < nodo.valor){
                nodo.izquierda = agregarValor(nodo.izquierda, valor);
            } else {
                nodo.derecha = agregarValor(nodo.derecha, valor);
            }
        }
        this.raiz = agregarValor(this.raiz, elemento);
    }

    buscar(elemento){
        raiz = this.raiz;
        // Función recursiva para buscar un nodo en el árbol binario
        // O(log(n)) en promedio, O(n) en el peor de los casos (árbol desbalanceado)

        function buscarValor(nodo, valor){
            if(nodo === null) return false;
            if(nodo.valor === valor) return true;
            if(valor < nodo.valor){
                return buscarValor(nodo.izquierda, valor);
            } else {
                return buscarValor(nodo.derecha, valor);
            }
        }
        return buscarValor(this.raiz, elemento);    
    }   

    recorrer(){
        // Función recursiva para recorrer el árbol en orden y devolver los elementos en una lista
        // O(n) para recorrer todos los nodos del árbol

        function recorrerEnOrden(nodo, lista){
            if(nodo !== null){
                recorrerEnOrden(nodo.izquierda, lista);
                lista.push(nodo.valor);
                recorrerEnOrden(nodo.derecha, lista);
            }
        }
        let lista = [];
        recorrerEnOrden(this.raiz, lista);
        return lista;
    }
}

// Generar tabla de verdad en n nivels usando recursión
function generarTablaVerdad(niveles){
    if(niveles <= 0) return [[]];
    const tablaAnterior = generarTablaVerdad(niveles - 1);
    const tablaActual = [];
    for(const fila of tablaAnterior){
        tablaActual.push([...fila, false]);
        tablaActual.push([...fila, true]);
    }
    return tablaActual;
}

// Función para imprimir la tabla de verdad en consola
function imprimirTablaVerdad(tabla){
    for(const fila of tabla){
        console.log(fila.map(valor => valor ? 1 : 0).join(' '));
    }
}

// Ejemplo de uso
const niveles = 5;
const tablaVerdad = generarTablaVerdad(niveles);
imprimirTablaVerdad(tablaVerdad);
// Resumen de eficiencia computacional
//                  Agregar        Buscar          recorrer
// - ListaBasica      O(1)           O(n)            O(n log(n))
// - ListaOrdenada    O(n)           O(log(n))       O(n)
// - ArbolBinario     O(log(n))      O(log(n))       O(n)

// == Eficiencia computacional
//  Para 1000 elementos:
//                  Agregar (para todos)    Buscar (x c/u)     recorrer (x c/u)
// - ListaBasica        1 k                   500                10 k
// - ListaOrdenada    510 k                    10                 1 k
// - ArbolBinario      10 k                    10                 1 k

// Para 10 k elementos:
//                  Agregar (para todos)    Buscar (x c/u)     recorrer (x c/u)
// - ListaBasica        10 k                   5 k               130 k
// - ListaOrdenada      50 k                  13                  10 k
// - ArbolBinario       13                    13                  10 k      

// Para 100 k elementos:
//                    Agregar (para todos)    Buscar (x c/u)     recorrer (x c/u)
// - ListaBasica       100 k             50 k                 1.700 k
// - ListaOrdenada   5.000 k             17                     100 k
// - ArbolBinario       17              17                      100 k

// == Uso de memoria para Number == 
//                  ListaBasica      ListaOrdenada      ArbolBinario
//       1          8 bytes             8 bytes           24 bytes  (8 + 8 + 8) por nodo (+ 16 bytes, 200%)
//   1.000          8 kbytes            8 kbytes          24 kbytes 
//  10.000         80 kbytes           80 kbytes         240 kbytes 
// 100.000        800 kbytes          800 kbytes       2.400 kbytes

// == Uso de memoria para String (100 caracteres) == 
//                  ListaBasica      ListaOrdenada      ArbolBinario
//       1        200 bytes             200 bytes        216 bytes (200 + 8 + 8) por nodo (+ 16 kbytes, 20%)
//   1.000        200 kbytes            200 kbytes       216 kbytes 
//  10.000          2 mbytes              2 mbytes       2.4 mbytes 
// 100.000         20 mbytes             20 mbytes        24 mbytes