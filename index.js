// server.js - VERSIÓN PARA PRODUCCIÓN
require("dotenv").config();
const express = require("express");
const { db } = require("./database/connection");
const cors = require("cors");

const app = express();

// ✅ CONFIGURACIÓN CORS MEJORADA PARA PRODUCCIÓN
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  "https://tu-frontend.vercel.app", // ✅ Reemplazar con tu dominio real
  process.env.FRONTEND_URL, // ✅ Variable de entorno para producción
].filter(Boolean); // Eliminar valores undefined

app.use(
  cors({
    origin: function (origin, callback) {
      // Permitir requests sin origin (como mobile apps o curl)
      if (!origin) return callback(null, true);

      if (allowedOrigins.indexOf(origin) === -1) {
        const msg = `Origen ${origin} no permitido por CORS`;
        console.log("🚫 CORS bloqueado:", origin);
        return callback(new Error(msg), false);
      }
      console.log("✅ CORS permitido para:", origin);
      return callback(null, true);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "x-token"],
  })
);

// ✅ MIDDLEWARE DE LOGGING MEJORADO
app.use((req, res, next) => {
  if (process.env.NODE_ENV !== "production") {
    console.log(`🌐 ${new Date().toISOString()} - ${req.method} ${req.url}`);
    console.log(`📍 Origin: ${req.headers.origin}`);
  }
  next();
});

app.use(express.json({ limit: "10mb" })); // ✅ Aumentar límite para imágenes
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(express.static("public"));

// ✅ RUTA DE HEALTH CHECK MEJORADA
app.get("/api/health", (req, res) => {
  res.status(200).json({
    ok: true,
    msg: "Servidor funcionando correctamente",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
    database: "connected", // Podrías verificar la conexión a BD aquí
    version: "1.0.0",
  });
});

// ✅ RUTA DE INFO DEL SERVIDOR (solo desarrollo)
if (process.env.NODE_ENV !== "production") {
  app.get("/api/debug", (req, res) => {
    res.json({
      environment: process.env.NODE_ENV,
      port: process.env.PORT,
      frontendUrl: process.env.FRONTEND_URL,
      database: process.env.DATABASE_URL ? "configured" : "not configured",
      allowedOrigins: allowedOrigins,
    });
  });
}

// El resto de tu código permanece igual...
const loadAssociations = async () => {
  try {
    console.log("🔄 Cargando asociaciones...");
    const Product = require("./models/Product");
    const Category = require("./models/Category");

    Product.belongsTo(Category, {
      foreignKey: "category_id",
      as: "category",
    });

    Category.hasMany(Product, {
      foreignKey: "category_id",
      as: "products",
    });

    console.log("✅ Asociaciones cargadas correctamente");
  } catch (error) {
    console.error("❌ Error cargando asociaciones:", error);
    throw error;
  }
};

const setupRoutes = () => {
  app.use("/api/auth", require("./routes/auth"));
  app.use("/api/products", require("./routes/products"));
  app.use("/api/app-config", require("./routes/appConfig"));
  app.use("/api/categories", require("./routes/categories"));
  app.use("/api/featured-products", require("./routes/featuredProducts"));
};

const PORT = process.env.PORT || 4000;

const startServer = async () => {
  try {
    console.log("🚀 Iniciando servidor...");
    console.log("🌍 Entorno:", process.env.NODE_ENV || "development");

    await db.authenticate();
    console.log("✅ Base de datos conectada");

    if (process.env.NODE_ENV === "development") {
      await db.sync({ force: false });
      console.log("✅ Modelos sincronizados");
    }

    await loadAssociations();
    setupRoutes();

    app.listen(PORT, () => {
      console.log(`\n🎉 SERVIDOR INICIADO CORRECTAMENTE`);
      console.log(`📍 Puerto: ${PORT}`);
      console.log(`🌍 Entorno: ${process.env.NODE_ENV || "development"}`);

      if (process.env.NODE_ENV === "production") {
        console.log(`🚀 MODO PRODUCCIÓN ACTIVADO`);
        console.log(`🔗 Backend URL: https://tu-backend.railway.app`);
      } else {
        console.log(`🔗 Frontend: http://localhost:5173`);
        console.log(`🔧 Backend: http://localhost:${PORT}`);
        console.log(`✅ Health: http://localhost:${PORT}/api/health`);
      }
    });
  } catch (error) {
    console.error("❌ Error iniciando servidor:", error);
    process.exit(1);
  }
};

startServer();
