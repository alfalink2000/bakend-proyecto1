// routes/products.js - SOLO RUTAS
const express = require("express");
const multer = require("multer");
const {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductById,
} = require("../controllers/productsController");

const router = express.Router();

// ✅ CONFIGURACIÓN MULTER
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

// ✅ RUTAS
router.get("/getProducts", getProducts);
router.get("/:id", getProductById);

router.post("/new", upload.single("image"), handleMulterError, createProduct);

router.put(
  "/update/:id",
  upload.single("image"),
  handleMulterError,
  updateProduct
);

router.delete("/delete/:id", deleteProduct);

module.exports = router;
