// database/connection.js
const { Sequelize } = require("sequelize");
require("dotenv").config();

// Configuración para PostgreSQL/Supabase
const db = new Sequelize(process.env.DATABASE_URL, {
  dialect: "postgres",
  dialectOptions: {
    ssl:
      process.env.NODE_ENV === "production"
        ? {
            require: true,
            rejectUnauthorized: false,
          }
        : false,
  },
  logging: process.env.NODE_ENV === "development" ? console.log : false,
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
  define: {
    timestamps: true,
    underscored: false,
  },
});

const connection = async () => {
  try {
    await db.authenticate();
    console.log("✅ Database PostgreSQL Conectada Correctamente");
  } catch (error) {
    console.error("❌ Error al conectar con la base de datos:", error.message);
    throw new Error("Error al inicializar la base de datos");
  }
};

module.exports = {
  connection,
  db,
};
