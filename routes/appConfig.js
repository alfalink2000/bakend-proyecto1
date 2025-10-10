// routes/appConfig.js
const { Router } = require("express");
const { validarJWT } = require("../middlewares/revalidar-jwt");
const {
  getAppConfig,
  updateAppConfig,
} = require("../controllers/appConfigController");

const router = Router();

// Ruta pública para obtener configuración
router.get("/public", getAppConfig);

// Rutas protegidas (solo admin)
router.use(validarJWT);
router.get("/", getAppConfig);
router.put("/", updateAppConfig);

module.exports = router;
