// controllers/appConfigController.js - MEJORADO
const { response } = require("express");
const AppConfig = require("../models/AppConfig");

// Actualizar configuración - VERSIÓN MEJORADA
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

    // ✅ VALIDAR CAMPOS REQUERIDOS
    if (!app_name || !app_description || !theme) {
      return res.status(400).json({
        ok: false,
        msg: "Los campos app_name, app_description y theme son requeridos",
      });
    }

    let config = await AppConfig.findOne();

    if (config) {
      // ✅ ACTUALIZAR EXISTENTE CON MEJOR MANEJO DE ERRORES
      try {
        await config.update({
          app_name: app_name || config.app_name,
          app_description: app_description || config.app_description,
          theme: theme || config.theme,
          whatsapp_number: whatsapp_number || config.whatsapp_number,
          business_hours: business_hours || config.business_hours,
          business_address: business_address || config.business_address,
          logo_url: logo_url !== undefined ? logo_url : config.logo_url,
        });

        // ✅ RECARGAR EL REGISTRO ACTUALIZADO
        await config.reload();
      } catch (updateError) {
        console.error("❌ Error en update:", updateError);
        return res.status(400).json({
          ok: false,
          msg: "Error al actualizar la configuración",
          error:
            process.env.NODE_ENV === "development"
              ? updateError.message
              : undefined,
        });
      }
    } else {
      // ✅ CREAR NUEVO
      try {
        config = await AppConfig.create({
          app_name,
          app_description,
          theme,
          whatsapp_number,
          business_hours,
          business_address,
          logo_url,
        });
      } catch (createError) {
        console.error("❌ Error en create:", createError);
        return res.status(400).json({
          ok: false,
          msg: "Error al crear la configuración",
          error:
            process.env.NODE_ENV === "development"
              ? createError.message
              : undefined,
        });
      }
    }

    console.log("✅ Configuración actualizada exitosamente:", {
      id: config.id,
      app_name: config.app_name,
      theme: config.theme,
    });

    res.status(200).json({
      ok: true,
      msg: "Configuración actualizada correctamente",
      config: {
        id: config.id,
        app_name: config.app_name,
        app_description: config.app_description,
        theme: config.theme,
        whatsapp_number: config.whatsapp_number,
        business_hours: config.business_hours,
        business_address: config.business_address,
        logo_url: config.logo_url,
        created_at: config.created_at,
        updated_at: config.updated_at,
      },
    });
  } catch (error) {
    console.error("❌ Error general en updateAppConfig:", error);
    console.error("❌ Stack:", error.stack);
    res.status(500).json({
      ok: false,
      msg: "Error interno del servidor al actualizar la configuración",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

module.exports = {
  updateAppConfig,
};
