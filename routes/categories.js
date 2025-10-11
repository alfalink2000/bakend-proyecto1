const express = require("express");
const router = express.Router();

// ✅ IMPORTAR MODELO DIRECTAMENTE
const Category = require("../models/Category");

router.get("/getCategories", async (req, res) => {
  try {
    console.log("🔄 Solicitando categorías...");
    console.log("🔍 Category model:", !!Category); // Debug

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
