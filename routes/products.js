// routes/products.js - VERSIÓN CORREGIDA
const express = require("express");
const multer = require("multer");
const { Product, Category } = require("../models");
const { uploadToImgBB } = require("../services/imageService");

const router = express.Router();

// ✅ CONFIGURACIÓN MULTER MEJORADA
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB límite
  },
  fileFilter: (req, file, cb) => {
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

// ✅ RUTA PARA OBTENER PRODUCTOS
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
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

// ✅ RUTA PARA CREAR PRODUCTOS - VERSIÓN MEJORADA
router.post(
  "/new",
  upload.single("image"),
  handleMulterError,
  async (req, res) => {
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

      // Verificar categoría
      const category = await Category.findByPk(category_id);
      if (!category) {
        return res.status(400).json({
          ok: false,
          msg: "La categoría seleccionada no existe",
        });
      }

      let imageUrl = "";

      // ✅ PROCESAR IMAGEN CON MANEJO DE ERRORES MEJORADO
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

          // Subir a ImgBB
          imageUrl = await uploadToImgBB(req.file.buffer);
          console.log("✅ Imagen subida exitosamente:", imageUrl);
        } catch (uploadError) {
          console.error("❌ Error subiendo imagen:", uploadError);
          return res.status(500).json({
            ok: false,
            msg: "Error al subir la imagen: " + uploadError.message,
          });
        }
      }

      // ✅ CREAR PRODUCTO CON MANEJO DE ERRORES
      let product;
      try {
        product = await Product.create({
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
      } catch (dbError) {
        console.error("❌ Error creando producto en BD:", dbError);
        return res.status(500).json({
          ok: false,
          msg: "Error al guardar el producto en la base de datos",
          error:
            process.env.NODE_ENV === "development"
              ? dbError.message
              : undefined,
        });
      }

      console.log("✅ Producto creado exitosamente - ID:", product.id);

      res.status(201).json({
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
          created_at: product.created_at,
          updated_at: product.updated_at,
        },
        msg: "Producto creado exitosamente",
      });
    } catch (error) {
      console.error("❌ Error general en /new:", error);
      res.status(500).json({
        ok: false,
        msg: "Error interno del servidor al crear el producto",
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      });
    }
  }
);

// ✅ RUTA PARA ACTUALIZAR PRODUCTOS
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
            msg: "Error al subir la nueva imagen: " + uploadError.message,
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
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      });
    }
  }
);

// ✅ RUTA PARA ELIMINAR PRODUCTOS CON VALIDACIÓN DE ÚLTIMO PRODUCTO
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

    res.json({
      ok: true,
      msg: "Producto eliminado exitosamente",
    });
  } catch (error) {
    console.error("❌ Error en /delete/:id:", error);
    res.status(500).json({
      ok: false,
      msg: "Error al eliminar el producto",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

module.exports = router;
