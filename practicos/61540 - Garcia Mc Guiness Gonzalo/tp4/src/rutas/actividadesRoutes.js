const express = require("express");
const controller = require("../controladores/actividadesController");
const { asyncHandler } = require("./asyncHandler");

const router = express.Router();

router.put("/:id", asyncHandler(controller.actualizar));
router.patch("/:id/completar", asyncHandler(controller.completar));
router.delete("/:id", asyncHandler(controller.eliminar));

module.exports = router;
