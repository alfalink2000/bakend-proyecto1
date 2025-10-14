const express = require("express");
const router = express.Router();
const { validarJWT } = require("../middlewares/revalidar-jwt");

// ✅ IMPORTAR MODELO Y CONTROLADORES CORRECTAMENTE
const AppConfig = require("../models/AppConfig"); // ✅ AGREGAR ESTA LÍNEA
const {
  getAppConfig,
  updateAppConfig,
} = require("../controllers/appConfigController");

// ✅ RUTA PÚBLICA (para el cliente) - CORREGIDA
router.get("/public", async (req, res) => {
  try {
    console.log("🔧 Solicitando configuración pública...");
    console.log("🔍 AppConfig model:", !!AppConfig);

    // Verificar conexión a BD
    const { db } = require("../database/connection");
    await db.authenticate();
    console.log("✅ BD conectada");

    let config = await AppConfig.findOne();
    console.log("🔍 Config encontrada:", !!config);

    if (!config) {
      console.log("⚠️  No hay configuración, creando por defecto...");
      try {
        config = await AppConfig.create({
          app_name: "Minimarket Digital",
          app_description: "Tu tienda de confianza",
          theme: "blue",
          whatsapp_number: "+5491112345678",
          business_hours: "Lun-Vie: 8:00 - 20:00",
          business_address: "Av. Principal 123",
          logo_url: null,
          currency: "USD",
          language: "es",
        });
        console.log("✅ Configuración por defecto creada");
      } catch (createError) {
        console.error("❌ Error creando configuración:", createError);
        throw createError;
      }
    }

    console.log("✅ Configuración pública enviada:", config.app_name);

    res.json({
      ok: true,
      config: {
        app_name: config.app_name,
        app_description: config.app_description,
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
    console.error("❌ Error completo en /public:", error);
    console.error("❌ Stack:", error.stack);
    res.status(500).json({
      ok: false,
      msg: "Error interno del servidor",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

// ✅ RUTA PROTEGIDA PARA OBTENER CONFIGURACIÓN (admin)
router.get("/", validarJWT, getAppConfig);

// ✅ RUTA PARA ACTUALIZAR CONFIGURACIÓN
router.put("/", validarJWT, updateAppConfig);

module.exports = router;
