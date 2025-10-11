// server.js - VERSIÓN CON DEBUGGING MEJORADO
require("dotenv").config();
const express = require("express");
const { db } = require("./database/connection");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();

// ✅ CONFIGURACIÓN CORS SIMPLIFICADA
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://minimarket-frontend-sage.vercel.app",
    ],
    credentials: true,
  })
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// ✅ MIDDLEWARE DE LOGGING DETALLADO
app.use((req, res, next) => {
  console.log(
    `🌐 ${new Date().toLocaleTimeString()} - ${req.method} ${req.originalUrl}`
  );
  next();
});

// ✅ RUTA DE HEALTH CHECK
app.get("/api/health", (req, res) => {
  res.json({
    ok: true,
    msg: "Servidor funcionando",
    timestamp: new Date().toISOString(),
  });
});

// ✅ CARGAR MODELOS Y ASOCIACIONES CORRECTAMENTE
const loadModelsAndAssociations = async () => {
  try {
    console.log("🔄 Cargando modelos y asociaciones...");

    // Importar modelos
    const Product = require("./models/Product");
    const Category = require("./models/Category");

    // ✅ DEFINIR ASOCIACIONES DIRECTAMENTE EN LOS MODELOS
    Product.belongsTo(Category, {
      foreignKey: "category_id",
      as: "category",
      onDelete: "RESTRICT",
      onUpdate: "CASCADE",
    });

    Category.hasMany(Product, {
      foreignKey: "category_id",
      as: "products",
      onDelete: "RESTRICT",
      onUpdate: "CASCADE",
    });

    console.log("✅ Modelos y asociaciones cargadas correctamente");
  } catch (error) {
    console.error("❌ Error cargando modelos:", error);
    throw error;
  }
};

// ✅ VERIFICACIÓN DE ARCHIVOS DE RUTAS
console.log("🔍 Verificando archivos de rutas...");
const routesDir = path.join(__dirname, "routes");
try {
  const routeFiles = fs.readdirSync(routesDir);
  console.log("✅ Archivos encontrados en routes/:", routeFiles);
} catch (error) {
  console.error("❌ Error leyendo carpeta routes:", error.message);
}

// ✅ CARGAR RUTAS CON DEBUGGING
const loadRoutesWithDebug = () => {
  console.log("\n🔄 INICIANDO CARGA DE RUTAS...");

  const routes = [
    { path: "/api/auth", file: "./routes/auth" },
    { path: "/api/products", file: "./routes/products" },
    { path: "/api/app-config", file: "./routes/appConfig" },
    { path: "/api/categories", file: "./routes/categories" },
    { path: "/api/featured-products", file: "./routes/featuredProducts" },
  ];

  routes.forEach((route) => {
    try {
      console.log(`📦 Cargando: ${route.path} desde ${route.file}`);

      // Verificar si el archivo existe
      if (
        !fs.existsSync(
          path.join(__dirname, "routes", path.basename(route.file) + ".js")
        )
      ) {
        console.log(`❌ Archivo no existe: ${route.file}.js`);
        return;
      }

      const routeModule = require(route.file);
      app.use(route.path, routeModule);
      console.log(`✅ Ruta cargada: ${route.path}`);
    } catch (error) {
      console.error(`❌ Error cargando ${route.path}:`, error.message);
      console.error(`   Stack:`, error.stack);
    }
  });

  console.log("✅ CARGA DE RUTAS COMPLETADA\n");
};

// ✅ RUTAS TEMPORALES PARA PRUEBA (AGREGA ESTO)
app.get("/api/test/config", (req, res) => {
  console.log("✅ Ruta de prueba /api/test/config accedida");
  res.json({
    ok: true,
    msg: "Ruta de prueba funcionando",
    config: {
      app_name: "Minimarket Test",
      theme: "blue",
    },
  });
});

app.get("/api/test/products", (req, res) => {
  console.log("✅ Ruta de prueba /api/test/products accedida");
  res.json({
    ok: true,
    products: [
      { id: 1, name: "Producto Test 1", price: 10.99 },
      { id: 2, name: "Producto Test 2", price: 15.5 },
    ],
  });
});

const PORT = process.env.PORT || 4000;

// ✅ INICIAR SERVIDOR
const startServer = async () => {
  try {
    console.log("🚀 Iniciando servidor...");

    // Conectar a la base de datos
    await db.authenticate();
    console.log("✅ Base de datos conectada");
    // ✅ CARGAR ASOCIACIONES ANTES DE SINCRONIZAR
    await loadModelsAndAssociations();
    // Sincronizar modelos
    if (process.env.NODE_ENV === "development") {
      await db.sync({ force: false, alter: true });
      console.log("✅ Modelos sincronizados");
    }

    // Cargar rutas
    loadRoutesWithDebug();

    // ✅ RUTA 404 - AL FINAL
    app.use((req, res) => {
      console.log(
        `❌ 404 - Ruta no manejada: ${req.method} ${req.originalUrl}`
      );
      res.status(404).json({
        ok: false,
        msg: `Ruta no encontrada: ${req.originalUrl}`,
        method: req.method,
        availableTestRoutes: [
          "GET /api/health",
          "GET /api/test/config",
          "GET /api/test/products",
        ],
      });
    });

    // Iniciar servidor
    app.listen(PORT, () => {
      console.log(`\n🎉 SERVIDOR INICIADO EN http://localhost:${PORT}`);
      console.log(`🔗 Health Check: http://localhost:${PORT}/api/health`);
      console.log(`🔗 Test Config: http://localhost:${PORT}/api/test/config`);
      console.log(
        `🔗 Test Products: http://localhost:${PORT}/api/test/products`
      );
      console.log(
        `🔗 App Config: http://localhost:${PORT}/api/app-config/public`
      );
      console.log(
        `🔗 Products: http://localhost:${PORT}/api/products/getProducts`
      );
    });
  } catch (error) {
    console.error("❌ Error iniciando servidor:", error);
    process.exit(1);
  }
};

startServer();
