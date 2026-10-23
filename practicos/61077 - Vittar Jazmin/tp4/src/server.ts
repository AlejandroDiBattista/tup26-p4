import express from "express";
import { count } from "drizzle-orm";
import { db, client } from "./db/index.js";
import { clientes, actividades } from "./db/schema.js";

const app = express();
const PORT = 3000;

app.use(express.json());

app.get("/api/estado", async (_req, res) => {
    try {
        const [totalClientes] = await db
            .select({ total: count() })
            .from(clientes);

        const [totalActividades] = await db
            .select({ total: count() })
            .from(actividades);

        res.json({
            mensaje: "MiniCRM funcionando",
            baseDeDatos: "conectada",
            clientes: totalClientes.total,
            actividades: totalActividades.total,
        });
    } catch (error) {
        console.error("Error al consultar la base de datos:", error);
        res.status(500).json({
            error: "No se pudo consultar la base de datos",
        });
    }
});

app.listen(PORT, () => {
    console.log(`MiniCRM escuchando en http://localhost:${PORT}`);
});

process.on("SIGINT", async () => {
    await client.close();
    process.exit(0);
});
