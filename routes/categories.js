const express = require("express");
const router = express.Router();
const { validarJWT } = require("../middlewares/revalidar-jwt");

// ✅ VERIFICAR SI USAS CONTROLADORES O CÓDIGO DIRECTO
// Opción 1: Con controladores (recomendado)
try {
  const {
    getCategories,
    createCategory,
    updateCategory,
    deleteCategory,
  } = require("../controllers/categoriesController");

  // RUTA PÚBLICA
  router.get("/getCategories", getCategories);

  // RUTAS PROTEGIDAS
  router.post("/new", validarJWT, createCategory);
  router.put("/update", validarJWT, updateCategory);
  router.delete("/delete/:categoryName", validarJWT, deleteCategory);
} catch (error) {
  // Opción 2: Código directo (si no tienes controladores)
  console.log("⚠️  Usando código directo en routes/categories.js");

  const Category = require("../models/Category");

  // GET - Obtener categorías
  router.get("/getCategories", async (req, res) => {
    try {
      const categories = await Category.findAll({
        order: [["name", "ASC"]],
      });

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

  // POST - Crear categoría
  router.post("/new", validarJWT, async (req, res) => {
    try {
      const { name } = req.body;

      const existingCategory = await Category.findOne({ where: { name } });
      if (existingCategory) {
        return res.status(400).json({
          ok: false,
          msg: "Ya existe una categoría con ese nombre",
        });
      }

      const category = await Category.create({ name });

      res.json({
        ok: true,
        category: {
          id: category.id,
          name: category.name,
          created_at: category.created_at,
          updated_at: category.updated_at,
        },
        msg: "Categoría creada exitosamente",
      });
    } catch (error) {
      console.error("❌ Error en /new:", error);
      res.status(500).json({
        ok: false,
        msg: "Error al crear la categoría",
        error: error.message,
      });
    }
  });

  // PUT - Actualizar categoría
  router.put("/update", validarJWT, async (req, res) => {
    try {
      const { oldName, newName } = req.body;

      const category = await Category.findOne({ where: { name: oldName } });
      if (!category) {
        return res.status(404).json({
          ok: false,
          msg: "Categoría no encontrada",
        });
      }

      const existingCategory = await Category.findOne({
        where: { name: newName },
      });
      if (existingCategory && existingCategory.id !== category.id) {
        return res.status(400).json({
          ok: false,
          msg: "Ya existe una categoría con ese nombre",
        });
      }

      category.name = newName;
      await category.save();

      res.json({
        ok: true,
        category: {
          id: category.id,
          name: category.name,
          created_at: category.created_at,
          updated_at: category.updated_at,
        },
        msg: "Categoría actualizada exitosamente",
      });
    } catch (error) {
      console.error("❌ Error en /update:", error);
      res.status(500).json({
        ok: false,
        msg: "Error al actualizar la categoría",
        error: error.message,
      });
    }
  });

  // DELETE - Eliminar categoría
  router.delete("/delete/:categoryName", validarJWT, async (req, res) => {
    try {
      const { categoryName } = req.params;

      if (categoryName === "Todos") {
        return res.status(400).json({
          ok: false,
          msg: "No se puede eliminar la categoría 'Todos'",
        });
      }

      const category = await Category.findOne({
        where: { name: categoryName },
      });
      if (!category) {
        return res.status(404).json({
          ok: false,
          msg: "Categoría no encontrada",
        });
      }

      await category.destroy();

      res.json({
        ok: true,
        msg: "Categoría eliminada exitosamente",
      });
    } catch (error) {
      console.error("❌ Error en /delete:", error);
      res.status(500).json({
        ok: false,
        msg: "Error al eliminar la categoría",
        error: error.message,
      });
    }
  });
}

module.exports = router;
