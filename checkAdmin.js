// checkAdmin.js
require("dotenv").config();
const { db } = require("./database/connection");
const User = require("./models/User");

async function checkAdminUser() {
  try {
    await db.authenticate();
    console.log("✅ Conectado a la base de datos");

    // Buscar usuario admin
    const adminUser = await User.findOne({ where: { username: "admin" } });

    if (adminUser) {
      console.log("✅ Usuario admin encontrado:");
      console.log("👤 ID:", adminUser.id);
      console.log("👤 Username:", adminUser.username);
      console.log("📧 Email:", adminUser.email);
      console.log("🔐 Password hash:", adminUser.password_hash);
      console.log("🔐 Password hash length:", adminUser.password_hash.length);
      console.log("🟢 Activo:", adminUser.is_active);
      console.log("📅 Creado:", adminUser.created_at);
    } else {
      console.log("❌ Usuario admin NO encontrado en la base de datos");
    }

    // Listar todos los usuarios
    const allUsers = await User.findAll();
    console.log("\n📋 Todos los usuarios en la base de datos:");
    allUsers.forEach((user) => {
      console.log(
        `- ${user.username} (${user.email}) - Activo: ${user.is_active}`
      );
    });

    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

checkAdminUser();
