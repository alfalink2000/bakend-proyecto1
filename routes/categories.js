const express = require("express");
const { Category } = require("../models/Category"); // Importar directamente
const router = express.Router();

// ✅ GET todas las categorías
router.get("/getCategories", async (req, res) => {
  try {
    console.log("🔄 Solicitando categorías...");

    const categories = await Category.findAll({
      order: [["name", "ASC"]],
    });

    console.log(`✅ Enviando ${categories.length} categorías`);

    res.json({
      ok: true,
      categories: categories.map((cat) => ({
        id: cat.id,
        name: cat.name,
        created_at: cat.created_at,
        updated_at: cat.updated_at,
      })),
    });
  } catch (error) {
    console.error("❌ Error en /getCategories:", error);
    res.status(500).json({
      ok: false,
      msg: "Error al cargar categorías",
      error: error.message,
    });
  }
});

module.exports = router;
