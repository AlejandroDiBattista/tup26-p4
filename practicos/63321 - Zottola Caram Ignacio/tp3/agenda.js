import { html, reactive, watch } from 'https://esm.sh/@arrow-js/core'
import alumnosJson from './alumnos.json' with { type: 'json' }

const STORAGE_KEY = 'agenda-alumnos'
const dialogo = document.getElementById('dialogo')

// ----- Estado -----
const estado = reactive({
  alumnos: cargarAlumnos(),
  busqueda: '',
  abierto: false,
  modo: 'agregar',
  form: formVacio()
})

// ----- Persistencia -----
function cargarAlumnos() {
  const guardado = localStorage.getItem(STORAGE_KEY)
  if (guardado) {
    try {
      return JSON.parse(guardado)
    } catch {
      // si está corrupto, seguimos con el JSON
    }
  }
  const iniciales = structuredClone(alumnosJson)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(iniciales))
  return iniciales
}

function persistir() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(estado.alumnos))
}

// ----- Utilidades -----
function formVacio() {
  return {
    id: null,
    apellido: '',
    nombre: '',
    legajo: '',
    comision: '',
    telefono: '',
    github: ''
  }
}

function normalizar(texto) {
  return String(texto ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
}

function siguienteId() {
  return estado.alumnos.reduce((max, a) => Math.max(max, Number(a.id) || 0), 0) + 1
}

function alumnosVisibles() {
  const q = normalizar(estado.busqueda)
  return estado.alumnos
    .filter(a => {
      if (!q) return true
      const texto = normalizar(
        `${a.apellido} ${a.nombre} ${a.legajo} ${a.comision} ${a.telefono} ${a.github}`
      )
      return texto.includes(q)
    })
    .sort((a, b) => {
      if (a.favorito !== b.favorito) return a.favorito ? -1 : 1
      const porApellido = normalizar(a.apellido).localeCompare(normalizar(b.apellido))
      if (porApellido !== 0) return porApellido
      return normalizar(a.nombre).localeCompare(normalizar(b.nombre))
    })
}

// ----- Acciones -----
function toggleFavorito(alumno, e) {
  if (e) e.stopPropagation()
  alumno.favorito = !alumno.favorito
  persistir()
}

function abrirAgregar() {
  estado.modo = 'agregar'
  estado.form = formVacio()
  estado.abierto = true
}

function abrirEditar(alumno) {
  estado.modo = 'editar'
  estado.form = {
    id: alumno.id,
    apellido: alumno.apellido,
    nombre: alumno.nombre,
    legajo: alumno.legajo,
    comision: alumno.comision,
    telefono: alumno.telefono,
    github: alumno.github
  }
  estado.abierto = true
}

function cerrarDialogo() {
  estado.abierto = false
  if (dialogo.open) dialogo.close()
}

function manejarTeclado(alumno, e) {
  if (e.target.closest('.fav')) return
  if (e.key === 'Enter') {
    e.preventDefault()
    abrirEditar(alumno)
  } else if (e.key === ' ') {
    e.preventDefault()
    toggleFavorito(alumno)
  }
}

function guardar(e) {
  e.preventDefault()
  const form = e.currentTarget
  if (!form.checkValidity()) {
    form.reportValidity()
    return
  }

  const datos = {
    apellido: estado.form.apellido.trim(),
    nombre: estado.form.nombre.trim(),
    legajo: estado.form.legajo.trim(),
    comision: estado.form.comision.trim(),
    telefono: estado.form.telefono.trim(),
    github: estado.form.github.trim()
  }

  if (estado.modo === 'agregar') {
    estado.alumnos.push({
      id: siguienteId(),
      ...datos,
      favorito: false
    })
  } else {
    const alumno = estado.alumnos.find(a => a.id === estado.form.id)
    if (alumno) Object.assign(alumno, datos)
  }

  persistir()
  cerrarDialogo()
}

function eliminar() {
  estado.alumnos = estado.alumnos.filter(a => a.id !== estado.form.id)
  persistir()
  cerrarDialogo()
}

// ----- Vista -----
function tarjeta(alumno) {
  return html`
    <li>
      <article class="tarjeta" tabindex="0"
        @click="${() => abrirEditar(alumno)}"
        @keydown="${e => manejarTeclado(alumno, e)}">
        <button class="fav" type="button"
          aria-pressed="${() => alumno.favorito ? 'true' : 'false'}"
          aria-label="${() => alumno.favorito ? 'Quitar de favoritos' : 'Marcar como favorito'}"
          @click="${e => toggleFavorito(alumno, e)}">
          ${() => alumno.favorito ? '★' : '☆'}
        </button>
        <h2>${() => alumno.apellido} <span>${() => alumno.nombre}</span></h2>
        <address>
          <span class="tel">${() => alumno.telefono}</span>
          <a class="gh" href="${() => 'https://github.com/' + alumno.github}"
            target="_blank" rel="noopener"
            @click="${e => e.stopPropagation()}">@${() => alumno.github}</a>
        </address>
        <footer>${() => alumno.comision} · ${() => alumno.legajo}</footer>
      </article>
    </li>
  `.key(alumno.id)
}

html`
  <header>
    <h1>Agenda</h1>
    <div class="acciones">
      <input class="busqueda" type="search" placeholder="Buscar alumno..."
        aria-label="Buscar alumnos"
        .value="${() => estado.busqueda}"
        @input="${e => { estado.busqueda = e.target.value }}">
      <button class="btn btn-primary" type="button" @click="${abrirAgregar}">+ Agregar</button>
    </div>
  </header>

  <section aria-label="Listado de alumnos">
    <ul class="lista">
      ${() => {
        const lista = alumnosVisibles()
        if (!lista.length) {
          return html`<li class="vacio">No hay alumnos para mostrar</li>`
        }
        return lista.map(tarjeta)
      }}
    </ul>
  </section>

  <footer>
    <p>${() => estado.alumnos.length} alumnos · datos guardados en el navegador</p>
  </footer>
`(document.getElementById('app'))

html`
  <form @submit="${guardar}">
    <h2>${() => estado.modo === 'agregar' ? 'Agregar alumno' : 'Editar alumno'}</h2>
    <p class="subtitulo">${() => estado.modo === 'agregar'
      ? 'Completá los datos del nuevo alumno.'
      : 'Actualizá los datos del alumno.'}</p>

    <div class="campos">
      <label for="campo-apellido">
        Apellido
        <input id="campo-apellido" name="apellido" type="text" required autocomplete="family-name"
          .value="${() => estado.form.apellido}"
          @input="${e => { estado.form.apellido = e.target.value }}">
      </label>
      <label for="campo-nombre">
        Nombre
        <input id="campo-nombre" name="nombre" type="text" required autocomplete="given-name"
          .value="${() => estado.form.nombre}"
          @input="${e => { estado.form.nombre = e.target.value }}">
      </label>
      <label for="campo-legajo">
        Legajo
        <input id="campo-legajo" name="legajo" type="text" required inputmode="numeric"
          .value="${() => estado.form.legajo}"
          @input="${e => { estado.form.legajo = e.target.value }}">
      </label>
      <label for="campo-comision">
        Comisión
        <input id="campo-comision" name="comision" type="text" required
          .value="${() => estado.form.comision}"
          @input="${e => { estado.form.comision = e.target.value }}">
      </label>
      <label for="campo-telefono">
        Teléfono
        <input id="campo-telefono" name="telefono" type="tel" required autocomplete="tel"
          .value="${() => estado.form.telefono}"
          @input="${e => { estado.form.telefono = e.target.value }}">
      </label>
      <label for="campo-github">
        GitHub
        <input id="campo-github" name="github" type="text" required autocomplete="username"
          .value="${() => estado.form.github}"
          @input="${e => { estado.form.github = e.target.value }}">
      </label>
    </div>

    <div class="botones">
      ${() => estado.modo === 'editar'
        ? html`<button class="btn btn-danger" type="button" @click="${eliminar}">Eliminar</button><span class="espacio"></span>`
        : html`<span class="espacio"></span>`}
      <button class="btn btn-primary" type="submit">Guardar</button>
      <button class="btn btn-ghost" type="button" @click="${cerrarDialogo}">Cancelar</button>
    </div>
  </form>
`(dialogo)

watch(() => {
  if (estado.abierto && !dialogo.open) dialogo.showModal()
  else if (!estado.abierto && dialogo.open) dialogo.close()
})

dialogo.addEventListener('close', () => { estado.abierto = false })
