// controllers/appConfigController.js
const { response } = require("express");
const AppConfig = require("../models/AppConfig");

// Obtener configuración pública
const getPublicConfig = async (req, res = response) => {
  try {
    console.log("🔧 Solicitando configuración pública...");

    let config = await AppConfig.findOne();

    if (!config) {
      console.log("⚠️ No hay configuración, creando por defecto...");

      // Crear configuración por defecto
      config = await AppConfig.create({
        app_name: "Minimarket Digital",
        app_description: "Tu tienda de confianza",
        theme: "blue",
        whatsapp_number: "+5491112345678",
        business_hours: "Lun-Vie: 8:00 - 20:00",
        business_address: "Av. Principal 123",
        logo_url: null,
        initialinfo:
          "🌟 **Bienvenido a nuestro Minimarket Digital** 🌟\n\n¡Estamos encantados de tenerte aquí! En nuestro minimarket encontrarás productos de calidad, horario extendido y servicio personalizado.",
        show_initialinfo: true,
        currency: "USD",
        language: "es",
      });

      console.log("✅ Configuración por defecto creada");
    }

    console.log("✅ Configuración pública enviada:", config.app_name);

    res.json({
      ok: true,
      config: {
        id: config.id,
        app_name: config.app_name,
        app_description: config.app_description,
        theme: config.theme,
        currency: config.currency,
        language: config.language,
        logo_url: config.logo_url,
        whatsapp_number: config.whatsapp_number,
        business_hours: config.business_hours,
        business_address: config.business_address,
        initialinfo: config.initialinfo,
        show_initialinfo: config.show_initialinfo, // ✅ NUEVO CAMPO
        created_at: config.created_at,
        updated_at: config.updated_at,
      },
    });
  } catch (error) {
    console.error("❌ Error en getPublicConfig:", error);
    res.status(500).json({
      ok: false,
      msg: "Error interno del servidor al obtener la configuración",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// Obtener configuración completa (protegida)
const getAppConfig = async (req, res = response) => {
  try {
    const config = await AppConfig.findOne();

    if (!config) {
      return res.status(404).json({
        ok: false,
        msg: "Configuración no encontrada",
      });
    }

    res.json({
      ok: true,
      config,
    });
  } catch (error) {
    console.error("❌ Error en getAppConfig:", error);
    res.status(500).json({
      ok: false,
      msg: "Error interno del servidor",
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
      initialinfo,
      show_initialinfo, // ✅ NUEVO CAMPO
      currency,
      language,
    } = req.body;

    console.log("🔄 Actualizando configuración...", req.body);

    // Validar campos requeridos
    if (!app_name || !app_description || !theme) {
      return res.status(400).json({
        ok: false,
        msg: "Los campos app_name, app_description y theme son requeridos",
      });
    }

    let config = await AppConfig.findOne();

    if (config) {
      // Actualizar existente
      await config.update({
        app_name,
        app_description,
        theme,
        whatsapp_number: whatsapp_number || config.whatsapp_number,
        business_hours: business_hours || config.business_hours,
        business_address: business_address || config.business_address,
        logo_url: logo_url !== undefined ? logo_url : config.logo_url,
        initialinfo:
          initialinfo !== undefined ? initialinfo : config.initialinfo,
        show_initialinfo:
          show_initialinfo !== undefined
            ? show_initialinfo
            : config.show_initialinfo, // ✅ NUEVO CAMPO
        currency: currency || config.currency,
        language: language || config.language,
      });
    } else {
      // Crear nueva
      config = await AppConfig.create({
        app_name,
        app_description,
        theme,
        whatsapp_number,
        business_hours,
        business_address,
        logo_url,
        initialinfo:
          initialinfo ||
          "🌟 **Bienvenido a nuestro Minimarket Digital** 🌟\n\n¡Estamos encantados de tenerte aquí! En nuestro minimarket encontrarás productos de calidad, horario extendido y servicio personalizado.",
        show_initialinfo:
          show_initialinfo !== undefined ? show_initialinfo : true, // ✅ NUEVO CAMPO
        currency,
        language,
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
      msg: "Error interno del servidor al actualizar la configuración",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

module.exports = {
  getPublicConfig,
  getAppConfig,
  updateAppConfig,
};
