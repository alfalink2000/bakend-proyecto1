// database/connection.js
const { Sequelize } = require("sequelize");

console.log("🔧 Configurando conexión a Supabase...");

// Configuración optimizada para Supabase en Render
const db = new Sequelize(process.env.DATABASE_URL, {
  dialect: "postgres",
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false, // ✅ ESTO ES CLAVE
    },
    connectTimeout: 30000,
    keepAlive: true,
  },
  logging: process.env.NODE_ENV === "production" ? false : console.log,
  pool: {
    max: 5,
    min: 0,
    acquire: 60000,
    idle: 20000,
  },
  retry: {
    max: 3,
    timeout: 30000,
  },
  define: {
    timestamps: true,
    underscored: false,
  },
});

// Función de conexión mejorada
const connection = async () => {
  try {
    console.log("🔌 Intentando conectar a Supabase...");
    console.log("🔗 Host:", new URL(process.env.DATABASE_URL).hostname);

    await db.authenticate();
    console.log("✅ Database PostgreSQL Conectada Correctamente a Supabase");
    return true;
  } catch (error) {
    console.error("❌ Error al conectar con Supabase:", error.message);
    console.error(
      "🔗 URL usada:",
      process.env.DATABASE_URL
        ? process.env.DATABASE_URL.replace(/:[^:]*@/, ":****@")
        : "No configurada"
    );

    // Debug adicional
    if (error.original) {
      console.error("🔍 Error original:", error.original.message);
    }
    return false;
  }
};

module.exports = {
  connection,
  db,
};
