const prisma = require("../prisma/client");


// GET TODOS
const obtenerProductos = async (req, res) => {

    try {

        const productos = await prisma.producto.findMany();

        res.json(productos);

    } catch (error) {
       console.log(error.message);
       console.log(error);

        res.status(500).json({
            error: "Error al obtener productos"
        });

    }

};


// GET POR ID
const obtenerProducto = async (req, res) => {

    const { id } = req.params;

    try {

        const producto = await prisma.producto.findUnique({
            where: {
                id: Number(id)
            }
        });

        if (!producto) {
            return res.status(404).json({
                error: "Producto no encontrado"
            });
        }

        res.json(producto);

    } catch (error) {

        res.status(500).json({
            error: "Error al buscar producto"
        });

    }

};


// POST
const crearProducto = async (req, res) => {

    const { nombre, precio, categoria, stock } = req.body;

    try {

        const producto = await prisma.producto.create({
            data: {
                nombre,
                precio,
                categoria,
                stock
            }
        });

        res.status(201).json(producto);

    } catch (error) {

        res.status(500).json({
            error: "Error al crear producto"
        });

    }

};


// PUT
const actualizarProducto = async (req, res) => {

    const { id } = req.params;

    const { nombre, precio, categoria, stock } = req.body;

    try {

        const producto = await prisma.producto.update({
            where: {
                id: Number(id)
            },
            data: {
                nombre,
                precio,
                categoria,
                stock
            }
        });

        res.json(producto);

    } catch (error) {

        res.status(500).json({
            error: "Error al actualizar producto"
        });

    }

};


// DELETE
const eliminarProducto = async (req, res) => {

    const { id } = req.params;

    try {

        await prisma.producto.delete({
            where: {
                id: Number(id)
            }
        });

        res.json({
            mensaje: "Producto eliminado"
        });

    } catch (error) {

        res.status(500).json({
            error: "Error al eliminar producto"
        });

    }

};


module.exports = {
    obtenerProductos,
    obtenerProducto,
    crearProducto,
    actualizarProducto,
    eliminarProducto
};