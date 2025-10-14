const { response } = require("express");
const bcrypt = require("bcryptjs");
const { generarJWT } = require("../helpers/jwt");
const ModeloUsuario = require("../models/User");

const crearUsuario = async (req, res = response) => {
  try {
    const { username, password_hash, email, full_name } = req.body;

    let usuario = await ModeloUsuario.findOne({ where: { username } });
    let mail = await ModeloUsuario.findOne({ where: { email } });

    if (usuario) {
      return res.status(400).json({
        ok: false,
        msg: "Ya existe un usuario con ese nombre",
      });
    }
    if (mail) {
      return res.status(400).json({
        ok: false,
        msg: "Ya existe un email con ese nombre",
      });
    }

    usuario = new ModeloUsuario(req.body);

    const salt = bcrypt.genSaltSync();
    usuario.password_hash = bcrypt.hashSync(password_hash, salt);

    await usuario.save();

    res.status(201).json({
      ok: true,
      id: usuario.id,
      username: usuario.username,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      ok: false,
      msg: "Por favor hable con el administrador",
    });
  }
};

const loginUsuario = async (req, res = response) => {
  try {
    console.log("🔐 Datos recibidos en login:", req.body);
    if (!usuario) {
      console.log("❌ Usuario no encontrado:", username);
      return res.status(400).json({
        ok: false,
        msg: "Usuario o contraseña incorrecta",
      });
    }
    // ✅ Validación básica
    if (!req.body.username || !req.body.password_hash) {
      return res.status(400).json({
        ok: false,
        msg: "Usuario y contraseña son requeridos",
      });
    }

    const { username, password_hash } = req.body;

    const usuario = await ModeloUsuario.findOne({
      where: { username },
    });

    if (!usuario) {
      return res.status(400).json({
        ok: false,
        msg: "Usuario o contraseña incorrecta",
      });
    }

    if (!usuario.is_active) {
      return res.status(400).json({
        ok: false,
        msg: "Usuario desactivado",
      });
    }

    // ✅ Verificar que password_hash existe en el usuario
    if (!usuario.password_hash) {
      console.error("❌ Usuario no tiene password_hash:", usuario.id);
      return res.status(500).json({
        ok: false,
        msg: "Error interno del servidor",
      });
    }

    const validPassword = bcrypt.compareSync(
      password_hash,
      usuario.password_hash
    );

    if (!validPassword) {
      return res.status(400).json({
        ok: false,
        msg: "Usuario o contraseña incorrecta",
      });
    }

    const token = await generarJWT(usuario.id, usuario.username);

    console.log("✅ Login exitoso para usuario:", usuario.username);

    res.status(200).json({
      ok: true,
      msg: "Acceso Concedido",
      id: usuario.id,
      username: usuario.username,
      token,
    });
  } catch (error) {
    console.error("❌ Error en login:", error);
    res.status(500).json({
      ok: false,
      msg: "Error interno del servidor",
      // ✅ Solo mostrar detalles en desarrollo
      ...(process.env.NODE_ENV === "development" && {
        error: error.message,
        stack: error.stack,
      }),
    });
  }
};

// ✅ CORREGIDO: actualizarUser para aceptar los campos correctos
const actualizarUser = async (req, res = response) => {
  try {
    console.log("🔄 Datos recibidos para actualizar:", req.body);

    // ✅ CORREGIR: Usar los mismos campos que envía el frontend
    const { id, username, email, full_name, password_user, new_password } =
      req.body;

    console.log("📝 Campos recibidos:", { id, username, email, full_name });

    const usuario = await ModeloUsuario.findByPk(id);

    if (!usuario) {
      return res.status(404).json({
        ok: false,
        msg: "Usuario no encontrado",
      });
    }

    // ✅ VERIFICAR CONTRASEÑA SOLO SI SE QUIERE CAMBIAR
    if (password_user && new_password) {
      console.log("🔐 Verificando contraseña actual...");

      const validPassword = bcrypt.compareSync(
        password_user,
        usuario.password_hash
      );

      if (!validPassword) {
        return res.status(400).json({
          ok: false,
          msg: "La contraseña actual no es correcta",
        });
      }

      // ✅ ACTUALIZAR CONTRASEÑA
      const salt = bcrypt.genSaltSync();
      usuario.password_hash = bcrypt.hashSync(new_password, salt);
      console.log("✅ Contraseña actualizada");
    }

    // ✅ ACTUALIZAR CAMPOS BÁSICOS
    // Verificar qué campos se enviaron para actualizar
    if (username !== undefined) usuario.username = username;
    if (email !== undefined) usuario.email = email;
    if (full_name !== undefined) usuario.full_name = full_name;

    await usuario.save();

    console.log("✅ Usuario actualizado exitosamente:", {
      id: usuario.id,
      username: usuario.username,
      email: usuario.email,
      full_name: usuario.full_name,
    });

    res.status(200).json({
      ok: true,
      msg: "Usuario actualizado correctamente",
      usuario: {
        id: usuario.id,
        username: usuario.username,
        email: usuario.email,
        full_name: usuario.full_name,
        is_active: usuario.is_active,
        createdAt: usuario.createdAt,
        updatedAt: usuario.updatedAt,
      },
    });
  } catch (error) {
    console.error("❌ Error en actualizarUser:", error);
    res.status(500).json({
      ok: false,
      msg: "Error interno del servidor al actualizar usuario",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

const getUsuarios = async (req, res = response) => {
  try {
    const usuarios = await ModeloUsuario.findAll({
      attributes: { exclude: ["password_hash"] }, // ✅ EXCLUIR CONTRASEÑA
    });

    res.status(200).json({
      ok: true,
      msg: "Usuarios cargados",
      usuarios: usuarios,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      ok: false,
      msg: "Ha ocurrido un error, no se ha podido obtener correctamente los datos de los usuarios",
    });
  }
};

const revalidarToken = async (req, res = response) => {
  const { uid, name } = req;

  const token = await generarJWT(uid, name);

  res.status(201).json({
    ok: true,
    msg: "renew ok",
    uid: uid,
    name: name,
    token,
  });
};

module.exports = {
  crearUsuario,
  loginUsuario,
  actualizarUser,
  revalidarToken,
  getUsuarios,
};
