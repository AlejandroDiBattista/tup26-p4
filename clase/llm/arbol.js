// 이 파일은 재귀 방식으로 구현한 이진 탐색 트리입니다.
//
// 이진 탐색 트리의 규칙:
// - 왼쪽 하위 트리에는 현재 노드보다 작은 값이 저장됩니다.
// - 오른쪽 하위 트리에는 현재 노드보다 크거나 같은 값이 저장됩니다.
// - 각 하위 트리도 동일한 규칙을 따릅니다.

/**
 * 이진 탐색 트리의 노드를 나타냅니다.
 */
class Nodo {
  /**
   * 새 노드를 생성합니다.
   * @param {number} valor 노드에 저장할 숫자
   */
  constructor(valor) {
    /** @type {number} 노드에 저장된 값 */
    this.valor = valor;
    /** @type {Nodo|null} 왼쪽 자식 노드 */
    this.izquierdo = null;
    /** @type {Nodo|null} 오른쪽 자식 노드 */
    this.derecho = null;
  }
}

/**
 * 재귀 삽입과 재귀 중위 순회를 지원하는 이진 탐색 트리입니다.
 */
class ArbolBinario {
  /** 빈 이진 탐색 트리를 생성합니다. */
  constructor() {
    /** @type {Nodo|null} 트리의 루트 노드 */
    this.raiz = null;
  }

  /**
   * 값을 트리에 삽입합니다.
   * 삽입 위치를 찾는 과정은 재귀적으로 수행됩니다.
   * 중복 값은 오른쪽 하위 트리에 삽입됩니다.
   * @param {number} valor 삽입할 숫자
   */
  insertar(valor) {
    this.raiz = this._insertarRecursivo(this.raiz, valor);
  }

  /**
   * 주어진 하위 트리에 값을 재귀적으로 삽입하고 새 하위 트리의 루트를 반환합니다.
   * @param {Nodo|null} nodo 현재 방문 중인 노드
   * @param {number} valor 삽입할 숫자
   * @returns {Nodo} 삽입 후 하위 트리의 루트 노드
   * @private
   */
  _insertarRecursivo(nodo, valor) {
    // 빈 위치를 찾으면 새 노드를 만들어 재귀 호출을 종료합니다.
    if (nodo === null) {
      return new Nodo(valor);
    }

    // 값이 현재 노드보다 작으면 왼쪽 하위 트리에 삽입합니다.
    if (valor < nodo.valor) {
      nodo.izquierdo = this._insertarRecursivo(nodo.izquierdo, valor);
    } else {
      // 값이 같거나 크면 오른쪽 하위 트리에 삽입합니다.
      nodo.derecho = this._insertarRecursivo(nodo.derecho, valor);
    }

    // 현재 노드를 하위 트리의 루트로 유지합니다.
    return nodo;
  }

  /**
   * 트리를 중위 순회하여 값을 오름차순으로 콘솔에 출력합니다.
   * 순회 순서는 왼쪽 하위 트리, 현재 노드, 오른쪽 하위 트리입니다.
   * @param {Nodo|null} nodo 순회를 시작할 노드. 생략하면 루트부터 시작합니다.
   */
  recorrerEnOrden(nodo = this.raiz) {
    // 빈 하위 트리에 도달하면 해당 재귀 호출을 종료합니다.
    if (nodo === null) return;

    this.recorrerEnOrden(nodo.izquierdo);
    console.log(nodo.valor);
    this.recorrerEnOrden(nodo.derecho);
  }
}

// 사용 예시: 숫자들을 트리에 삽입한 뒤 중위 순회로 출력합니다.
const arbol = new ArbolBinario();
[8, 3, 10, 1, 6, 14, 4, 7, 13].forEach((numero) => arbol.insertar(numero));
arbol.recorrerEnOrden();
