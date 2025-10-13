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

// ✅ Configuración de multer para manejar FormData
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB límite
  },
});

// ✅ RUTAS DE PRODUCTOS
router.get("/getProducts", getProducts);
router.get("/:id", getProductById);
router.post("/new", upload.single("image"), createProduct);
router.put("/update/:id", upload.single("image"), updateProduct);
router.delete("/delete/:id", deleteProduct);

module.exports = router;
