// routes/categories.js - VERSIÓN CORREGIDA
const express = require("express");
const router = express.Router();
const { validarJWT } = require("../middlewares/revalidar-jwt");

// ✅ USAR CONTROLADORES CORREGIDOS
const {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} = require("../controllers/categoriesController");

// RUTA PÚBLICA
router.get("/getCategories", getCategories);

// RUTAS PROTEGIDAS - ✅ CORREGIR LAS RUTAS
router.post("/new", validarJWT, createCategory);
router.put("/update/:oldName", validarJWT, updateCategory); // ✅ CORREGIDO: Usar :oldName en params
router.delete("/delete/:categoryName", validarJWT, deleteCategory);

module.exports = router;
