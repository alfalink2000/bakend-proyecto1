const express = require("express");
const router = express.Router();
const { validarJWT } = require("../middlewares/revalidar-jwt");

// ✅ IMPORTAR CONTROLADORES
const {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} = require("../controllers/categoriesController");

// ✅ RUTA PÚBLICA - Obtener categorías
router.get("/getCategories", getCategories);

// ✅ RUTAS PROTEGIDAS - CRUD de categorías
router.post("/new", validarJWT, createCategory);
router.put("/update", validarJWT, updateCategory);
router.delete("/delete/:categoryName", validarJWT, deleteCategory);

module.exports = router;
