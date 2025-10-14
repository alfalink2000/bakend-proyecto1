const express = require("express");
const router = express.Router();
const { validarJWT } = require("../middlewares/revalidar-jwt");

// ✅ IMPORTAR CONTROLADOR CORRECTO
const {
  getAppConfig,
  updateAppConfig,
} = require("../controllers/appConfigController");

// ✅ RUTA PÚBLICA (para el cliente)
router.get("/public", async (req, res) => {
  try {
    console.log("🔧 Solicitando configuración pública...");

    let config = await AppConfig.findOne();

    if (!config) {
      console.log("⚠️  No hay configuración, creando por defecto...");
      config = await AppConfig.create({
        app_name: "Minimarket Digital",
        theme: "blue",
        currency: "USD",
        language: "es",
      });
    }

    res.json({
      ok: true,
      config: {
        app_name: config.app_name,
        theme: config.theme,
        currency: config.currency,
        language: config.language,
        logo_url: config.logo_url,
        whatsapp_number: config.whatsapp_number,
        business_hours: config.business_hours,
        business_address: config.business_address,
      },
    });
  } catch (error) {
    console.error("❌ Error en /public:", error);
    res.status(500).json({
      ok: false,
      msg: "Error interno del servidor",
      error: error.message,
    });
  }
});

// ✅ RUTA PROTEGIDA PARA OBTENER CONFIGURACIÓN (admin)
router.get("/", validarJWT, getAppConfig);

// ✅ ✅ ✅ AGREGAR ESTA RUTA FALTANTE ✅ ✅ ✅
router.put("/", validarJWT, updateAppConfig);

module.exports = router;
