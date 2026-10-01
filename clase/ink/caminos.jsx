import React, {useState} from 'react'
import {render, Box, Text, useInput} from 'ink'
import {TextInput} from '@inkjs/ui'

function caminosMinimos(n, m) {
    const movimientos = n + m - 2
    const k = Math.min(n - 1, m - 1)
    let total = 1

    for (let i = 1; i <= k; i++) {
        total = (total * (movimientos - k + i)) / i
    }

    return Math.round(total)
}

function App() {
    const [n, setN] = useState('')
    const [m, setM] = useState('')
    const [resultado, setResultado] = useState(null)
    const [error, setError] = useState('')

    useInput((input, key) => {
        if (!key.return) return

        const filas = Number(n)
        const columnas = Number(m)

        if (!n || !m || !Number.isSafeInteger(filas) || !Number.isSafeInteger(columnas) || filas < 1 || columnas < 1) {
            setError('Ingresá dos números enteros positivos.')
            setResultado(null)
            return
        }

        setError('')
        setResultado(caminosMinimos(filas, columnas))
    })

    return (
        <Box flexDirection="column" gap={1}>
            <Text bold>Calculadora de caminos mínimos</Text>
            <Text>Movimientos permitidos: derecha y abajo.</Text>
            <Box gap={1}>
                <Text>Filas (n):</Text>
                <TextInput value={n} onChange={setN} />
            </Box>
            <Box gap={1}>
                <Text>Columnas (m):</Text>
                <TextInput value={m} onChange={setM} />
            </Box>
            <Text>Presioná Enter para calcular.</Text>
            {error ? <Text color="red">{error}</Text> : null}
            {resultado !== null ? <Text color="green">Caminos mínimos: {resultado}</Text> : null}
        </Box>
    )
}

render(<App />)
