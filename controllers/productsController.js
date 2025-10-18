// controllers/productsController.js - VERSIÓN CORREGIDA
const { response } = require("express");
const Product = require("../models/Product");
const Category = require("../models/Category");
const { uploadToImgBB } = require("../services/imageService");

const getProducts = async (req, res = response) => {
  try {
    console.log("🔍 Intentando obtener productos...");

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

    console.log(`✅ Productos encontrados: ${products.length}`);

    res.status(200).json({
      ok: true,
      products,
      count: products.length,
    });
  } catch (error) {
    console.error("❌ Error detallado en getProducts:", error);
    console.error("❌ Stack trace:", error.stack);

    res.status(500).json({
      ok: false,
      msg: "Error al obtener los productos",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

const createProduct = async (req, res = response) => {
  try {
    const { name, description, price, category_id, status, stock_quantity } =
      req.body;

    console.log("🔄 Creando nuevo producto:", {
      name,
      price,
      category_id,
      hasImage: !!req.file,
    });

    // ✅ VALIDACIONES MEJORADAS
    if (!name || name.trim().length === 0) {
      return res.status(400).json({
        ok: false,
        msg: "El nombre del producto es requerido",
      });
    }

    if (!price || isNaN(price) || parseFloat(price) <= 0) {
      return res.status(400).json({
        ok: false,
        msg: "El precio debe ser un número mayor a 0",
      });
    }

    if (!category_id || isNaN(category_id)) {
      return res.status(400).json({
        ok: false,
        msg: "La categoría es requerida",
      });
    }

    // Verificar si la categoría existe
    const category = await Category.findByPk(category_id);
    if (!category) {
      return res.status(400).json({
        ok: false,
        msg: "La categoría seleccionada no existe",
      });
    }

    let imageUrl = "";

    // Procesar imagen si existe
    if (req.file) {
      try {
        console.log("🖼️ Procesando imagen...");

        // Validar tamaño
        if (req.file.size > 5 * 1024 * 1024) {
          return res.status(400).json({
            ok: false,
            msg: "La imagen es demasiado grande. Máximo 5MB permitido.",
          });
        }

        imageUrl = await uploadToImgBB(req.file.buffer);
        console.log("✅ Imagen procesada:", imageUrl);
      } catch (uploadError) {
        console.error("❌ Error subiendo imagen:", uploadError);
        return res.status(500).json({
          ok: false,
          msg: uploadError.message || "Error al subir la imagen",
        });
      }
    }

    const product = await Product.create({
      name: name.trim(),
      description: description ? description.trim() : "",
      price: parseFloat(price),
      category_id: parseInt(category_id),
      image_url: imageUrl,
      status: status || "available",
      stock_quantity: stock_quantity ? parseInt(stock_quantity) : 0,
    });

    // Cargar la categoría relacionada para la respuesta
    await product.reload({
      include: [
        {
          model: Category,
          as: "category",
        },
      ],
    });

    console.log("✅ Producto creado exitosamente - ID:", product.id);

    res.status(201).json({
      ok: true,
      product,
      msg: "Producto creado exitosamente",
    });
  } catch (error) {
    console.error("❌ Error en createProduct:", error);
    res.status(500).json({
      ok: false,
      msg: "Error al crear el producto",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

const updateProduct = async (req, res = response) => {
  try {
    const { id } = req.params;
    const { name, description, price, category_id, status, stock_quantity } =
      req.body;

    console.log("🔄 Actualizando producto ID:", id);

    // Validaciones básicas
    if (!name || name.trim().length === 0) {
      return res.status(400).json({
        ok: false,
        msg: "El nombre del producto es requerido",
      });
    }

    const product = await Product.findByPk(id);
    if (!product) {
      return res.status(404).json({
        ok: false,
        msg: "Producto no encontrado",
      });
    }

    // Verificar si la categoría existe (si se está actualizando)
    if (category_id) {
      const category = await Category.findByPk(category_id);
      if (!category) {
        return res.status(400).json({
          ok: false,
          msg: "La categoría seleccionada no existe",
        });
      }
    }

    let imageUrl = product.image_url;

    // Procesar nueva imagen si se subió
    if (req.file) {
      try {
        console.log("🖼️ Procesando nueva imagen...");
        imageUrl = await uploadToImgBB(req.file.buffer);
        console.log("✅ Nueva imagen procesada:", imageUrl);
      } catch (uploadError) {
        console.error("❌ Error subiendo nueva imagen:", uploadError);
        return res.status(500).json({
          ok: false,
          msg: uploadError.message || "Error al subir la nueva imagen",
        });
      }
    }

    // Actualizar el producto
    await product.update({
      name: name.trim(),
      description: description ? description.trim() : product.description,
      price: price ? parseFloat(price) : product.price,
      category_id: category_id ? parseInt(category_id) : product.category_id,
      image_url: imageUrl,
      status: status || product.status,
      stock_quantity:
        stock_quantity !== undefined
          ? parseInt(stock_quantity)
          : product.stock_quantity,
    });

    // Cargar la categoría relacionada para la respuesta
    await product.reload({
      include: [
        {
          model: Category,
          as: "category",
        },
      ],
    });

    console.log("✅ Producto actualizado exitosamente");

    res.status(200).json({
      ok: true,
      product,
      msg: "Producto actualizado exitosamente",
    });
  } catch (error) {
    console.error("❌ Error en updateProduct:", error);
    res.status(500).json({
      ok: false,
      msg: "Error al actualizar el producto",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

const deleteProduct = async (req, res = response) => {
  try {
    const { id } = req.params;

    console.log("🔄 Eliminando producto ID:", id);

    const product = await Product.findByPk(id);
    if (!product) {
      return res.status(404).json({
        ok: false,
        msg: "Producto no encontrado",
      });
    }

    // ✅ VALIDAR QUE NO SEA EL ÚLTIMO PRODUCTO
    const totalProducts = await Product.count();
    if (totalProducts <= 1) {
      return res.status(400).json({
        ok: false,
        msg: "No se puede eliminar el último producto. El sitio necesita al menos un producto para funcionar correctamente.",
      });
    }

    await product.destroy();

    console.log("✅ Producto eliminado exitosamente");

    res.status(200).json({
      ok: true,
      msg: "Producto eliminado exitosamente",
    });
  } catch (error) {
    console.error("❌ Error en deleteProduct:", error);
    res.status(500).json({
      ok: false,
      msg: "Error al eliminar el producto",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

const getProductById = async (req, res = response) => {
  try {
    const { id } = req.params;

    const product = await Product.findByPk(id, {
      include: [
        {
          model: Category,
          as: "category",
        },
      ],
    });

    if (!product) {
      return res.status(404).json({
        ok: false,
        msg: "Producto no encontrado",
      });
    }

    res.status(200).json({
      ok: true,
      product,
    });
  } catch (error) {
    console.error("❌ Error en getProductById:", error);
    res.status(500).json({
      ok: false,
      msg: "Error al obtener el producto",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

module.exports = {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductById,
};
