const express = require("express");
const { Product } = require("../models/Product"); // Importar directamente
const { Category } = require("../models/Category"); // Importar directamente
const router = express.Router();

// ✅ GET todos los productos (SIN asociaciones por ahora)
router.get("/getProducts", async (req, res) => {
  try {
    console.log("🔄 Solicitando productos...");

    // ✅ SOLUCIÓN TEMPORAL: Obtener productos SIN include
    const products = await Product.findAll({
      order: [["created_at", "DESC"]],
    });

    console.log(`✅ Enviando ${products.length} productos`);

    res.json({
      ok: true,
      products: products.map((product) => ({
        id: product.id,
        name: product.name,
        description: product.description,
        price: parseFloat(product.price),
        stock_quantity: product.stock_quantity,
        image_url: product.image_url,
        status: product.status,
        category_id: product.category_id, // ✅ Solo enviar el ID
        created_at: product.created_at,
        updated_at: product.updated_at,
      })),
    });
  } catch (error) {
    console.error("❌ Error en /getProducts:", error);
    res.status(500).json({
      ok: false,
      msg: "Error al cargar productos",
      error: error.message,
    });
  }
});

module.exports = router;
