// routes/products.js
const { Router } = require("express");
const { check } = require("express-validator");
const { validarCampos } = require("../middlewares/validar-campos");
const { validarJWT } = require("../middlewares/revalidar-jwt");
const upload = require("../middlewares/uploadMiddleware");

const {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductById,
} = require("../controllers/productsController");

const router = Router();

// ✅ RUTAS PÚBLICAS (sin autenticación)
router.get("/getProducts", getProducts);
router.get("/:id", getProductById);

// ✅ RUTAS PROTEGIDAS (requieren autenticación)
router.use(validarJWT);

// Crear nuevo producto CON UPLOAD DE IMAGEN
router.post(
  "/new",
  upload.single("image"), // 'image' debe coincidir con el name del input
  [
    check("name", "El nombre del producto es obligatorio").not().isEmpty(),
    check("price", "El precio del producto es obligatorio").isNumeric(),
    check(
      "category_id",
      "La categoría del producto es obligatoria"
    ).isNumeric(),
    validarCampos,
  ],
  createProduct
);

// Actualizar producto CON UPLOAD DE IMAGEN
router.put(
  "/update/:id",
  upload.single("image"),
  [
    check("name", "El nombre del producto es obligatorio").not().isEmpty(),
    check("price", "El precio del producto es obligatorio").isNumeric(),
    validarCampos,
  ],
  updateProduct
);

// Eliminar producto
router.delete("/delete/:id", deleteProduct);

module.exports = router;
