// resetAdminPassword.js
require("dotenv").config();
const bcrypt = require("bcryptjs");
const { db } = require("./database/connection");
const User = require("./models/User");

async function resetAdminPassword() {
  try {
    await db.authenticate();
    console.log("✅ Conectado a la base de datos");

    // Buscar usuario admin
    const adminUser = await User.findOne({ where: { username: "admin" } });

    if (!adminUser) {
      console.log("❌ Usuario admin no encontrado");
      process.exit(1);
    }

    console.log("🔑 Reseteando contraseña...");

    // Generar un hash CORRECTO para "admin"
    const salt = bcrypt.genSaltSync();
    const hashedPassword = bcrypt.hashSync("admin", salt);

    console.log("📤 Nuevo hash generado:", hashedPassword);
    console.log("📏 Longitud del nuevo hash:", hashedPassword.length);

    // Actualizar la contraseña
    adminUser.password_hash = hashedPassword;
    adminUser.is_active = true;
    await adminUser.save();

    console.log("✅ Contraseña de admin reseteada exitosamente:");
    console.log("👤 Usuario: admin");
    console.log("🔑 Nueva contraseña: admin");
    console.log("💾 Hash actualizado en la base de datos");

    // Verificar que el nuevo hash funciona
    const isValid = bcrypt.compareSync("admin", hashedPassword);
    console.log("✅ Verificación del nuevo hash:", isValid);

    process.exit(0);
  } catch (error) {
    console.error("❌ Error reseteando contraseña:", error);
    process.exit(1);
  }
}

resetAdminPassword();
