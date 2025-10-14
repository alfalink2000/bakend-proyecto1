// server.js - VERSIÓN COMPLETA CORREGIDA
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();

// ✅ CONFIGURACIÓN CORS MEJORADA
app.use(
  cors({
    origin: [
      "https://minimarket-frontend-sage.vercel.app",
      "http://localhost:3000", // Para desarrollo local
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "x-token", "Authorization"],
  })
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// ✅ MIDDLEWARE DE LOGGING DETALLADO
app.use((req, res, next) => {
  console.log(
    `🌐 ${new Date().toLocaleTimeString()} - ${req.method} ${req.originalUrl}`
  );
  console.log(`🔑 Token presente: ${!!req.headers["x-token"]}`);
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
    routes: {
      public: [
        "GET /api/health",
        "GET /api/app-config/public",
        "GET /api/products/getProducts",
        "GET /api/categories/getCategories",
        "GET /api/featured-products/public",
        "POST /api/auth",
      ],
      protected: [
        "PUT /api/app-config",
        "GET /api/app-config",
        "GET /api/auth/renew",
        "GET /api/auth/getUsers",
      ],
    },
  });
});

// ✅ RUTA RAIZ - INFORMATIVA
app.get("/", (req, res) => {
  res.json({
    ok: true,
    msg: "Bienvenido a Minimarket Backend API",
    timestamp: new Date().toISOString(),
    status: "online",
    documentation: "Consulta /api/health para más información",
  });
});

// ✅ RUTAS TEMPORALES PARA PRUEBA (PÚBLICAS)
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

// ✅ VERIFICACIÓN DE ARCHIVOS DE RUTAS
console.log("🔍 Verificando archivos de rutas...");
const routesDir = path.join(__dirname, "routes");
try {
  const routeFiles = fs.readdirSync(routesDir);
  console.log("✅ Archivos encontrados en routes/:", routeFiles);
} catch (error) {
  console.error("❌ Error leyendo carpeta routes:", error.message);
}

// ✅ CARGAR RUTAS CON DEBUGGING MEJORADO
const loadRoutesWithDebug = () => {
  console.log("\n🔄 INICIANDO CARGA DE RUTAS...");

  const routes = [
    {
      path: "/api/auth",
      file: "./routes/auth",
      description: "Autenticación (login público, admin protegido)",
    },
    {
      path: "/api/products",
      file: "./routes/products",
      description: "Productos (públicos y admin)",
    },
    {
      path: "/api/app-config",
      file: "./routes/appConfig",
      description: "Configuración (pública lectura, admin escritura)",
    },
    {
      path: "/api/categories",
      file: "./routes/categories",
      description: "Categorías (públicas y admin)",
    },
    {
      path: "/api/featured-products",
      file: "./routes/featuredProducts",
      description: "Productos destacados (públicos y admin)",
    },
  ];

  routes.forEach((route) => {
    try {
      console.log(`📦 Cargando: ${route.path} - ${route.description}`);

      // Verificar si el archivo existe
      const routePath = path.join(
        __dirname,
        "routes",
        path.basename(route.file) + ".js"
      );
      if (!fs.existsSync(routePath)) {
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

// ✅ INICIAR SERVIDOR (VERSIÓN MEJORADA)
const startServer = async () => {
  try {
    console.log("🚀 Iniciando servidor...");
    console.log("🌍 Environment:", process.env.NODE_ENV);
    console.log(
      "🔗 Database URL:",
      process.env.DATABASE_URL ? "✅ Configurada" : "❌ No configurada"
    );

    let dbConnected = false;
    let AppConfig = null;

    // ✅ INTENTAR CONEXIÓN A BD (NO BLOQUEANTE)
    if (process.env.DATABASE_URL) {
      try {
        const { db } = require("./database/connection");
        console.log("🔌 Intentando conectar a la base de datos...");
        await db.authenticate();
        console.log("✅ Base de datos conectada");
        dbConnected = true;

        // ✅ CARGAR Y SINCRONIZAR MODELO AppConfig
        try {
          AppConfig = require("./models/AppConfig");
          console.log("🔄 Sincronizando modelo AppConfig...");

          await AppConfig.sync({ force: false, alter: true });
          console.log("✅ Modelo AppConfig sincronizado");

          // ✅ CREAR CONFIGURACIÓN POR DEFECTO SI NO EXISTE
          const existingConfig = await AppConfig.findOne();
          if (!existingConfig) {
            console.log("📝 Creando configuración por defecto...");
            await AppConfig.create({
              app_name: "Minimarket Digital",
              app_description: "Tu tienda de confianza",
              theme: "blue",
              whatsapp_number: "+5491112345678",
              business_hours: "Lun-Vie: 8:00 - 20:00",
              business_address: "Av. Principal 123",
              logo_url: null,
            });
            console.log("✅ Configuración por defecto creada");
          } else {
            console.log(
              "✅ Configuración existente encontrada:",
              existingConfig.app_name
            );
          }
        } catch (modelError) {
          console.error("❌ Error con modelo AppConfig:", modelError.message);
        }

        // Sincronizar otros modelos solo en desarrollo
        if (process.env.NODE_ENV === "development" && dbConnected) {
          try {
            await db.sync({ force: false, alter: false });
            console.log("✅ Todos los modelos sincronizados");
          } catch (syncError) {
            console.log(
              "⚠️  Algunos modelos no se sincronizaron:",
              syncError.message
            );
          }
        }
      } catch (dbError) {
        console.log("❌ Error conectando a BD:", dbError.message);
        console.log("🔄 Continuando sin base de datos...");
        dbConnected = false;
      }
    } else {
      console.log("⚠️  No hay DATABASE_URL configurada - Iniciando sin BD");
    }

    // ✅ CARGAR RUTAS (SIEMPRE SE EJECUTA, CON O SIN BD)
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
        availableRoutes: [
          "GET /api/health (Estado del servidor)",
          "GET /api/app-config/public (Configuración pública)",
          "GET /api/products/getProducts (Productos públicos)",
          "GET /api/categories/getCategories (Categorías públicas)",
          "POST /api/auth (Login público)",
          "PUT /api/app-config (Configuración admin - requiere token)",
        ],
      });
    });

    // ✅ MANEJO GLOBAL DE ERRORES
    app.use((error, req, res, next) => {
      console.error("💥 Error global no manejado:", error);
      res.status(500).json({
        ok: false,
        msg: "Error interno del servidor",
        ...(process.env.NODE_ENV === "development" && {
          error: error.message,
          stack: error.stack,
        }),
      });
    });

    // ✅ INICIAR SERVIDOR
    app.listen(PORT, () => {
      console.log(`\n🎉 🎉 🎉 SERVIDOR INICIADO EXITOSAMENTE 🎉 🎉 🎉`);
      console.log(`📍 Puerto: ${PORT}`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
      console.log(
        `🗄️  Base de datos: ${dbConnected ? "✅ Conectada" : "❌ No conectada"}`
      );
      console.log(`🔗 URL: https://minimarket-backend-6z9m.onrender.com`);
      console.log(
        `📊 Health Check: https://minimarket-backend-6z9m.onrender.com/api/health`
      );

      console.log(`\n📋 RUTAS DISPONIBLES:`);
      console.log(`   🔓 PÚBLICAS (sin token):`);
      console.log(`      GET  /api/health`);
      console.log(`      GET  /api/app-config/public`);
      console.log(`      GET  /api/products/getProducts`);
      console.log(`      GET  /api/categories/getCategories`);
      console.log(`      GET  /api/featured-products/public`);
      console.log(`      POST /api/auth (login)`);

      console.log(`\n   🔐 PROTEGIDAS (requieren token):`);
      console.log(`      PUT  /api/app-config`);
      console.log(`      GET  /api/app-config`);
      console.log(`      GET  /api/auth/renew`);
      console.log(`      GET  /api/auth/getUsers`);
    });
  } catch (error) {
    console.error("❌ Error crítico iniciando servidor:", error);
    process.exit(1);
  }
};

// ✅ INICIAR TODO
startServer();
