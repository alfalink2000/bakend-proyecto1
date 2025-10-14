// controllers/appConfigController.js
const { response } = require("express");
const AppConfig = require("../models/AppConfig");

// Obtener configuración
const getAppConfig = async (req, res = response) => {
  try {
    console.log("🔧 Obteniendo configuración de la app...");

    let config = await AppConfig.findOne();

    if (!config) {
      console.log("📝 Creando configuración inicial...");
      config = await AppConfig.create({});
    }

    console.log("✅ Configuración obtenida:", config.app_name);

    res.status(200).json({
      ok: true,
      config,
    });
  } catch (error) {
    console.error("❌ Error en getAppConfig:", error);
    res.status(500).json({
      ok: false,
      msg: "Error al obtener la configuración",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// Actualizar configuración
const updateAppConfig = async (req, res = response) => {
  try {
    const {
      app_name,
      app_description,
      theme,
      whatsapp_number,
      business_hours,
      business_address,
      logo_url,
    } = req.body;

    console.log("🔄 Actualizando configuración...", req.body);

    let config = await AppConfig.findOne();

    if (config) {
      await config.update({
        app_name,
        app_description,
        theme,
        whatsapp_number,
        business_hours,
        business_address,
        logo_url,
      });
    } else {
      config = await AppConfig.create({
        app_name,
        app_description,
        theme,
        whatsapp_number,
        business_hours,
        business_address,
        logo_url,
      });
    }

    console.log("✅ Configuración actualizada exitosamente");

    res.status(200).json({
      ok: true,
      msg: "Configuración actualizada correctamente",
      config,
    });
  } catch (error) {
    console.error("❌ Error en updateAppConfig:", error);
    res.status(500).json({
      ok: false,
      msg: "Error al actualizar la configuración",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

module.exports = {
  getAppConfig,
  updateAppConfig,
};
