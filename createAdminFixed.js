// createAdminFixed.js
require("dotenv").config();
const bcrypt = require("bcryptjs");
const { db } = require("./database/connection");
const User = require("./models/User");

async function createAdminUser() {
  try {
    await db.authenticate();
    console.log("✅ Conectado a la base de datos");

    // Verificar si ya existe
    const existingAdmin = await User.findOne({ where: { username: "admin" } });

    if (existingAdmin) {
      console.log("⚠️ El usuario admin ya existe, eliminando...");
      await existingAdmin.destroy();
      console.log("✅ Usuario anterior eliminado");
    }

    // Crear hash de la contraseña "admin"
    const salt = bcrypt.genSaltSync();
    const hashedPassword = bcrypt.hashSync("admin", salt);

    console.log('🔑 Hash generado para "admin":', hashedPassword);

    // Crear usuario admin
    const adminUser = await User.create({
      username: "admin",
      password_hash: hashedPassword,
      email: "admin@minimarket.com",
      full_name: "Administrador Principal",
      is_active: true,
    });

    console.log("✅ Usuario administrador creado exitosamente:");
    console.log("👤 Usuario: admin");
    console.log("🔑 Contraseña: admin");
    console.log("📧 Email: admin@minimarket.com");
    console.log("🆔 ID:", adminUser.id);

    process.exit(0);
  } catch (error) {
    console.error("❌ Error creando usuario admin:", error);
    process.exit(1);
  }
}

createAdminUser();
