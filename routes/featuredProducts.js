const express = require("express");
const router = express.Router();

// ✅ IMPORTAR MODELO DIRECTAMENTE
const FeaturedProducts = require("../models/FeaturedProducts");

router.get("/public", async (req, res) => {
  try {
    console.log("🔄 Solicitando productos destacados...");
    console.log("🔍 FeaturedProducts model:", !!FeaturedProducts); // Debug

    let featured = await FeaturedProducts.findOne();

    if (!featured) {
      console.log("⚠️  No hay productos destacados, creando por defecto...");
      featured = await FeaturedProducts.create({
        popular: [],
        on_sale: [],
      });
    }

    console.log(
      `✅ Enviando productos destacados - Populares: ${featured.popular.length}, Oferta: ${featured.on_sale.length}`
    );

    res.json({
      ok: true,
      popular: featured.popular || [],
      onSale: featured.on_sale || [],
    });
  } catch (error) {
    console.error("❌ Error en /public:", error);
    res.status(500).json({
      ok: true,
      popular: [],
      onSale: [],
      msg: "Usando datos por defecto",
    });
  }
});

module.exports = router;
