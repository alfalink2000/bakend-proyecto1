// routes/featuredProducts.js
const { Router } = require("express");
const { validarJWT } = require("../middlewares/revalidar-jwt");
const {
  getFeaturedProducts,
  saveFeaturedProducts,
} = require("../controllers/featuredProductsController");

const router = Router();

// ✅ RUTA PÚBLICA - Para que los clientes puedan ver los productos destacados
router.get("/public", getFeaturedProducts);

// ✅ RUTAS PROTEGIDAS (solo admin puede modificar)
router.use(validarJWT); // Este middleware solo aplica a las rutas siguientes

// Obtener productos destacados (para admin)
router.get("/", getFeaturedProducts);

// Guardar productos destacados
router.post("/", saveFeaturedProducts);

module.exports = router;
