import express from "express";
import { Clientes } from "./services/Clientes.js";
import clientesRoutes from "./routes/clientesRoutes.js";
import actividadesRoutes from "./routes/actividadesRoutes.js";

const app = express();
const PORT = 3000;

app.use(express.json());

app.get("/api/estado", async (_req, res) => {
    try {
        const totales = await Clientes.contarRegistros();

        res.json({
            mensaje: "MiniCRM funcionando",
            baseDeDatos: "conectada",
            ...totales,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "No se pudo consultar la base de datos" });
    }
});

app.use("/api/clientes", clientesRoutes);
app.use("/api/actividades", actividadesRoutes);

app.listen(PORT, () => {
    console.log(`MiniCRM escuchando en http://localhost:${PORT}`);
});