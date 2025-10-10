require("dotenv").config(); // ← AGREGAR ESTO
const jwt = require("jsonwebtoken");
const { response } = require("express");

const validarJWT = (req, res = response, next) => {
  const token = req.header("x-token");

  if (!token) {
    return res.status(401).json({
      ok: false,
      msg: "Lo sentimos no se encuentra el token",
    });
  }

  try {
    // ✅ VERIFICAR QUE ESTA VARIABLE EXISTA
    const jwtSecret = process.env.SECRET_JWT_SEED || process.env.FIRMA_TOKEN;

    if (!jwtSecret) {
      console.error("❌ No se encontró la clave JWT en variables de entorno");
      return res.status(500).json({
        ok: false,
        msg: "Error de configuración del servidor",
      });
    }

    const { uid, name } = jwt.verify(token, jwtSecret);

    req.uid = uid;
    req.name = name;

    next();
  } catch (error) {
    console.error("❌ Error verificando token:", error);
    return res.status(401).json({
      ok: false,
      msg: "Token no válido",
    });
  }
};

module.exports = {
  validarJWT,
};
