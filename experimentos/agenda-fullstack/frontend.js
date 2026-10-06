/**
 * AGENDA — INTERFAZ
 *
 * Orden de lectura: estado → cliente REST → acciones → vistas → inicio.
 * Este código vive dentro de index.html: esta copia es solo para leer en clase.
 * La interfaz no conoce tablas SQL ni importa Drizzle.
 */

const { reactive, html } = window.Arrow;

// #region 1. Configuración y estado de la interfaz

const parametros = new URLSearchParams(location.search);
const URL_API = (parametros.get('api') || '/api').replace(/\/$/, '');
const ESPERA_BUSQUEDA_MS = 220;
const MAXIMO_DIRECCIONES = 20;

const TIPOS_DE_DIRECCION = [
  { valor: 'telefono', etiqueta: 'Teléfono' },
  { valor: 'celular', etiqueta: 'Celular' },
  { valor: 'email', etiqueta: 'Email' },
];

const estado = reactive({
  contactos: [],
  textoBusqueda: '',
  contactoOriginal: null,
  contactoEnEdicion: null,
  hayCambios: false,
  procesando: false,
  buscando: false,
  error: '',
  aviso: '',
  ultimaOperacion: null,
});

let siguienteClaveLocal = 0;
let ultimaBusqueda = 0;
let temporizadorBusqueda;

function crearContactoVacio() {
  return {
    nombre: '',
    apellido: '',
    domicilio: '',
    direcciones: [],
  };
}

function extraerDatosEditables(contacto) {
  // La API recibe datos del contacto, no claves de renderizado ni estado visual.
  return {
    nombre: contacto.nombre,
    apellido: contacto.apellido,
    domicilio: contacto.domicilio,
    direcciones: contacto.direcciones.map((direccion) => ({
      tipo: direccion.tipo,
      valor: direccion.valor,
    })),
  };
}

function mostrarContacto(contacto) {
  if (contacto === null) {
    estado.contactoOriginal = null;
    estado.contactoEnEdicion = null;
  } else {
    const datos = extraerDatosEditables(contacto);
    estado.contactoOriginal = { id: contacto.id, ...datos };
    estado.contactoEnEdicion = {
      id: contacto.id,
      ...datos,
      direcciones: datos.direcciones.map((direccion) => ({
        ...direccion,
        claveLocal: ++siguienteClaveLocal,
      })),
    };
  }

  estado.hayCambios = false;
}

function marcarCambios() {
  estado.hayCambios = true;
  estado.aviso = '';
}

function limpiarMensajes() {
  estado.error = '';
  estado.aviso = '';
}

function confirmarDescarte() {
  if (!estado.hayCambios) {
    return true;
  }

  return confirm('Hay cambios sin guardar. ¿Descartarlos?');
}

// #endregion

// #region 2. Cliente REST — un único lugar realiza fetch y procesa JSON

const apiContactos = {
  listar(textoBusqueda) {
    const consulta = encodeURIComponent(textoBusqueda.trim());
    return solicitarJson(`/contactos?q=${consulta}`, { registrar: false });
  },

  obtener(id) {
    return solicitarJson(`/contactos/${id}`);
  },

  crear(datos) {
    return solicitarJson('/contactos', { metodo: 'POST', cuerpo: datos });
  },

  actualizar(id, datos) {
    return solicitarJson(`/contactos/${id}`, { metodo: 'PUT', cuerpo: datos });
  },

  eliminar(id) {
    return solicitarJson(`/contactos/${id}`, { metodo: 'DELETE' });
  },
};

async function solicitarJson(ruta, { metodo = 'GET', cuerpo, registrar = true } = {}) {
  const opciones = {
    method: metodo,
    headers: { Accept: 'application/json' },
    cache: 'no-store',
  };

  if (cuerpo !== undefined) {
    opciones.headers['Content-Type'] = 'application/json';
    opciones.body = JSON.stringify(cuerpo);
  }

  let respuesta;

  try {
    respuesta = await fetch(URL_API + ruta, opciones);
  } catch {
    throw new Error('No se pudo conectar con la API. Comprobá que el servidor esté iniciado.');
  }

  const texto = await respuesta.text();
  let datos = null;

  try {
    // DELETE devuelve 204 y no contiene un documento JSON.
    if (texto !== '') {
      datos = JSON.parse(texto);
    }
  } catch {
    throw new Error('La API no devolvió JSON. Revisá la URL del servidor.');
  }

  if (registrar) {
    registrarOperacion(metodo, ruta, cuerpo, respuesta.status, datos);
  }

  if (!respuesta.ok) {
    throw new Error(datos?.error || `Error HTTP ${respuesta.status}`);
  }

  return datos;
}

function registrarOperacion(metodo, ruta, cuerpo, codigoHttp, datos) {
  estado.ultimaOperacion = {
    metodo,
    url: URL_API + ruta,
    cuerpo: cuerpo ?? null,
    codigoHttp,
    datos,
  };
}

// #endregion

// #region 3. Acciones del maestro — buscar, seleccionar y crear un borrador

async function cargarContactos(registrar = true) {
  const numeroBusqueda = ++ultimaBusqueda;
  const textoBusqueda = estado.textoBusqueda;
  estado.buscando = true;

  try {
    const contactosEncontrados = await apiContactos.listar(textoBusqueda);

    // Una búsqueda anterior puede responder después de la más reciente.
    if (numeroBusqueda !== ultimaBusqueda) {
      return;
    }

    estado.contactos = contactosEncontrados;

    if (registrar) {
      const consulta = encodeURIComponent(textoBusqueda.trim());
      registrarOperacion('GET', `/contactos?q=${consulta}`, null, 200, contactosEncontrados);
    }
  } catch (error) {
    if (numeroBusqueda === ultimaBusqueda) {
      estado.error = error.message;
    }
  } finally {
    if (numeroBusqueda === ultimaBusqueda) {
      estado.buscando = false;
    }
  }
}

function alEscribirBusqueda(evento) {
  estado.textoBusqueda = evento.target.value;
  estado.error = '';

  clearTimeout(temporizadorBusqueda);
  ultimaBusqueda++; // Invalida respuestas anteriores incluso durante la espera.
  temporizadorBusqueda = setTimeout(cargarContactos, ESPERA_BUSQUEDA_MS);
}

async function seleccionarContacto(id) {
  if (estado.procesando || estado.contactoEnEdicion?.id === id) {
    return;
  }

  if (!confirmarDescarte()) {
    return;
  }

  limpiarMensajes();
  estado.procesando = true;

  try {
    const contacto = await apiContactos.obtener(id);
    mostrarContacto(contacto);
  } catch (error) {
    estado.error = error.message;
  } finally {
    estado.procesando = false;
  }
}

function nuevoContacto() {
  if (estado.procesando || !confirmarDescarte()) {
    return;
  }

  limpiarMensajes();
  mostrarContacto(crearContactoVacio());
  requestAnimationFrame(() => document.querySelector('#nombre')?.focus());
}

// #endregion

// #region 4. Acciones del detalle — editar el borrador, guardar o eliminar

function actualizarCampoContacto(campo, valor) {
  estado.contactoEnEdicion[campo] = valor;
  marcarCambios();
}

function actualizarCampoDireccion(direccion, campo, valor) {
  direccion[campo] = valor;
  marcarCambios();
}

function agregarDireccion() {
  const contacto = estado.contactoEnEdicion;

  if (contacto.direcciones.length >= MAXIMO_DIRECCIONES) {
    return;
  }

  contacto.direcciones.push({
    claveLocal: ++siguienteClaveLocal,
    tipo: 'celular',
    valor: '',
  });

  marcarCambios();
}

function quitarDireccion(direccion) {
  const contacto = estado.contactoEnEdicion;

  contacto.direcciones = contacto.direcciones.filter((otraDireccion) => {
    return otraDireccion.claveLocal !== direccion.claveLocal;
  });

  marcarCambios();
}

function cancelarEdicion() {
  mostrarContacto(estado.contactoOriginal);
  limpiarMensajes();
}

async function guardarContacto(evento) {
  evento.preventDefault();

  if (estado.procesando) {
    return;
  }

  limpiarMensajes();
  estado.procesando = true;

  try {
    const contacto = estado.contactoEnEdicion;
    const datos = extraerDatosEditables(contacto);
    let contactoGuardado;

    if (contacto.id) {
      contactoGuardado = await apiContactos.actualizar(contacto.id, datos);
    } else {
      contactoGuardado = await apiContactos.crear(datos);
    }

    mostrarContacto(contactoGuardado);
    estado.aviso = 'Contacto y direcciones guardados.';

    // Refrescar el maestro sin tapar la traza didáctica del POST o PUT.
    await cargarContactos(false);
  } catch (error) {
    estado.error = error.message;
  } finally {
    estado.procesando = false;
  }
}

async function eliminarContacto() {
  const id = estado.contactoEnEdicion?.id;

  if (estado.procesando || !id) {
    return;
  }

  if (!confirm('¿Eliminar este contacto y todas sus direcciones?')) {
    return;
  }

  limpiarMensajes();
  estado.procesando = true;

  try {
    await apiContactos.eliminar(id);
    mostrarContacto(null);
    estado.aviso = 'Contacto eliminado.';
    await cargarContactos(false);
  } catch (error) {
    estado.error = error.message;
  } finally {
    estado.procesando = false;
  }
}

// #endregion

// #region 5. Vistas — componer plantillas pequeñas, sin consultas ni escrituras

// En Arrow, ${valor} se evalúa una vez. ${() => valor} sigue al estado reactivo.
// Las vistas del detalle leen el borrador vigente, no una copia capturada al crearlas.
function vistaAplicacion() {
  return html`<main class="page">
    <header class="header">
      <div>
        <span class="eyebrow">Demostración · maestro / detalle</span>
        <h1>Agenda de contactos</h1>
        <p class="muted">Una interfaz, una API y una relación uno a muchos.</p>
      </div>
      <span class="badge">Arrow.js → REST → Drizzle</span>
    </header>

    ${vistaMensajes()}

    <div class="workspace">
      ${vistaMaestro()}
      <section class="detail" aria-label="Detalle del contacto">
        ${vistaDetalle}
      </section>
    </div>

    ${vistaComunicacionRest()}

    <footer class="footer">
      <span>Frontend: Arrow.js · Backend: Express + Drizzle + SQLite</span>
      <span>Demo local, sin autenticación · Datos iniciales ficticios</span>
    </footer>
  </main>`;
}

function vistaMensajes() {
  return html`<div role="alert" class="error" hidden="${() => !estado.error}">
    ${() => estado.error}
  </div>
  <div role="status" class="notice" hidden="${() => !estado.aviso}">
    ${() => estado.aviso}
  </div>`;
}

function vistaMaestro() {
  return html`<aside class="master" aria-label="Listado de contactos">
    <div class="master-head">
      <div class="row">
        <h2>Contactos</h2>
        <button
          type="button"
          class="primary small"
          disabled="${() => estado.procesando}"
          @click="${nuevoContacto}"
        >+ Nuevo</button>
      </div>

      <label class="search">
        Buscar contactos
        <input
          type="search"
          maxlength="100"
          placeholder="Nombre, teléfono o email…"
          .value="${() => estado.textoBusqueda}"
          @input="${alEscribirBusqueda}"
        >
      </label>
      <div class="counter" role="status">${textoDelContador}</div>
    </div>

    <ul class="contact-list">${() => estado.contactos.map(vistaContacto)}</ul>
    <p class="empty" hidden="${() => estado.buscando || estado.contactos.length > 0}">
      No hay contactos para mostrar.
    </p>
  </aside>`;
}

function textoDelContador() {
  if (estado.buscando) {
    return 'Buscando…';
  }

  return `${estado.contactos.length} contactos encontrados`;
}

function vistaContacto(contacto) {
  const iniciales = (contacto.nombre[0] + contacto.apellido[0]).toUpperCase();
  const etiquetaCantidad = contacto.cantidadDirecciones === 1 ? 'dirección' : 'direcciones';
  const estaSeleccionado = () => estado.contactoEnEdicion?.id === contacto.id;

  return html`<li>
    <button
      type="button"
      class="${() => estaSeleccionado() ? 'contact selected' : 'contact'}"
      aria-pressed="${() => String(estaSeleccionado())}"
      disabled="${() => estado.procesando}"
      @click="${() => seleccionarContacto(contacto.id)}"
    >
      <span class="avatar" aria-hidden="true">${iniciales}</span>
      <span class="contact-copy">
        <strong>${contacto.apellido}, ${contacto.nombre}</strong>
        <small>${contacto.cantidadDirecciones} ${etiquetaCantidad}</small>
      </span>
    </button>
  </li>`.key(contacto.id);
}

function vistaDetalle() {
  if (estado.contactoEnEdicion === null) {
    return html`<div class="empty">
      <span class="eyebrow">Tu agenda</span>
      <h2>Seleccioná un contacto</h2>
      <p>O creá uno nuevo y agregá sus direcciones.</p>
      <button
        type="button"
        disabled="${() => estado.procesando}"
        @click="${nuevoContacto}"
      >Crear un contacto</button>
    </div>`;
  }

  return vistaFormulario();
}

function vistaFormulario() {
  return html`<form @submit="${guardarContacto}">
    ${vistaEncabezadoDetalle()}

    <fieldset disabled="${() => estado.procesando}">
      ${vistaDatosPersonales()}
      ${vistaDirecciones()}
      ${vistaAcciones()}
    </fieldset>
  </form>`;
}

function vistaEncabezadoDetalle() {
  function etiquetaDelContacto() {
    const id = estado.contactoEnEdicion?.id;
    return id ? `Contacto #${id}` : 'Nuevo contacto';
  }

  function tituloDelFormulario() {
    return estado.contactoEnEdicion?.id ? 'Detalle del contacto' : 'Crear contacto';
  }

  return html`<div class="detail-head row">
    <div>
      <span class="eyebrow">${etiquetaDelContacto}</span>
      <h2>${tituloDelFormulario}</h2>
      <p class="muted">Los cambios se envían al presionar Guardar.</p>
    </div>
    <span class="dirty">${() => estado.hayCambios ? 'Sin guardar' : ''}</span>
  </div>`;
}

function vistaDatosPersonales() {
  return html`<div class="fields">
    <label>
      Nombre
      <input
        id="nombre"
        name="nombre"
        required
        maxlength="80"
        autocomplete="given-name"
        .value="${() => estado.contactoEnEdicion?.nombre ?? ''}"
        @input="${(evento) => actualizarCampoContacto('nombre', evento.target.value)}"
      >
    </label>

    <label>
      Apellido
      <input
        name="apellido"
        required
        maxlength="80"
        autocomplete="family-name"
        .value="${() => estado.contactoEnEdicion?.apellido ?? ''}"
        @input="${(evento) => actualizarCampoContacto('apellido', evento.target.value)}"
      >
    </label>

    <label class="full">
      Domicilio <span class="muted">· opcional</span>
      <input
        name="domicilio"
        maxlength="200"
        autocomplete="street-address"
        placeholder="Calle, número y localidad"
        .value="${() => estado.contactoEnEdicion?.domicilio ?? ''}"
        @input="${(evento) => actualizarCampoContacto('domicilio', evento.target.value)}"
      >
    </label>
  </div>`;
}

function vistaDirecciones() {
  return html`<section class="addresses" aria-label="Direcciones del contacto">
    <div class="row">
      <div>
        <h3>Direcciones de contacto <span class="muted">1:N</span></h3>
        <p class="muted">Teléfonos, celulares y emails. Hasta 20 por contacto.</p>
      </div>
      <button
        type="button"
        class="small"
        disabled="${() => estado.contactoEnEdicion?.direcciones.length >= MAXIMO_DIRECCIONES}"
        @click="${agregarDireccion}"
      >+ Agregar</button>
    </div>

    ${() => (estado.contactoEnEdicion?.direcciones ?? []).map(vistaDireccion)}

    <p class="no-address" hidden="${() => estado.contactoEnEdicion?.direcciones.length > 0}">
      Sin direcciones. Podés guardar el contacto así o agregar una.
    </p>
  </section>`;
}

function vistaDireccion(direccion) {
  function sugerenciaDeValor() {
    return direccion.tipo === 'email' ? 'nombre@ejemplo.com' : 'Número de contacto';
  }

  function alCambiarTipo(evento) {
    actualizarCampoDireccion(direccion, 'tipo', evento.target.value);
  }

  function alCambiarValor(evento) {
    actualizarCampoDireccion(direccion, 'valor', evento.target.value);
  }

  return html`<div class="address-row">
    <label>
      Tipo
      <select aria-label="Tipo de dirección" @change="${alCambiarTipo}">
        ${TIPOS_DE_DIRECCION.map((tipo) => html`<option value="${tipo.valor}" selected="${() => direccion.tipo === tipo.valor}">
            ${tipo.etiqueta}
          </option>`)}
      </select>
    </label>

    <label>
      Valor
      <input
        aria-label="Valor de dirección"
        type="${() => direccion.tipo === 'email' ? 'email' : 'tel'}"
        placeholder="${sugerenciaDeValor}"
        required
        maxlength="254"
        .value="${() => direccion.valor}"
        @input="${alCambiarValor}"
      >
    </label>

    <button
      type="button"
      class="remove"
      aria-label="Quitar dirección"
      title="Quitar dirección"
      @click="${() => quitarDireccion(direccion)}"
    >×</button>
  </div>`.key(direccion.claveLocal);
}

function vistaAcciones() {
  return html`<div class="actions">
    <button type="button" class="danger" disabled="${() => !estado.contactoEnEdicion?.id}" @click="${eliminarContacto}">
      Eliminar
    </button>
    <button type="button" @click="${cancelarEdicion}">Cancelar</button>
    <button type="submit" class="primary">
      ${() => estado.procesando ? 'Guardando…' : 'Guardar'}
    </button>
  </div>`;
}

function vistaComunicacionRest() {
  return html`<details>
    <summary>Ver comunicación REST <span class="muted">· última operación</span></summary>
    <div class="trace">
      <section>
        <h3>Petición del navegador</h3>
        <pre>${textoDePeticion}</pre>
      </section>
      <section>
        <h3>Respuesta del servidor</h3>
        <pre>${textoDeRespuesta}</pre>
      </section>
    </div>
  </details>`;
}

function formatearJson(datos) {
  if (datos === null) {
    return '(sin cuerpo)';
  }

  return JSON.stringify(datos, null, 2);
}

function textoDePeticion() {
  const operacion = estado.ultimaOperacion;

  if (!operacion) {
    return 'Todavía no hay operaciones.';
  }

  return `${operacion.metodo} ${operacion.url}\n\n${formatearJson(operacion.cuerpo)}`;
}

function textoDeRespuesta() {
  const operacion = estado.ultimaOperacion;

  if (!operacion) {
    return '';
  }

  return `HTTP ${operacion.codigoHttp}\n\n${formatearJson(operacion.datos)}`;
}

// #endregion

// #region 6. Inicio

async function iniciarAgenda() {
  const contenedor = document.querySelector('#app');
  contenedor.replaceChildren();
  vistaAplicacion()(contenedor);

  if (location.protocol === 'file:') {
    estado.error = 'No abras el HTML con doble clic. Ejecutá npm start y abrí http://127.0.0.1:3000.';
    return;
  }

  await cargarContactos();

  if (estado.contactos.length > 0 && estado.contactoEnEdicion === null) {
    await seleccionarContacto(estado.contactos[0].id);
  }
}

window.addEventListener('beforeunload', (evento) => {
  if (estado.hayCambios) {
    evento.preventDefault();
    evento.returnValue = '';
  }
});

iniciarAgenda();

// #endregion
