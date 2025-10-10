const jwt = require("jsonwebtoken");

const generarJWT = (uid, name) => {
  return new Promise((resolve, reject) => {
    const payload = { uid, name };

    // ✅ Verificar que la firma existe
    if (!process.env.FIRMA_TOKEN) {
      console.error(
        "❌ FIRMA_TOKEN no está definida en las variables de entorno"
      );
      return reject("Error de configuración del servidor");
    }

    jwt.sign(
      payload,
      process.env.FIRMA_TOKEN,
      {
        expiresIn: "2h",
      },
      (error, token) => {
        if (error) {
          console.log("❌ Error generando JWT:", error);
          reject("No se pudo generar el token");
        }

        resolve(token);
      }
    );
  });
};

module.exports = {
  generarJWT,
};
