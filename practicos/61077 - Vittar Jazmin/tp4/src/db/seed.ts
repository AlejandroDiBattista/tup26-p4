import { and, eq } from "drizzle-orm";
import { db } from "./index.js";
import { actividades, clientes } from "./schema.js";

// datos de prueba: cada cliente tiene sus datos y una lista de actividades
const datosIniciales = [
    {
        nombre: "Lucía",
        apellido: "Fernández",
        email: "lucia.fernandez@example.com",
        domicilio: "San Martín 120",
        localidad: "Yerba Buena",
        telefono: "3814001001",
        actividades: [
            { descripcion: "Llamar para presentar los servicios", fechaCompromiso: "2026-10-24" },
            { descripcion: "Enviar propuesta comercial", fechaCompromiso: "2026-10-20", fechaFinalizacion: "2026-10-20" },
        ],
    },
    {
        nombre: "Mateo",
        apellido: "Gómez",
        email: "mateo.gomez@example.com",
        domicilio: "Belgrano 245",
        localidad: "San Miguel de Tucumán",
        telefono: "3814001002",
        actividades: [
            { descripcion: "Coordinar una reunión", fechaCompromiso: "2026-10-25" },
            { descripcion: "Confirmar datos de contacto", fechaCompromiso: "2026-10-21", fechaFinalizacion: "2026-10-21" },
        ],
    },
    {
        nombre: "Valentina",
        apellido: "López",
        email: "valentina.lopez@example.com",
        domicilio: "Rivadavia 350",
        localidad: "Tafí Viejo",
        telefono: "3814001003",
        actividades: [
            { descripcion: "Preparar presupuesto", fechaCompromiso: "2026-10-26" },
            { descripcion: "Contactar al cliente", fechaCompromiso: "2026-10-19", fechaFinalizacion: "2026-10-19" },
        ],
    },
    {
        nombre: "Santiago",
        apellido: "Martínez",
        email: "santiago.martinez@example.com",
        domicilio: "Maipú 480",
        localidad: "Yerba Buena",
        telefono: "3814001004",
        actividades: [
            { descripcion: "Enviar catálogo actualizado", fechaCompromiso: "2026-10-27" },
            { descripcion: "Registrar consulta inicial", fechaCompromiso: "2026-10-22", fechaFinalizacion: "2026-10-22" },
        ],
    },
    {
        nombre: "Camila",
        apellido: "Díaz",
        email: "camila.diaz@example.com",
        domicilio: "Las Heras 560",
        localidad: "San Miguel de Tucumán",
        telefono: "3814001005",
        actividades: [
            { descripcion: "Consultar disponibilidad", fechaCompromiso: "2026-10-28" },
            { descripcion: "Enviar información solicitada", fechaCompromiso: "2026-10-18", fechaFinalizacion: "2026-10-18" },
        ],
    },
    {
        nombre: "Benjamín",
        apellido: "Torres",
        email: "benjamin.torres@example.com",
        domicilio: "Sarmiento 620",
        localidad: "Tafí Viejo",
        telefono: "3814001006",
        actividades: [
            { descripcion: "Agendar seguimiento", fechaCompromiso: "2026-10-29" },
            { descripcion: "Revisar necesidades del cliente", fechaCompromiso: "2026-10-20", fechaFinalizacion: "2026-10-20" },
        ],
    },
    {
        nombre: "Martina",
        apellido: "Ruiz",
        email: "martina.ruiz@example.com",
        domicilio: "Italia 715",
        localidad: "Yerba Buena",
        telefono: "3814001007",
        actividades: [
            { descripcion: "Preparar documentación", fechaCompromiso: "2026-10-30" },
            { descripcion: "Responder consulta por correo", fechaCompromiso: "2026-10-21", fechaFinalizacion: "2026-10-21" },
        ],
    },
    {
        nombre: "Joaquín",
        apellido: "Acosta",
        email: "joaquin.acosta@example.com",
        domicilio: "Alberdi 830",
        localidad: "San Miguel de Tucumán",
        telefono: "3814001008",
        actividades: [
            { descripcion: "Llamar para seguimiento", fechaCompromiso: "2026-10-31" },
            { descripcion: "Enviar condiciones del servicio", fechaCompromiso: "2026-10-22", fechaFinalizacion: "2026-10-22" },
        ],
    },
    {
        nombre: "Sofía",
        apellido: "Medina",
        email: "sofia.medina@example.com",
        domicilio: "Congreso 940",
        localidad: "Tafí Viejo",
        telefono: "3814001009",
        actividades: [
            { descripcion: "Confirmar próxima reunión", fechaCompromiso: "2026-11-01" },
            { descripcion: "Registrar solicitud recibida", fechaCompromiso: "2026-10-17", fechaFinalizacion: "2026-10-17" },
        ],
    },
    {
        nombre: "Tomás",
        apellido: "Herrera",
        email: "tomas.herrera@example.com",
        domicilio: "Jujuy 1050",
        localidad: "Yerba Buena",
        telefono: "3814001010",
        actividades: [
            { descripcion: "Preparar propuesta final", fechaCompromiso: "2026-11-02" },
            { descripcion: "Realizar primer contacto", fechaCompromiso: "2026-10-23", fechaFinalizacion: "2026-10-23" },
        ],
    },
];

// cargar los datos sin duplicarlos si se ejecuta el archivo más de una vez
async function cargarDatosIniciales() {
    for (const datos of datosIniciales) {
        // buscamos el cliente por su correo
        const [clienteExistente] = await db
            .select()
            .from(clientes)
            .where(eq(clientes.email, datos.email));

        let clienteId: number;

        if (clienteExistente) {
            // si ya existe, reutiliza su ID
            clienteId = clienteExistente.id;
        } else {
            // si no existe, inserta sus datos y recupera el ID generado
            const [nuevoCliente] = await db
                .insert(clientes)
                .values({
                    nombre: datos.nombre,
                    apellido: datos.apellido,
                    email: datos.email,
                    domicilio: datos.domicilio,
                    localidad: datos.localidad,
                    telefono: datos.telefono,
                })
                .returning();

            clienteId = nuevoCliente.id;
        }

        // Cargar las actividades de ese cliente sin repetirlas
        for (const datosActividad of datos.actividades) {
            const [actividadExistente] = await db
                .select()
                .from(actividades)
                .where(
                    and(
                        eq(actividades.clienteId, clienteId),
                        eq(actividades.descripcion, datosActividad.descripcion),
                    ),
                );

            if (!actividadExistente) {
                await db.insert(actividades).values({
                    clienteId,
                    descripcion: datosActividad.descripcion,
                    fechaCompromiso: datosActividad.fechaCompromiso,
                    // si tiene fecha de finalización, está completada; si no, queda pendiente
                    fechaFinalizacion: datosActividad.fechaFinalizacion ?? null,
                });
            }
        }
    }

    console.log("Datos iniciales cargados correctamente.");
}

// si ocurre un error, lo muestra y termina con código de salida de error
cargarDatosIniciales().catch((error) => {
    console.error("Error al cargar los datos iniciales:", error);
    process.exitCode = 1;
});
