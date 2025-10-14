const express = require("express");
const router = express.Router();
const { validarJWT } = require("../middlewares/revalidar-jwt");

const {
  getPublicConfig,
  getAppConfig,
  updateAppConfig,
} = require("../controllers/appConfigController");

// ✅ RUTA PÚBLICA (para el cliente)
router.get("/public", getPublicConfig);

// ✅ RUTAS PROTEGIDAS (para admin)
router.get("/", validarJWT, getAppConfig);
router.put("/", validarJWT, updateAppConfig);

module.exports = router;
