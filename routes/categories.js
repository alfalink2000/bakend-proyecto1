// routes/categories.js
const { Router } = require("express");
const { check } = require("express-validator");
const { validarCampos } = require("../middlewares/validar-campos");
const { validarJWT } = require("../middlewares/revalidar-jwt");

const {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} = require("../controllers/categoriesController");

const router = Router();

// ✅ RUTA PÚBLICA (sin autenticación) - OBTENER CATEGORÍAS
router.get("/getCategories", getCategories);

// ✅ RUTAS PROTEGIDAS (requieren autenticación)
router.use(validarJWT);

// Crear nueva categoría
router.post(
  "/new",
  [
    check("name", "El nombre de la categoría es obligatorio").not().isEmpty(),
    validarCampos,
  ],
  createCategory
);

// Actualizar categoría
router.put(
  "/update",
  [
    check("oldName", "El nombre actual de la categoría es obligatorio")
      .not()
      .isEmpty(),
    check("newName", "El nuevo nombre de la categoría es obligatorio")
      .not()
      .isEmpty(),
    validarCampos,
  ],
  updateCategory
);

// Eliminar categoría
router.delete("/delete/:categoryName", deleteCategory);

module.exports = router;
