import {useState} from 'react'
import {useApp, useInput} from 'ink'
import {filtrarAlumnos} from '../busqueda.js'

// Coordina búsqueda, selección, apertura de ficha y scroll.
export function useExploradorAlumnos(alumnos, rows) {
    const {exit} = useApp()
    const [busqueda, setBusqueda] = useState('')
    const resultados = filtrarAlumnos(alumnos, busqueda)
    const [seleccionado, setSeleccionado] = useState(0)
    const [inicio, setInicio] = useState(0)
    const [mostrarFicha, setMostrarFicha] = useState(false)

    useInput((input, key) => {
        if (mostrarFicha) {
            if (key.escape || key.return) setMostrarFicha(false)
            return
        }
        if (key.escape) {
            exit()
            return
        }
        // Escribir filtra; las flechas y Enter siguen controlando los resultados.
        let nuevaBusqueda = busqueda
        if (key.ctrl && input === 'u') {
            nuevaBusqueda = ''
        } else if (key.backspace || key.delete) {
            nuevaBusqueda = Array.from(busqueda).slice(0, -1).join('')
        } else if (!key.ctrl && !key.meta && !key.return && !key.tab &&
                   !key.upArrow && !key.downArrow && !key.leftArrow && !key.rightArrow) {
            nuevaBusqueda += input.replace(/[\x00-\x1f\x7f]/g, ' ')
        }

        if (nuevaBusqueda !== busqueda) {
            setBusqueda(nuevaBusqueda)
            setSeleccionado(0)
            setInicio(0)
            return
        }

        if (resultados.length === 0) return
        if (key.return) {
            setMostrarFicha(true)
            return
        }

        if (key.downArrow) {
            setSeleccionado(actual => Math.min(actual + 1, resultados.length - 1))
        }
        if (key.upArrow) {
            setSeleccionado(actual => Math.max(0, actual - 1))
        }
    })

    // Conservamos el inicio del listado mientras la selección siga visible.
    const filasVisibles = Math.max(1, rows - 11)
    let nuevoInicio = Math.min(inicio, Math.max(0, resultados.length - filasVisibles))

    if (seleccionado < nuevoInicio) {
        nuevoInicio = seleccionado
    } else if (seleccionado >= nuevoInicio + filasVisibles) {
        nuevoInicio = seleccionado - filasVisibles + 1
    }

    // También ajustamos la ventana si cambia el tamaño de la terminal.
    if (nuevoInicio !== inicio) setInicio(nuevoInicio)

    const visibles = resultados.slice(inicio, inicio + filasVisibles)

    return {
        busqueda,
        seleccionado,
        inicio,
        mostrarFicha,
        resultados,
        visibles
    }
}
