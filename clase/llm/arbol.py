"""재귀 방식으로 구현한 이진 탐색 트리입니다.

이진 탐색 트리의 규칙:
- 왼쪽 하위 트리에는 현재 노드보다 작은 값이 저장됩니다.
- 오른쪽 하위 트리에는 현재 노드보다 크거나 같은 값이 저장됩니다.
- 각 하위 트리도 동일한 규칙을 따릅니다.
"""


class Nodo:
    """이진 탐색 트리의 노드입니다."""

    def __init__(self, valor):
        """새 노드를 생성합니다.

        Args:
            valor: 노드에 저장할 값.
        """
        self.valor = valor
        self.izquierdo = None
        self.derecho = None


class ArbolBinario:
    """재귀 삽입과 재귀 중위 순회를 지원하는 이진 탐색 트리입니다."""

    def __init__(self):
        """빈 이진 탐색 트리를 생성합니다."""
        self.raiz = None

    def insertar(self, valor):
        """값을 트리에 재귀적으로 삽입합니다.

        중복 값은 오른쪽 하위 트리에 삽입됩니다.

        Args:
            valor: 트리에 삽입할 값.
        """
        self.raiz = self._insertar_recursivo(self.raiz, valor)

    def _insertar_recursivo(self, nodo, valor):
        """값을 하위 트리에 재귀적으로 삽입하고 루트를 반환합니다.

        Args:
            nodo: 현재 방문 중인 노드 또는 None.
            valor: 삽입할 값.

        Returns:
            삽입 후 하위 트리의 루트 노드.
        """
        # 빈 위치에 도달하면 새 노드를 만들어 재귀를 종료합니다.
        if nodo is None:
            return Nodo(valor)

        # 현재 값보다 작으면 왼쪽 하위 트리로 이동합니다.
        if valor < nodo.valor:
            nodo.izquierdo = self._insertar_recursivo(nodo.izquierdo, valor)
        else:
            # 현재 값과 같거나 크면 오른쪽 하위 트리로 이동합니다.
            nodo.derecho = self._insertar_recursivo(nodo.derecho, valor)

        # 현재 노드를 하위 트리의 루트로 유지합니다.
        return nodo

    def recorrer_en_orden(self, nodo=None):
        """중위 순회로 트리의 값을 오름차순으로 출력합니다.

        순회 순서는 왼쪽 하위 트리, 현재 노드, 오른쪽 하위 트리입니다.
        nodo를 지정하지 않으면 루트에서 시작합니다.

        Args:
            nodo: 순회를 시작할 노드. 기본값은 트리의 루트입니다.
        """
        # 인자가 생략된 최상위 호출에서는 루트부터 순회를 시작합니다.
        if nodo is None:
            nodo = self.raiz

        # 빈 트리이거나 빈 하위 트리에 도달하면 재귀 호출을 종료합니다.
        if nodo is None:
            return

        self.recorrer_en_orden(nodo.izquierdo)
        print(nodo.valor)
        self.recorrer_en_orden(nodo.derecho)


if __name__ == "__main__":
    # 사용 예시: 값을 삽입한 뒤 중위 순회로 출력합니다.
    arbol = ArbolBinario()
    for numero in [8, 3, 10, 1, 6, 14, 4, 7, 13]:
        arbol.insertar(numero)

    arbol.recorrer_en_orden()
