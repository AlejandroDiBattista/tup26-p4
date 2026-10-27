const express = require("express");

const router = express.Router();

const {
    obtenerProductos,
    obtenerProducto,
    crearProducto,
    actualizarProducto,
    eliminarProducto
} = require("../controllers/productos.controller");


// GET TODOS
router.get("/", obtenerProductos);

// GET POR ID
router.get("/:id", obtenerProducto);

// POST
router.post("/", crearProducto);

// PUT
router.put("/:id", actualizarProducto);

// DELETE
router.delete("/:id", eliminarProducto);


module.exports = router;