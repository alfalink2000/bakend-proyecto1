const { Sequelize } = require("sequelize");
require("dotenv").config();

const db = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: "mysql",
    port: process.env.DB_PORT,
    logging: false,
  }
);

const connection = async () => {
  try {
    db.authenticate(); //Verifica que se conecte correctamente
    console.log("Database Conectada"); //Si se conecta envia este mensaje por consola
  } catch (error) {
    throw new Error("Error al inicializar la base de datos");
  }
};

module.exports = {
  connection,
  db,
};
