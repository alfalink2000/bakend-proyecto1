// controllers/categoriesController.js
const { response } = require("express");
const Category = require("../models/Category");

const getCategories = async (req, res = response) => {
  try {
    const categories = await Category.findAll({
      order: [["name", "ASC"]],
    });

    res.status(200).json({
      ok: true,
      categories,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      ok: false,
      msg: "Error al obtener las categorías",
    });
  }
};

const createCategory = async (req, res = response) => {
  try {
    const { name } = req.body;

    // Verificar si la categoría ya existe
    const existingCategory = await Category.findOne({ where: { name } });
    if (existingCategory) {
      return res.status(400).json({
        ok: false,
        msg: "Ya existe una categoría con ese nombre",
      });
    }

    const category = await Category.create({ name });

    res.status(201).json({
      ok: true,
      category,
      msg: "Categoría creada exitosamente",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      ok: false,
      msg: "Error al crear la categoría",
    });
  }
};

const updateCategory = async (req, res = response) => {
  try {
    const { oldName, newName } = req.body;

    // Verificar si la categoría existe
    const category = await Category.findOne({ where: { name: oldName } });
    if (!category) {
      return res.status(404).json({
        ok: false,
        msg: "Categoría no encontrada",
      });
    }

    // Verificar si el nuevo nombre ya existe
    const existingCategory = await Category.findOne({
      where: { name: newName },
    });
    if (existingCategory && existingCategory.id !== category.id) {
      return res.status(400).json({
        ok: false,
        msg: "Ya existe una categoría con ese nombre",
      });
    }

    // Actualizar la categoría
    category.name = newName;
    await category.save();

    res.status(200).json({
      ok: true,
      category,
      msg: "Categoría actualizada exitosamente",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      ok: false,
      msg: "Error al actualizar la categoría",
    });
  }
};

const deleteCategory = async (req, res = response) => {
  try {
    const { categoryName } = req.params;

    // Verificar si la categoría existe
    const category = await Category.findOne({ where: { name: categoryName } });
    if (!category) {
      return res.status(404).json({
        ok: false,
        msg: "Categoría no encontrada",
      });
    }

    // No permitir eliminar la categoría "Todos"
    if (categoryName === "Todos") {
      return res.status(400).json({
        ok: false,
        msg: "No se puede eliminar la categoría 'Todos'",
      });
    }

    await category.destroy();

    res.status(200).json({
      ok: true,
      msg: "Categoría eliminada exitosamente",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      ok: false,
      msg: "Error al eliminar la categoría",
    });
  }
};

module.exports = {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
};
