// controllers/featuredProductsController.js
const { response } = require("express");
const FeaturedProducts = require("../models/FeaturedProducts");

// Obtener productos destacados
const getFeaturedProducts = async (req, res = response) => {
  try {
    console.log("🔍 Obteniendo productos destacados...");

    // Buscar el registro de productos destacados (solo debe haber uno)
    let featured = await FeaturedProducts.findOne();

    if (!featured) {
      // Si no existe, crear uno por defecto
      console.log("📝 Creando registro inicial de productos destacados...");
      featured = await FeaturedProducts.create({
        popular: [],
        on_sale: [],
      });
    }

    console.log("✅ Productos destacados obtenidos:", {
      popular: featured.popular.length,
      on_sale: featured.on_sale.length,
    });

    res.status(200).json({
      ok: true,
      popular: featured.popular || [],
      onSale: featured.on_sale || [],
    });
  } catch (error) {
    console.error("❌ Error en getFeaturedProducts:", error);
    res.status(500).json({
      ok: false,
      msg: "Error al obtener los productos destacados",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// Guardar productos destacados
const saveFeaturedProducts = async (req, res = response) => {
  try {
    const { popular, onSale } = req.body;

    console.log("💾 Guardando productos destacados...", {
      popular: popular?.length,
      onSale: onSale?.length,
    });

    // Validar que sean arrays
    if (!Array.isArray(popular) || !Array.isArray(onSale)) {
      return res.status(400).json({
        ok: false,
        msg: "Los datos de popular y onSale deben ser arrays",
      });
    }

    // Buscar el registro existente
    let featured = await FeaturedProducts.findOne();

    if (featured) {
      // Actualizar existente
      await featured.update({
        popular: popular,
        on_sale: onSale,
      });
    } else {
      // Crear nuevo
      featured = await FeaturedProducts.create({
        popular: popular,
        on_sale: onSale,
      });
    }

    console.log("✅ Productos destacados guardados exitosamente");

    res.status(200).json({
      ok: true,
      msg: "Productos destacados guardados correctamente",
      popular: featured.popular,
      onSale: featured.on_sale,
    });
  } catch (error) {
    console.error("❌ Error en saveFeaturedProducts:", error);
    res.status(500).json({
      ok: false,
      msg: "Error al guardar los productos destacados",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

module.exports = {
  getFeaturedProducts,
  saveFeaturedProducts,
};
