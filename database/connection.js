// database/connection.js
const { Sequelize } = require("sequelize");

// Configuración optimizada para Supabase
const db = new Sequelize(process.env.DATABASE_URL, {
  dialect: "postgres",
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false,
    },
    connectTimeout: 30000, // 30 segundos
    keepAlive: true,
    keepAliveInitialDelay: 30000,
  },
  logging: process.env.NODE_ENV === "production" ? false : console.log,
  pool: {
    max: 5,
    min: 0,
    acquire: 60000, // Aumentado a 60 segundos
    idle: 20000,
    evict: 15000,
    handleDisconnects: true,
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

const connection = async () => {
  try {
    console.log("🔌 Intentando conectar a Supabase...");
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
    return false;
  }
};

module.exports = {
  connection,
  db,
};
