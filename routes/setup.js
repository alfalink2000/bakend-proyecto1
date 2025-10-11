// routes/setup.js - RUTA TEMPORAL
const { Router } = require("express");
const bcrypt = require("bcryptjs");
const { User } = require("../models/User");

const router = Router();

// ✅ RUTA TEMPORAL PARA CREAR ADMIN - ELIMINAR DESPUÉS DE USAR
router.post("/create-admin", async (req, res) => {
  try {
    console.log("🔧 Solicitando creación de usuario admin...");

    // Verificar si ya existe
    const existingAdmin = await User.findOne({
      where: { username: "admin" },
    });

    if (existingAdmin) {
      return res.json({
        ok: true,
        message: "⚠️ El usuario admin ya existe",
        user: {
          id: existingAdmin.id,
          username: existingAdmin.username,
          email: existingAdmin.email,
          is_active: existingAdmin.is_active,
        },
      });
    }

    // Crear admin
    const salt = bcrypt.genSaltSync();
    const passwordHash = bcrypt.hashSync("admin123456", salt);

    const adminUser = await User.create({
      username: "admin",
      password_hash: passwordHash,
      email: "admin@minimarket.com",
      full_name: "Administrador Principal",
      is_active: true,
    });

    console.log("✅ Usuario admin creado exitosamente");

    res.json({
      ok: true,
      message: "✅ Usuario admin creado exitosamente",
      user: {
        id: adminUser.id,
        username: adminUser.username,
        email: adminUser.email,
        password: "admin123456", // Solo se muestra esta vez
        is_active: adminUser.is_active,
      },
      warning: "⚠️ ELIMINA ESTA RUTA DESPUÉS DE USAR",
    });
  } catch (error) {
    console.error("❌ Error creando admin:", error);
    res.status(500).json({
      ok: false,
      message: "Error creando usuario admin",
      error: error.message,
    });
  }
});

module.exports = router;
