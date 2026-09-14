// Busca fragmentos en cualquier orden, sin distinguir acentos ni mayúsculas.
const normalizar = texto => String(texto ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()

export const filtrarAlumnos = (lista, consulta) => {
    const palabras = normalizar(consulta).split(/\s+/).filter(Boolean)

    return lista.filter(alumno => {
        const texto = normalizar([
            alumno.legajo, alumno.apellido, alumno.nombre,
            alumno.comision, alumno.github
        ].join(' '))

        return palabras.every(palabra => texto.includes(palabra))
    })
}

