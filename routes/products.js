const express = require("express");
const { Product, Category } = require("../models"); // ✅ Importar desde index
const router = express.Router();

router.get("/getProducts", async (req, res) => {
  try {
    console.log("🔄 Solicitando productos...");
    console.log("🔍 Product model:", !!Product);
    console.log("🔍 Category model:", !!Category);

    const products = await Product.findAll({
      include: [
        {
          model: Category,
          as: "category",
          attributes: ["id", "name"],
        },
      ],
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
        category: product.category
          ? {
              id: product.category.id,
              name: product.category.name,
            }
          : null,
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
