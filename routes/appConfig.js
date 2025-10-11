const express = require("express");
const { AppConfig } = require("../models/AppConfig"); // Importar directamente
const router = express.Router();

// ✅ GET configuración pública
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

module.exports = router;
