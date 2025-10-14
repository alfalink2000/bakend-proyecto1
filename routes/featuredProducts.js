const express = require("express");
const router = express.Router();
const { validarJWT } = require("../middlewares/revalidar-jwt");

// ✅ IMPORTAR MODELO DIRECTAMENTE
const FeaturedProducts = require("../models/FeaturedProducts");

// ✅ RUTA PRINCIPAL - LA QUE TU FRONTEND ESTÁ BUSCANDO (PROTEGIDA)
router.get("/", validarJWT, async (req, res) => {
  try {
    console.log(
      "🔄 Solicitando productos destacados (ruta PRINCIPAL - ADMIN)..."
    );
    console.log("🔍 FeaturedProducts model:", !!FeaturedProducts);

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
    console.error("❌ Error en / (ruta principal):", error);
    res.status(500).json({
      ok: true,
      popular: [],
      onSale: [],
      msg: "Usando datos por defecto",
    });
  }
});

// ✅ RUTA PUBLIC (para compatibilidad - PÚBLICA)
router.get("/public", async (req, res) => {
  try {
    console.log("🔄 Solicitando productos destacados (ruta public)...");

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

// ✅ RUTA PARA GUARDAR PRODUCTOS DESTACADOS (PROTEGIDA) - ¡ESTA ES LA QUE FALTABA!
router.post("/", validarJWT, async (req, res) => {
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

    res.json({
      ok: true,
      msg: "Productos destacados guardados correctamente",
      popular: featured.popular,
      onSale: featured.on_sale,
    });
  } catch (error) {
    console.error("❌ Error en POST /:", error);
    res.status(500).json({
      ok: false,
      msg: "Error al guardar los productos destacados",
      error: error.message,
    });
  }
});

module.exports = router;
