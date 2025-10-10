const { response } = require("express");
const { validationResult } = require("express-validator");

const validarCampos = (req, res = response, next) => {
  //Manejo de errores
  const error = validationResult(req);

  if (!error.isEmpty()) {
    return res.status(400).json({
      //Para que el error dado sea bad request
      ok: false,
      error: error.mapped(), //Hace una lista de errores encontrados
    });
  }

  next(); //No es mas que al no encontrar el error prosigue al siguiente check
};

module.exports = {
  validarCampos,
};
