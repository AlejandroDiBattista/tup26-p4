const express = require("express");
const controller = require("../controladores/clientesController");
const { asyncHandler } = require("./asyncHandler");

const router = express.Router();

router.get("/", asyncHandler(controller.listar));
router.post("/", asyncHandler(controller.crear));
router.get("/:id", asyncHandler(controller.obtener));
router.put("/:id", asyncHandler(controller.actualizar));
router.delete("/:id", asyncHandler(controller.eliminar));
router.get("/:id/actividades", asyncHandler(controller.listarActividades));
router.post("/:id/actividades", asyncHandler(controller.crearActividad));

module.exports = router;
