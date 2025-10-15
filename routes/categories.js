// routes/categories.js - VERSIÓN CORREGIDA
const { Router } = require("express");
const {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} = require("../controllers/categoriesController");

const router = Router();

// ✅ CORREGIR LAS RUTAS PARA QUE COINCIDAN CON LO QUE USA EL FRONTEND
router.get("/getCategories", getCategories);
router.post("/new", createCategory);
router.put("/update/:oldName", updateCategory); // ✅ Usar :oldName en params
router.delete("/delete/:categoryName", deleteCategory);

module.exports = router;
