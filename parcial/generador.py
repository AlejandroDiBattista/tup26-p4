def generar_examen(semilla, maximo, cantidad):
    modulo = 2147483647
    multiplicador = 48271

    estado = semilla % modulo

    numeros = list(range(1, maximo + 1))

    for i in range(len(numeros) - 1, 0, -1):
        estado = (estado * multiplicador) % modulo
        j = estado % (i + 1)
        numeros[i], numeros[j] = numeros[j], numeros[i]

    return numeros[:cantidad]


if __name__ == "__main__":
    print(generar_examen(12345, 100, 10))
