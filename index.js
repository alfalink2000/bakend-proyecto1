// server.js - VERSIÓN QUE SIEMPRE INICIA (CON O SIN BD)
require("dotenv").config();
const express = require("express");
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

// ✅ RUTA DE HEALTH CHECK MEJORADA
app.get("/api/health", async (req, res) => {
  let dbStatus = "unknown";
  try {
    const { db } = require("./database/connection");
    await db.authenticate();
    dbStatus = "connected";
  } catch (error) {
    dbStatus = "disconnected";
  }

  res.json({
    ok: true,
    msg: "Servidor funcionando",
    database: dbStatus,
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});

// ✅ RUTA RAIZ - MOVIDA AL PRINCIPIO
app.get("/", (req, res) => {
  res.json({
    ok: true,
    msg: "Bienvenido a Minimarket Backend API",
    timestamp: new Date().toISOString(),
    status: "online",
    availableRoutes: [
      "GET /api/health",
      "GET /api/test/config",
      "GET /api/test/products",
      "GET /api/app-config/public",
      "GET /api/products/getProducts",
      "GET /api/categories/getCategories",
    ],
  });
});

// ✅ RUTAS TEMPORALES PARA PRUEBA
app.get("/api/test/config", (req, res) => {
  console.log("✅ Ruta de prueba /api/test/config accedida");
  res.json({
    ok: true,
    msg: "Ruta de prueba funcionando",
    config: {
      app_name: "Minimarket Test",
      theme: "blue",
    },
    environment: process.env.NODE_ENV,
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

// ✅ CARGAR MODELOS DIRECTAMENTE (VERSIÓN SIMPLIFICADA)
const loadModels = async () => {
  try {
    console.log("🔄 Cargando modelos...");

    // Solo importar los modelos - ya están asociados en su definición
    require("./models/Product");
    require("./models/Category");
    require("./models/AppConfig");
    require("./models/User");
    require("./models/FeaturedProducts");

    console.log("✅ Modelos cargados correctamente");
    return true;
  } catch (error) {
    console.error("❌ Error cargando modelos:", error.message);
    return false;
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
    }
  });

  console.log("✅ CARGA DE RUTAS COMPLETADA\n");
};

const PORT = process.env.PORT || 4000;

// ✅ INICIAR SERVIDOR (VERSIÓN MEJORADA - NO BLOQUEANTE)
const startServer = async () => {
  try {
    console.log("🚀 Iniciando servidor...");
    console.log("🌍 Environment:", process.env.NODE_ENV);
    console.log(
      "🔗 Database URL:",
      process.env.DATABASE_URL ? "✅ Configurada" : "❌ No configurada"
    );

    let dbConnected = false;

    // ✅ INTENTAR CONEXIÓN A BD (NO BLOQUEANTE)
    if (process.env.DATABASE_URL) {
      try {
        const { db } = require("./database/connection");
        console.log("🔌 Intentando conectar a la base de datos...");
        await db.authenticate();
        console.log("✅ Base de datos conectada");
        dbConnected = true;

        // ✅ CARGAR MODELOS SIMPLEMENTE
        await loadModels();

        // Sincronizar modelos solo en desarrollo y si la BD está conectada
        if (process.env.NODE_ENV === "development" && dbConnected) {
          await db.sync({ force: false, alter: true });
          console.log("✅ Modelos sincronizados");
        }
      } catch (dbError) {
        console.log("❌ Error conectando a BD:", dbError.message);
        console.log("🔄 Continuando sin base de datos...");
        dbConnected = false;
      }
    } else {
      console.log("⚠️  No hay DATABASE_URL configurada - Iniciando sin BD");
    }

    // ✅ CARGAR RUTAS (SIEMPRE SE EJECUTA)
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

    // ✅ INICIAR SERVIDOR (SIEMPRE SE EJECUTA)
    app.listen(PORT, () => {
      console.log(`\n🎉 🎉 🎉 SERVIDOR INICIADO EXITOSAMENTE 🎉 🎉 🎉`);
      console.log(`📍 Puerto: ${PORT}`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
      console.log(
        `🗄️  Base de datos: ${dbConnected ? "✅ Conectada" : "❌ No conectada"}`
      );
      console.log(`🔗 URL: https://minimarket-backend-6z9m.onrender.com`);
      console.log(
        `✅ Health Check: https://minimarket-backend-6z9m.onrender.com/api/health`
      );
      console.log(
        `✅ Test Config: https://minimarket-backend-6z9m.onrender.com/api/test/config`
      );
    });
  } catch (error) {
    console.error("❌ Error crítico iniciando servidor:", error);
    process.exit(1);
  }
};

// ✅ INICIAR TODO
startServer();
