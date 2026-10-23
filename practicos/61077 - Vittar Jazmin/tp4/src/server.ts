import express from "express";

const app = express();
const PORT = 3000;

app.use(express.json());

app.get("/api/estado", (_req, res) => {
    res.json({ mensaje: "MiniCRM funcionando" });
});

app.listen(PORT, () => {
    console.log(`MiniCRM escuchando en http://localhost:${PORT}`);
});
