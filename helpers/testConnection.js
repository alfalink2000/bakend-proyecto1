require("dotenv").config();

async function testConnection() {
  try {
    console.log("🧪 Probando conexión y modelos...");

    // Probar conexión a BD
    const { db } = require("../database/connection");
    await db.authenticate();
    console.log("✅ Conexión a BD: OK");

    // Probar modelos
    const Product = require("../models/Product");
    const Category = require("../models/Category");

    console.log("✅ Product model:", Product ? "Cargado" : "No cargado");
    console.log("✅ Category model:", Category ? "Cargado" : "No cargado");
    console.log("✅ Product.findAll:", typeof Product.findAll);
    console.log("✅ Category.findAll:", typeof Category.findAll);

    // Probar consulta simple
    const categories = await Category.findAll();
    console.log(`✅ Categorías en BD: ${categories.length}`);

    const products = await Product.findAll();
    console.log(`✅ Productos en BD: ${products.length}`);

    return true;
  } catch (error) {
    console.error("❌ Error en test:", error.message);
    return false;
  }
}

// ✅ Exportar la función directamente, no como objeto
module.exports = testConnection;
