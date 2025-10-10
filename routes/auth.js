const { Router } = require("express");
const { check } = require("express-validator");
const { validarCampos } = require("../middlewares/validar-campos");
const { validarJWT } = require("../middlewares/revalidar-jwt");
const {
  securityMiddleware,
  loginLimiter,
  apiLimiter,
} = require("../middlewares/security");

// ✅ IMPORTAR ModeloUsuario que falta
const ModeloUsuario = require("../models/User");

const {
  crearUsuario,
  loginUsuario,
  actualizarUser,
  revalidarToken,
  getUsuarios,
} = require("../controllers/auth");

const router = Router();

// ✅ Aplicar middlewares de seguridad globales
router.use(securityMiddleware);

// ✅ Ruta para login - SIMPLIFICADA (eliminar validaciones duplicadas)
router.post(
  "/",
  loginLimiter,
  [
    check("username", "El nombre de usuario es obligatorio").not().isEmpty(),
    check("password_hash", "La contraseña es obligatoria").not().isEmpty(),
    validarCampos,
  ],
  loginUsuario
);

// ✅ Ruta para crear usuario
router.post(
  "/new",
  apiLimiter,
  [
    check("username", "El nombre de usuario es obligatorio").not().isEmpty(),
    check(
      "password_hash",
      "El password debe contener al menos 8 digitos"
    ).isLength({ min: 8 }),
    check("email", "El email es obligatorio").isEmail(),
    validarCampos,
  ],
  crearUsuario
);

// ✅ Aplicar rate limiting general
router.use(apiLimiter);

// ✅ Ruta para actualizar usuario
router.put(
  "/update",
  validarJWT,
  [
    check("id", "El ID es obligatorio").not().isEmpty(),
    check("username", "El nombre de usuario es obligatorio").not().isEmpty(),
    check("email", "El email es obligatorio").isEmail(),
    check("full_name", "El nombre completo es obligatorio").not().isEmpty(),
    validarCampos,
  ],
  actualizarUser
);

// ✅ Rutas restantes...
router.put("/toggle-status/:id", validarJWT, async (req, res) => {
  try {
    const { id } = req.params;
    const { is_active } = req.body;

    console.log(`🔄 Cambiando estado usuario ${id} a:`, is_active);

    const usuario = await ModeloUsuario.findByPk(id);

    if (!usuario) {
      return res.status(404).json({
        ok: false,
        msg: "Usuario no encontrado",
      });
    }

    if (!is_active) {
      const usuariosActivos = await ModeloUsuario.count({
        where: { is_active: true },
      });

      if (usuariosActivos <= 1) {
        return res.status(400).json({
          ok: false,
          msg: "No se puede desactivar el último usuario activo",
        });
      }
    }

    usuario.is_active = is_active;
    await usuario.save();

    console.log(`✅ Estado usuario ${id} cambiado a:`, is_active);

    res.status(200).json({
      ok: true,
      msg: `Usuario ${is_active ? "activado" : "desactivado"} correctamente`,
      usuario: {
        id: usuario.id,
        username: usuario.username,
        email: usuario.email,
        is_active: usuario.is_active,
      },
    });
  } catch (error) {
    console.error("❌ Error cambiando estado de usuario:", error);
    res.status(500).json({
      ok: false,
      msg: "Error interno del servidor",
    });
  }
});

router.delete("/delete/:id", validarJWT, async (req, res) => {
  try {
    const { id } = req.params;

    console.log(`🗑️ Intentando eliminar usuario: ${id}`);

    const usuario = await ModeloUsuario.findByPk(id);

    if (!usuario) {
      return res.status(404).json({
        ok: false,
        msg: "Usuario no encontrado",
      });
    }

    const totalUsuarios = await ModeloUsuario.count();
    if (totalUsuarios <= 1) {
      return res.status(400).json({
        ok: false,
        msg: "No se puede eliminar el último usuario",
      });
    }

    await usuario.destroy();

    console.log(`✅ Usuario ${id} eliminado correctamente`);

    res.status(200).json({
      ok: true,
      msg: "Usuario eliminado correctamente",
    });
  } catch (error) {
    console.error("❌ Error eliminando usuario:", error);
    res.status(500).json({
      ok: false,
      msg: "Error interno del servidor",
    });
  }
});

router.get("/renew", validarJWT, revalidarToken);
router.get("/getUsers", validarJWT, getUsuarios);

module.exports = router;
