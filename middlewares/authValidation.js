const { check } = require("express-validator");
const ModeloUsuario = require("../models/User");

// Validación mejorada para login
const validateLogin = [
  check("username")
    .notEmpty()
    .withMessage("El usuario es obligatorio")
    .isLength({ min: 3, max: 20 })
    .withMessage("El usuario debe tener entre 3 y 20 caracteres")
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage(
      "El usuario solo puede contener letras, números y guiones bajos"
    )
    .custom(async (username) => {
      const user = await ModeloUsuario.findOne({ where: { username } });
      if (!user) {
        throw new Error("Credenciales inválidas");
      }
      return true;
    }),

  check("password_hash")
    .notEmpty()
    .withMessage("La contraseña es obligatoria")
    .isLength({ min: 8 })
    .withMessage("La contraseña debe tener al menos 8 caracteres")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage(
      "La contraseña debe contener al menos una mayúscula, una minúscula y un número"
    ),
];

// Validación para crear usuario (más estricta)
const validateCreateUser = [
  check("username")
    .notEmpty()
    .withMessage("El usuario es obligatorio")
    .isLength({ min: 3, max: 20 })
    .withMessage("El usuario debe tener entre 3 y 20 caracteres")
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage(
      "El usuario solo puede contener letras, números y guiones bajos"
    )
    .custom(async (username) => {
      const user = await ModeloUsuario.findOne({ where: { username } });
      if (user) {
        throw new Error("El usuario ya existe");
      }
      return true;
    }),

  check("email")
    .isEmail()
    .withMessage("Debe ser un email válido")
    .normalizeEmail(),

  check("password_hash")
    .isLength({ min: 8 })
    .withMessage("La contraseña debe tener al menos 8 caracteres")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage(
      "La contraseña debe contener al menos una mayúscula, una minúscula, un número y un carácter especial"
    ),
];

module.exports = {
  validateLogin,
  validateCreateUser,
};
