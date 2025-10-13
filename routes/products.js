const express = require("express");
const multer = require("multer");
const { Product, Category } = require("../models");
const { uploadToImgBB } = require("../services/imageService");

const router = express.Router();

// ✅ CONFIGURACIÓN MULTER CON VALIDACIONES COMPLETAS
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB límite
  },
  fileFilter: (req, file, cb) => {
    // ✅ VALIDAR TIPO DE ARCHIVO
    const allowedMimes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
      "image/gif",
    ];

    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new Error(
          "Tipo de archivo no permitido. Solo se permiten: JPEG, JPG, PNG, WEBP, GIF"
        ),
        false
      );
    }
  },
});

// ✅ MIDDLEWARE PARA MANEJAR ERRORES DE MULTER
const handleMulterError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        ok: false,
        msg: "La imagen es demasiado grande. Máximo 5MB permitido.",
      });
    }
  } else if (error) {
    return res.status(400).json({
      ok: false,
      msg: error.message,
    });
  }
  next();
};

// ✅ RUTA ORIGINAL (que funcionaba)
router.get("/getProducts", async (req, res) => {
  try {
    console.log("🔄 Solicitando productos...");

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

// ✅ RUTA PARA ACTUALIZAR PRODUCTOS (CON VALIDACIONES Y COMPRESIÓN)
router.put(
  "/update/:id",
  upload.single("image"),
  handleMulterError,
  async (req, res) => {
    try {
      const { id } = req.params;
      const { name, description, price, category_id, status, stock_quantity } =
        req.body;

      console.log("🔄 Actualizando producto ID:", id);
      console.log("📦 Datos recibidos:", {
        name,
        price,
        status,
        stock_quantity,
      });

      // ✅ VALIDACIONES BÁSICAS
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

      const product = await Product.findByPk(id);
      if (!product) {
        return res.status(404).json({
          ok: false,
          msg: "Producto no encontrado",
        });
      }

      // Verificar categoría si se proporciona
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

      // ✅ PROCESAR NUEVA IMAGEN CON COMPRESIÓN (SI SE SUBIÓ)
      if (req.file) {
        try {
          console.log("🖼️ Procesando nueva imagen...");

          // ✅ VALIDAR TAMAÑO DE IMAGEN ANTES DE SUBIR
          if (req.file.size > 5 * 1024 * 1024) {
            return res.status(400).json({
              ok: false,
              msg: "La imagen es demasiado grande. Máximo 5MB permitido.",
            });
          }

          // ✅ USAR uploadToImgBB QUE INCLUYE COMPRESIÓN AUTOMÁTICA
          console.log("📤 Enviando imagen para compresión y upload...");
          imageUrl = await uploadToImgBB(req.file.buffer);

          console.log("✅ Nueva imagen comprimida y subida:", imageUrl);
        } catch (uploadError) {
          console.error("❌ Error procesando nueva imagen:", uploadError);
          return res.status(500).json({
            ok: false,
            msg: "Error al procesar la nueva imagen: " + uploadError.message,
          });
        }
      }

      // Actualizar el producto
      await product.update({
        name: name.trim(),
        description: description ? description.trim() : product.description,
        price: parseFloat(price),
        category_id: parseInt(category_id),
        image_url: imageUrl,
        status: status || product.status,
        stock_quantity:
          stock_quantity !== undefined
            ? parseInt(stock_quantity)
            : product.stock_quantity,
      });

      // Recargar con categoría
      await product.reload({
        include: [
          {
            model: Category,
            as: "category",
          },
        ],
      });

      console.log("✅ Producto actualizado exitosamente");

      res.json({
        ok: true,
        product: {
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
        },
        msg: "Producto actualizado exitosamente",
      });
    } catch (error) {
      console.error("❌ Error en /update/:id:", error);
      res.status(500).json({
        ok: false,
        msg: "Error al actualizar el producto",
        error: error.message,
      });
    }
  }
);

// ✅ RUTA PARA CREAR PRODUCTOS (CON VALIDACIONES Y COMPRESIÓN)
router.post(
  "/new",
  upload.single("image"),
  handleMulterError,
  async (req, res) => {
    try {
      const { name, description, price, category_id, status, stock_quantity } =
        req.body;

      console.log("🔄 Creando nuevo producto:", { name, price, category_id });

      // ✅ VALIDACIONES BÁSICAS
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

      // Verificar categoría
      const category = await Category.findByPk(category_id);
      if (!category) {
        return res.status(400).json({
          ok: false,
          msg: "La categoría seleccionada no existe",
        });
      }

      let imageUrl = "";

      // ✅ PROCESAR IMAGEN CON COMPRESIÓN (SI EXISTE)
      if (req.file) {
        try {
          console.log("🖼️ Procesando imagen...");

          // ✅ VALIDAR TAMAÑO DE IMAGEN ANTES DE SUBIR
          if (req.file.size > 5 * 1024 * 1024) {
            return res.status(400).json({
              ok: false,
              msg: "La imagen es demasiado grande. Máximo 5MB permitido.",
            });
          }

          // ✅ USAR uploadToImgBB QUE INCLUYE COMPRESIÓN AUTOMÁTICA
          console.log("📤 Enviando imagen para compresión y upload...");
          imageUrl = await uploadToImgBB(req.file.buffer);

          console.log("✅ Imagen comprimida y subida:", imageUrl);
        } catch (uploadError) {
          console.error("❌ Error procesando imagen:", uploadError);
          return res.status(500).json({
            ok: false,
            msg: "Error al procesar la imagen: " + uploadError.message,
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

      // Recargar con categoría
      await product.reload({
        include: [
          {
            model: Category,
            as: "category",
          },
        ],
      });

      console.log("✅ Producto creado exitosamente");

      res.json({
        ok: true,
        product: {
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
        },
        msg: "Producto creado exitosamente",
      });
    } catch (error) {
      console.error("❌ Error en /new:", error);
      res.status(500).json({
        ok: false,
        msg: "Error al crear el producto",
        error: error.message,
      });
    }
  }
);

// ✅ RUTA PARA ELIMINAR PRODUCTOS
router.delete("/delete/:id", async (req, res) => {
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

    await product.destroy();

    console.log("✅ Producto eliminado exitosamente");

    res.json({
      ok: true,
      msg: "Producto eliminado exitosamente",
    });
  } catch (error) {
    console.error("❌ Error en /delete/:id:", error);
    res.status(500).json({
      ok: false,
      msg: "Error al eliminar el producto",
      error: error.message,
    });
  }
});

module.exports = router;
